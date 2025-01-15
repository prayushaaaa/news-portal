from numbers import Integral, Real

import numpy as np

from ..base import BaseEstimator, OutlierMixin, RegressorMixin, _fit_context # type: ignore 
from ..linear_model._base import LinearClassifierMixin, LinearModel, SparseCoefMixin #type: ignore
from ..utils._param_validation import Interval, StrOptions #type: ignore
from ..utils.multiclass import check_classification_targets #type: ignore
from ..utils.validation import _num_samples #type: ignore
from ._base import BaseLibSVM, BaseSVC, _fit_liblinear, _get_liblinear_solver_type #type: ignore


def _validate_dual_parameter(dual, loss, penalty, multi_class, X):
    """Helper function to assign the value of dual parameter."""
    if dual == "auto":
        if X.shape[0] < X.shape[1]:
            try:
                _get_liblinear_solver_type(multi_class, penalty, loss, True)
                return True
            except ValueError:  # dual not supported for the combination
                return False
        else:
            try:
                _get_liblinear_solver_type(multi_class, penalty, loss, False)
                return False
            except ValueError:  # primal not supported by the combination
                return True
    else:
        return dual


class LinearSVC(LinearClassifierMixin, SparseCoefMixin, BaseEstimator):

    _parameter_constraints: dict = {
        "penalty": [StrOptions({"l1", "l2"})],
        "loss": [StrOptions({"hinge", "squared_hinge"})],
        "dual": ["boolean", StrOptions({"auto"})],
        "tol": [Interval(Real, 0.0, None, closed="neither")],
        "C": [Interval(Real, 0.0, None, closed="neither")],
        "multi_class": [StrOptions({"ovr", "crammer_singer"})],
        "fit_intercept": ["boolean"],
        "intercept_scaling": [Interval(Real, 0, None, closed="neither")],
        "class_weight": [None, dict, StrOptions({"balanced"})],
        "verbose": ["verbose"],
        "random_state": ["random_state"],
        "max_iter": [Interval(Integral, 0, None, closed="left")],
    }

    def __init__(
        self,
        penalty="l2",
        loss="squared_hinge",
        *,
        dual="auto",
        tol=1e-4,
        C=1.0,
        multi_class="ovr",
        fit_intercept=True,
        intercept_scaling=1,
        class_weight=None,
        verbose=0,
        random_state=None,
        max_iter=1000,
    ):
        self.dual = dual
        self.tol = tol
        self.C = C
        self.multi_class = multi_class
        self.fit_intercept = fit_intercept
        self.intercept_scaling = intercept_scaling
        self.class_weight = class_weight
        self.verbose = verbose
        self.random_state = random_state
        self.max_iter = max_iter
        self.penalty = penalty
        self.loss = loss

    @_fit_context(prefer_skip_nested_validation=True)
    def fit(self, X, y, sample_weight=None):
        X, y = self._validate_data(
            X,
            y,
            accept_sparse="csr",
            dtype=np.float64,
            order="C",
            accept_large_sparse=False,
        )
        check_classification_targets(y)
        self.classes_ = np.unique(y)

        _dual = _validate_dual_parameter(
            self.dual, self.loss, self.penalty, self.multi_class, X
        )

        self.coef_, self.intercept_, n_iter_ = _fit_liblinear(
            X,
            y,
            self.C,
            self.fit_intercept,
            self.intercept_scaling,
            self.class_weight,
            self.penalty,
            _dual,
            self.verbose,
            self.max_iter,
            self.tol,
            self.random_state,
            self.multi_class,
            self.loss,
            sample_weight=sample_weight,
        )
        # Backward compatibility: _fit_liblinear is used both by LinearSVC/R
        # and LogisticRegression but LogisticRegression sets a structured
        # `n_iter_` attribute with information about the underlying OvR fits
        # while LinearSVC/R only reports the maximum value.
        self.n_iter_ = n_iter_.max().item()

        if self.multi_class == "crammer_singer" and len(self.classes_) == 2:
            self.coef_ = (self.coef_[1] - self.coef_[0]).reshape(1, -1)
            if self.fit_intercept:
                intercept = self.intercept_[1] - self.intercept_[0]
                self.intercept_ = np.array([intercept])

        return self

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }


