from numbers import Integral, Real

import numpy as np
import scipy.sparse as sp
from joblib import effective_n_jobs
from scipy.special import gammaln, logsumexp

from ..base import ( # type: ignore
    BaseEstimator,
    ClassNamePrefixFeaturesOutMixin,
    TransformerMixin,
    _fit_context,
)
from ..utils import check_random_state, gen_batches, gen_even_slices # type: ignore
from ..utils._param_validation import Interval, StrOptions # type: ignore
from ..utils.parallel import Parallel, delayed # type: ignore
from ..utils.validation import check_is_fitted, check_non_negative # type: ignore
from ._online_lda_fast import ( # type: ignore
    _dirichlet_expectation_1d as cy_dirichlet_expectation_1d,
)
from ._online_lda_fast import ( # type: ignore
    _dirichlet_expectation_2d,
)
from ._online_lda_fast import ( # type: ignore
    mean_change as cy_mean_change,
)

EPS = np.finfo(float).eps


def _update_doc_distribution(
    X,
    exp_topic_word_distr,
    doc_topic_prior,
    max_doc_update_iter,
    mean_change_tol,
    cal_sstats,
    random_state,
):
    is_sparse_x = sp.issparse(X)
    n_samples, n_features = X.shape
    n_topics = exp_topic_word_distr.shape[0]

    if random_state:
        doc_topic_distr = random_state.gamma(100.0, 0.01, (n_samples, n_topics)).astype(
            X.dtype, copy=False
        )
    else:
        doc_topic_distr = np.ones((n_samples, n_topics), dtype=X.dtype)

    # In the literature, this is `exp(E[log(theta)])`
    exp_doc_topic = np.exp(_dirichlet_expectation_2d(doc_topic_distr))

    # diff on `component_` (only calculate it when `cal_diff` is True)
    suff_stats = (
        np.zeros(exp_topic_word_distr.shape, dtype=X.dtype) if cal_sstats else None
    )

    if is_sparse_x:
        X_data = X.data
        X_indices = X.indices
        X_indptr = X.indptr

    ctype = "float" if X.dtype == np.float32 else "double"
    mean_change = cy_mean_change[ctype]
    dirichlet_expectation_1d = cy_dirichlet_expectation_1d[ctype]
    eps = np.finfo(X.dtype).eps

    for idx_d in range(n_samples):
        if is_sparse_x:
            ids = X_indices[X_indptr[idx_d] : X_indptr[idx_d + 1]]
            cnts = X_data[X_indptr[idx_d] : X_indptr[idx_d + 1]]
        else:
            ids = np.nonzero(X[idx_d, :])[0]
            cnts = X[idx_d, ids]

        doc_topic_d = doc_topic_distr[idx_d, :]
        # The next one is a copy, since the inner loop overwrites it.
        exp_doc_topic_d = exp_doc_topic[idx_d, :].copy()
        exp_topic_word_d = exp_topic_word_distr[:, ids]

        # Iterate between `doc_topic_d` and `norm_phi` until convergence
        for _ in range(0, max_doc_update_iter):
            last_d = doc_topic_d

            # The optimal phi_{dwk} is proportional to
            # exp(E[log(theta_{dk})]) * exp(E[log(beta_{dw})]).
            norm_phi = np.dot(exp_doc_topic_d, exp_topic_word_d) + eps

            doc_topic_d = exp_doc_topic_d * np.dot(cnts / norm_phi, exp_topic_word_d.T)
            # Note: adds doc_topic_prior to doc_topic_d, in-place.
            dirichlet_expectation_1d(doc_topic_d, doc_topic_prior, exp_doc_topic_d)

            if mean_change(last_d, doc_topic_d) < mean_change_tol:
                break
        doc_topic_distr[idx_d, :] = doc_topic_d

        # Contribution of document d to the expected sufficient
        # statistics for the M step.
        if cal_sstats:
            norm_phi = np.dot(exp_doc_topic_d, exp_topic_word_d) + eps
            suff_stats[:, ids] += np.outer(exp_doc_topic_d, cnts / norm_phi)

    return (doc_topic_distr, suff_stats)