class LinearSVR(RegressorMixin, LinearModel):

    _parameter_constraints: dict = {
        "epsilon": [Real],
        "tol": [Interval(Real, 0.0, None, closed="neither")],
        "C": [Interval(Real, 0.0, None, closed="neither")],
        "loss": [StrOptions({"epsilon_insensitive", "squared_epsilon_insensitive"})],
        "fit_intercept": ["boolean"],
        "intercept_scaling": [Interval(Real, 0, None, closed="neither")],
        "dual": ["boolean", StrOptions({"auto"})],
        "verbose": ["verbose"],
        "random_state": ["random_state"],
        "max_iter": [Interval(Integral, 0, None, closed="left")],
    }

    def __init__(
        self,
        *,
        epsilon=0.0,
        tol=1e-4,
        C=1.0,
        loss="epsilon_insensitive",
        fit_intercept=True,
        intercept_scaling=1.0,
        dual="auto",
        verbose=0,
        random_state=None,
        max_iter=1000,
    ):
        self.tol = tol
        self.C = C
        self.epsilon = epsilon
        self.fit_intercept = fit_intercept
        self.intercept_scaling = intercept_scaling
        self.verbose = verbose
        self.random_state = random_state
        self.max_iter = max_iter
        self.dual = dual
        self.loss = loss

    @_fit_context(prefer_skip_nested_validation=True)
    def fit(self, X, y, sample_weight=None):
        X, y = self._validate_data(
            X,
            y,
            accept_sparse="csr",
            dtype=np.float64,
            order="C",
            accept_large_sparse=False,
        )
        penalty = "l2"  # SVR only accepts l2 penalty

        _dual = _validate_dual_parameter(self.dual, self.loss, penalty, "ovr", X)

        self.coef_, self.intercept_, n_iter_ = _fit_liblinear(
            X,
            y,
            self.C,
            self.fit_intercept,
            self.intercept_scaling,
            None,
            penalty,
            _dual,
            self.verbose,
            self.max_iter,
            self.tol,
            self.random_state,
            loss=self.loss,
            epsilon=self.epsilon,
            sample_weight=sample_weight,
        )
        self.coef_ = self.coef_.ravel()
        # Backward compatibility: _fit_liblinear is used both by LinearSVC/R
        # and LogisticRegression but LogisticRegression sets a structured
        # `n_iter_` attribute with information about the underlying OvR fits
        # while LinearSVC/R only reports the maximum value.
        self.n_iter_ = n_iter_.max().item()

        return self

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }


class SVC(BaseSVC):
    _impl = "c_svc"

    def __init__(
        self,
        *,
        C=1.0,
        kernel="rbf",
        degree=3,
        gamma="scale",
        coef0=0.0,
        shrinking=True,
        probability=False,
        tol=1e-3,
        cache_size=200,
        class_weight=None,
        verbose=False,
        max_iter=-1,
        decision_function_shape="ovr",
        break_ties=False,
        random_state=None,
    ):
        super().__init__(
            kernel=kernel,
            degree=degree,
            gamma=gamma,
            coef0=coef0,
            tol=tol,
            C=C,
            nu=0.0,
            shrinking=shrinking,
            probability=probability,
            cache_size=cache_size,
            class_weight=class_weight,
            verbose=verbose,
            max_iter=max_iter,
            decision_function_shape=decision_function_shape,
            break_ties=break_ties,
            random_state=random_state,
        )

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }


class NuSVC(BaseSVC):

    _impl = "nu_svc"

    _parameter_constraints: dict = {
        **BaseSVC._parameter_constraints,
        "nu": [Interval(Real, 0.0, 1.0, closed="right")],
    }
    _parameter_constraints.pop("C")

    def __init__(
        self,
        *,
        nu=0.5,
        kernel="rbf",
        degree=3,
        gamma="scale",
        coef0=0.0,
        shrinking=True,
        probability=False,
        tol=1e-3,
        cache_size=200,
        class_weight=None,
        verbose=False,
        max_iter=-1,
        decision_function_shape="ovr",
        break_ties=False,
        random_state=None,
    ):
        super().__init__(
            kernel=kernel,
            degree=degree,
            gamma=gamma,
            coef0=coef0,
            tol=tol,
            C=0.0,
            nu=nu,
            shrinking=shrinking,
            probability=probability,
            cache_size=cache_size,
            class_weight=class_weight,
            verbose=verbose,
            max_iter=max_iter,
            decision_function_shape=decision_function_shape,
            break_ties=break_ties,
            random_state=random_state,
        )

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_methods_subset_invariance": (
                    "fails for the decision_function method"
                ),
                "check_class_weight_classifiers": "class_weight is ignored.",
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
                "check_classifiers_one_label_sample_weights": (
                    "specified nu is infeasible for the fit."
                ),
            }
        }