class LatentDirichletAllocation(
    ClassNamePrefixFeaturesOutMixin, TransformerMixin, BaseEstimator
):

    _parameter_constraints: dict = {
        "n_components": [Interval(Integral, 0, None, closed="neither")],
        "doc_topic_prior": [None, Interval(Real, 0, 1, closed="both")],
        "topic_word_prior": [None, Interval(Real, 0, 1, closed="both")],
        "learning_method": [StrOptions({"batch", "online"})],
        "learning_decay": [Interval(Real, 0, 1, closed="both")],
        "learning_offset": [Interval(Real, 1.0, None, closed="left")],
        "max_iter": [Interval(Integral, 0, None, closed="left")],
        "batch_size": [Interval(Integral, 0, None, closed="neither")],
        "evaluate_every": [Interval(Integral, None, None, closed="neither")],
        "total_samples": [Interval(Real, 0, None, closed="neither")],
        "perp_tol": [Interval(Real, 0, None, closed="left")],
        "mean_change_tol": [Interval(Real, 0, None, closed="left")],
        "max_doc_update_iter": [Interval(Integral, 0, None, closed="left")],
        "n_jobs": [None, Integral],
        "verbose": ["verbose"],
        "random_state": ["random_state"],
    }

    def __init__(
        self,
        n_components=10,
        *,
        doc_topic_prior=None,
        topic_word_prior=None,
        learning_method="batch",
        learning_decay=0.7,
        learning_offset=10.0,
        max_iter=10,
        batch_size=128,
        evaluate_every=-1,
        total_samples=1e6,
        perp_tol=1e-1,
        mean_change_tol=1e-3,
        max_doc_update_iter=100,
        n_jobs=None,
        verbose=0,
        random_state=None,
    ):
        self.n_components = n_components
        self.doc_topic_prior = doc_topic_prior
        self.topic_word_prior = topic_word_prior
        self.learning_method = learning_method
        self.learning_decay = learning_decay
        self.learning_offset = learning_offset
        self.max_iter = max_iter
        self.batch_size = batch_size
        self.evaluate_every = evaluate_every
        self.total_samples = total_samples
        self.perp_tol = perp_tol
        self.mean_change_tol = mean_change_tol
        self.max_doc_update_iter = max_doc_update_iter
        self.n_jobs = n_jobs
        self.verbose = verbose
        self.random_state = random_state

    def _init_latent_vars(self, n_features, dtype=np.float64):
        """Initialize latent variables."""

        self.random_state_ = check_random_state(self.random_state)
        self.n_batch_iter_ = 1
        self.n_iter_ = 0

        if self.doc_topic_prior is None:
            self.doc_topic_prior_ = 1.0 / self.n_components
        else:
            self.doc_topic_prior_ = self.doc_topic_prior

        if self.topic_word_prior is None:
            self.topic_word_prior_ = 1.0 / self.n_components
        else:
            self.topic_word_prior_ = self.topic_word_prior

        init_gamma = 100.0
        init_var = 1.0 / init_gamma
        # In the literature, this is called `lambda`
        self.components_ = self.random_state_.gamma(
            init_gamma, init_var, (self.n_components, n_features)
        ).astype(dtype, copy=False)

        # In the literature, this is `exp(E[log(beta)])`
        self.exp_dirichlet_component_ = np.exp(
            _dirichlet_expectation_2d(self.components_)
        )

    def _e_step(self, X, cal_sstats, random_init, parallel=None):

        # Run e-step in parallel
        random_state = self.random_state_ if random_init else None

        # TODO: make Parallel._effective_n_jobs public instead?
        n_jobs = effective_n_jobs(self.n_jobs)
        if parallel is None:
            parallel = Parallel(n_jobs=n_jobs, verbose=max(0, self.verbose - 1))
        results = parallel(
            delayed(_update_doc_distribution)(
                X[idx_slice, :],
                self.exp_dirichlet_component_,
                self.doc_topic_prior_,
                self.max_doc_update_iter,
                self.mean_change_tol,
                cal_sstats,
                random_state,
            )
            for idx_slice in gen_even_slices(X.shape[0], n_jobs)
        )

        # merge result
        doc_topics, sstats_list = zip(*results)
        doc_topic_distr = np.vstack(doc_topics)

        if cal_sstats:
            # This step finishes computing the sufficient statistics for the
            # M-step.
            suff_stats = np.zeros(self.components_.shape, dtype=self.components_.dtype)
            for sstats in sstats_list:
                suff_stats += sstats
            suff_stats *= self.exp_dirichlet_component_
        else:
            suff_stats = None

        return (doc_topic_distr, suff_stats)

    def _em_step(self, X, total_samples, batch_update, parallel=None):
        # E-step
        _, suff_stats = self._e_step(
            X, cal_sstats=True, random_init=True, parallel=parallel
        )

        # M-step
        if batch_update:
            self.components_ = self.topic_word_prior_ + suff_stats
        else:
            # online update
            # In the literature, the weight is `rho`
            weight = np.power(
                self.learning_offset + self.n_batch_iter_, -self.learning_decay
            )
            doc_ratio = float(total_samples) / X.shape[0]
            self.components_ *= 1 - weight
            self.components_ += weight * (
                self.topic_word_prior_ + doc_ratio * suff_stats
            )

        # update `component_` related variables
        self.exp_dirichlet_component_ = np.exp(
            _dirichlet_expectation_2d(self.components_)
        )
        self.n_batch_iter_ += 1
        return

    def _more_tags(self):
        return {
            "preserves_dtype": [np.float64, np.float32],
            "requires_positive_X": True,
        }

    def _check_non_neg_array(self, X, reset_n_features, whom):
        dtype = [np.float64, np.float32] if reset_n_features else self.components_.dtype

        X = self._validate_data(
            X,
            reset=reset_n_features,
            accept_sparse="csr",
            dtype=dtype,
        )
        check_non_negative(X, whom)

        return X

    @_fit_context(prefer_skip_nested_validation=True)
    def partial_fit(self, X, y=None):
        first_time = not hasattr(self, "components_")

        X = self._check_non_neg_array(
            X, reset_n_features=first_time, whom="LatentDirichletAllocation.partial_fit"
        )
        n_samples, n_features = X.shape
        batch_size = self.batch_size

        # initialize parameters or check
        if first_time:
            self._init_latent_vars(n_features, dtype=X.dtype)

        if n_features != self.components_.shape[1]:
            raise ValueError(
                "The provided data has %d dimensions while "
                "the model was trained with feature size %d."
                % (n_features, self.components_.shape[1])
            )

        n_jobs = effective_n_jobs(self.n_jobs)
        with Parallel(n_jobs=n_jobs, verbose=max(0, self.verbose - 1)) as parallel:
            for idx_slice in gen_batches(n_samples, batch_size):
                self._em_step(
                    X[idx_slice, :],
                    total_samples=self.total_samples,
                    batch_update=False,
                    parallel=parallel,
                )

        return self

    @_fit_context(prefer_skip_nested_validation=True)
    def fit(self, X, y=None):
       
        X = self._check_non_neg_array(
            X, reset_n_features=True, whom="LatentDirichletAllocation.fit"
        )
        n_samples, n_features = X.shape
        max_iter = self.max_iter
        evaluate_every = self.evaluate_every
        learning_method = self.learning_method

        batch_size = self.batch_size

        # initialize parameters
        self._init_latent_vars(n_features, dtype=X.dtype)
        # change to perplexity later
        last_bound = None
        n_jobs = effective_n_jobs(self.n_jobs)
        with Parallel(n_jobs=n_jobs, verbose=max(0, self.verbose - 1)) as parallel:
            for i in range(max_iter):
                if learning_method == "online":
                    for idx_slice in gen_batches(n_samples, batch_size):
                        self._em_step(
                            X[idx_slice, :],
                            total_samples=n_samples,
                            batch_update=False,
                            parallel=parallel,
                        )
                else:
                    # batch update
                    self._em_step(
                        X, total_samples=n_samples, batch_update=True, parallel=parallel
                    )

                # check perplexity
                if evaluate_every > 0 and (i + 1) % evaluate_every == 0:
                    doc_topics_distr, _ = self._e_step(
                        X, cal_sstats=False, random_init=False, parallel=parallel
                    )
                    bound = self._perplexity_precomp_distr(
                        X, doc_topics_distr, sub_sampling=False
                    )
                    if self.verbose:
                        print(
                            "iteration: %d of max_iter: %d, perplexity: %.4f"
                            % (i + 1, max_iter, bound)
                        )

                    if last_bound and abs(last_bound - bound) < self.perp_tol:
                        break
                    last_bound = bound

                elif self.verbose:
                    print("iteration: %d of max_iter: %d" % (i + 1, max_iter))
                self.n_iter_ += 1

        # calculate final perplexity value on train set
        doc_topics_distr, _ = self._e_step(
            X, cal_sstats=False, random_init=False, parallel=parallel
        )
        self.bound_ = self._perplexity_precomp_distr(
            X, doc_topics_distr, sub_sampling=False
        )

        return self

    def _unnormalized_transform(self, X):
        doc_topic_distr, _ = self._e_step(X, cal_sstats=False, random_init=False)

        return doc_topic_distr

    def transform(self, X):
        check_is_fitted(self)
        X = self._check_non_neg_array(
            X, reset_n_features=False, whom="LatentDirichletAllocation.transform"
        )
        doc_topic_distr = self._unnormalized_transform(X)
        doc_topic_distr /= doc_topic_distr.sum(axis=1)[:, np.newaxis]
        return doc_topic_distr

    def _approx_bound(self, X, doc_topic_distr, sub_sampling):

        def _loglikelihood(prior, distr, dirichlet_distr, size):
            # calculate log-likelihood
            score = np.sum((prior - distr) * dirichlet_distr)
            score += np.sum(gammaln(distr) - gammaln(prior))
            score += np.sum(gammaln(prior * size) - gammaln(np.sum(distr, 1)))
            return score

        is_sparse_x = sp.issparse(X)
        n_samples, n_components = doc_topic_distr.shape
        n_features = self.components_.shape[1]
        score = 0

        dirichlet_doc_topic = _dirichlet_expectation_2d(doc_topic_distr)
        dirichlet_component_ = _dirichlet_expectation_2d(self.components_)
        doc_topic_prior = self.doc_topic_prior_
        topic_word_prior = self.topic_word_prior_

        if is_sparse_x:
            X_data = X.data
            X_indices = X.indices
            X_indptr = X.indptr

        # E[log p(docs | theta, beta)]
        for idx_d in range(0, n_samples):
            if is_sparse_x:
                ids = X_indices[X_indptr[idx_d] : X_indptr[idx_d + 1]]
                cnts = X_data[X_indptr[idx_d] : X_indptr[idx_d + 1]]
            else:
                ids = np.nonzero(X[idx_d, :])[0]
                cnts = X[idx_d, ids]
            temp = (
                dirichlet_doc_topic[idx_d, :, np.newaxis] + dirichlet_component_[:, ids]
            )
            norm_phi = logsumexp(temp, axis=0)
            score += np.dot(cnts, norm_phi)

        # compute E[log p(theta | alpha) - log q(theta | gamma)]
        score += _loglikelihood(
            doc_topic_prior, doc_topic_distr, dirichlet_doc_topic, self.n_components
        )

        # Compensate for the subsampling of the population of documents
        if sub_sampling:
            doc_ratio = float(self.total_samples) / n_samples
            score *= doc_ratio

        # E[log p(beta | eta) - log q (beta | lambda)]
        score += _loglikelihood(
            topic_word_prior, self.components_, dirichlet_component_, n_features
        )

        return score

    def score(self, X, y=None):
        check_is_fitted(self)
        X = self._check_non_neg_array(
            X, reset_n_features=False, whom="LatentDirichletAllocation.score"
        )

        doc_topic_distr = self._unnormalized_transform(X)
        score = self._approx_bound(X, doc_topic_distr, sub_sampling=False)
        return score

    def _perplexity_precomp_distr(self, X, doc_topic_distr=None, sub_sampling=False):
        if doc_topic_distr is None:
            doc_topic_distr = self._unnormalized_transform(X)
        else:
            n_samples, n_components = doc_topic_distr.shape
            if n_samples != X.shape[0]:
                raise ValueError(
                    "Number of samples in X and doc_topic_distr do not match."
                )

            if n_components != self.n_components:
                raise ValueError("Number of topics does not match.")

        current_samples = X.shape[0]
        bound = self._approx_bound(X, doc_topic_distr, sub_sampling)

        if sub_sampling:
            word_cnt = X.sum() * (float(self.total_samples) / current_samples)
        else:
            word_cnt = X.sum()
        perword_bound = bound / word_cnt

        return np.exp(-1.0 * perword_bound)

    def perplexity(self, X, sub_sampling=False):
        check_is_fitted(self)
        X = self._check_non_neg_array(
            X, reset_n_features=True, whom="LatentDirichletAllocation.perplexity"
        )
        return self._perplexity_precomp_distr(X, sub_sampling=sub_sampling)

    @property
    def _n_features_out(self):
        """Number of transformed output features."""
        return self.components_.shape[0]