class SVR(RegressorMixin, BaseLibSVM):
    _impl = "epsilon_svr"

    _parameter_constraints: dict = {**BaseLibSVM._parameter_constraints}
    for unused_param in ["class_weight", "nu", "probability", "random_state"]:
        _parameter_constraints.pop(unused_param)

    def __init__(
        self,
        *,
        kernel="rbf",
        degree=3,
        gamma="scale",
        coef0=0.0,
        tol=1e-3,
        C=1.0,
        epsilon=0.1,
        shrinking=True,
        cache_size=200,
        verbose=False,
        max_iter=-1,
    ):
        super().__init__(
            kernel=kernel,
            degree=degree,
            gamma=gamma,
            coef0=coef0,
            tol=tol,
            C=C,
            nu=0.0,
            epsilon=epsilon,
            verbose=verbose,
            shrinking=shrinking,
            probability=False,
            cache_size=cache_size,
            class_weight=None,
            max_iter=max_iter,
            random_state=None,
        )

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }


class NuSVR(RegressorMixin, BaseLibSVM):
    _impl = "nu_svr"

    _parameter_constraints: dict = {**BaseLibSVM._parameter_constraints}
    for unused_param in ["class_weight", "epsilon", "probability", "random_state"]:
        _parameter_constraints.pop(unused_param)

    def __init__(
        self,
        *,
        nu=0.5,
        C=1.0,
        kernel="rbf",
        degree=3,
        gamma="scale",
        coef0=0.0,
        shrinking=True,
        tol=1e-3,
        cache_size=200,
        verbose=False,
        max_iter=-1,
    ):
        super().__init__(
            kernel=kernel,
            degree=degree,
            gamma=gamma,
            coef0=coef0,
            tol=tol,
            C=C,
            nu=nu,
            epsilon=0.0,
            shrinking=shrinking,
            probability=False,
            cache_size=cache_size,
            class_weight=None,
            verbose=verbose,
            max_iter=max_iter,
            random_state=None,
        )

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }


class OneClassSVM(OutlierMixin, BaseLibSVM):
    _impl = "one_class"

    _parameter_constraints: dict = {**BaseLibSVM._parameter_constraints}
    for unused_param in ["C", "class_weight", "epsilon", "probability", "random_state"]:
        _parameter_constraints.pop(unused_param)

    def __init__(
        self,
        *,
        kernel="rbf",
        degree=3,
        gamma="scale",
        coef0=0.0,
        tol=1e-3,
        nu=0.5,
        shrinking=True,
        cache_size=200,
        verbose=False,
        max_iter=-1,
    ):
        super().__init__(
            kernel,
            degree,
            gamma,
            coef0,
            tol,
            0.0,
            nu,
            0.0,
            shrinking,
            False,
            cache_size,
            None,
            verbose,
            max_iter,
            random_state=None,
        )

    def fit(self, X, y=None, sample_weight=None):
        super().fit(X, np.ones(_num_samples(X)), sample_weight=sample_weight)
        self.offset_ = -self._intercept_
        return self

    def decision_function(self, X):
        dec = self._decision_function(X).ravel()
        return dec

    def score_samples(self, X):
        return self.decision_function(X) + self.offset_

    def predict(self, X):
        y = super().predict(X)
        return np.asarray(y, dtype=np.intp)

    def _more_tags(self):
        return {
            "_xfail_checks": {
                "check_sample_weights_invariance": (
                    "zero sample_weight is not equivalent to removing samples"
                ),
            }
        }
