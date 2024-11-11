import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import Toast from "../../plugin/Toast";
import useUserData from "../../plugin/useUserData";

function Detail() {
    const [post, setPost] = useState({});
    const [tags, setTags] = useState([]);
    const [showTranslated, setShowTranslated] = useState(false);
    const [createComment, setCreateComment] = useState({ full_name: "", email: "", comment: "" });

    const params = useParams();

    const fetchData = async () => {
        const response = await apiInstance.get(`news-article/detail/${params.news_article_id}`);
        setPost(response.data);
        setTags(response.data?.tags?.split(",") || []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCommentChange = (e) => {
        setCreateComment({
            ...createComment,
            [e.target.name]: e.target.value,
        });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        const json = {
            news_article_id: post?.id,
            name: createComment.full_name,
            email: createComment.email,
            comment: createComment.comment,
        };

        await apiInstance.post(`news-article/comment-article/`, json);
        Toast("success", "Comment posted.");
        fetchData();
        setCreateComment({ full_name: "", email: "", comment: "" });
    };

    const handleLikePost = async () => {
        const response = await apiInstance.post(`news-article/like-article/`, { user_id: useUserData()?.user_id, news_article_id: post.id });
        Toast("success", response.data?.message)
        fetchData();
    };

    const handleBookmarkPost = async () => {
        const response = await apiInstance.post(`news-article/bookmark-news-article/`, { user_id: useUserData().user_id, news_article_id: post.id });
        Toast("success", response.data?.message)
        fetchData();
    };

    return (
        <>
            <Header />
            <section className="mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <span className="badge bg-danger mb-2 text-decoration-none">
                                {post?.category}
                            </span>
                            <span className="badge mb-2 ms-2 text-decoration-none"
                                style={{
                                    backgroundColor: post.sentiment_score === 1
                                        ? "Green"
                                        : post.sentiment_score === -1
                                            ? "red"
                                            : "grey"
                                }}
                            >
                                {post?.sentiment_score === 1 ? "Positive" : post.sentiment_score === -1 ? "Negative" : "Neutral"}
                            </span>
                            <h1 className="text-center">
                                {showTranslated ? post.translated_title : post.original_title}
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-0">
                <div className="container position-relative">
                    <div className="row">
                        <div className="col-lg-2">
                            <div className="text-start text-lg-center mb-5">
                                <div className="position-relative">
                                    <div className="avatar avatar-xl">
                                        <svg width="100" height="100" viewBox="0 0 327 305" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.38762 97.2833C6.48478 41.5421 54.0607 0 109.952 0H215.986C273.534 0 321.749 43.9769 324.843 101.442C325.909 121.241 326.729 141.186 326.954 158.431C327.153 173.692 326.689 190.346 325.878 206.777C323.104 262.941 275.336 305 219.103 305H110.91C54.6087 305 6.88092 262.863 2.67644 206.72C1.38866 189.524 0.396663 172.621 0.0777154 158.431C-0.30337 141.475 0.756804 119.47 2.38762 97.2833Z" fill="white" />
                                            <path d="M128.758 77.3213C86.7773 77.3213 52.7468 111.395 52.7468 153.429C52.7468 195.463 86.7773 229.537 128.758 229.537C170.739 229.537 204.769 195.463 204.769 153.429C204.769 111.395 170.739 77.3213 128.758 77.3213ZM128.758 181.907C113.05 181.907 100.316 169.157 100.316 153.429C100.316 137.701 113.05 124.951 128.758 124.951C144.466 124.951 157.199 137.701 157.199 153.429C157.199 169.157 144.466 181.907 128.758 181.907Z" fill="#0463C3" />
                                            <path d="M278.224 77.6542H203.819C199.926 77.6542 196.305 79.629 194.188 82.9032L161.562 133.413C155.013 143.555 155.093 156.614 161.759 166.676L199.819 224.077C201.946 227.28 205.529 229.208 209.376 229.208H275.553C278.158 229.208 279.737 226.333 278.346 224.128L238.965 161.882C236.599 158.138 236.59 153.368 238.951 149.615L281.025 82.725C282.407 80.5203 280.828 77.6542 278.224 77.6542Z" fill="#EC3534" />
                                        </svg>
                                    </div>
                                    <a href="#" className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block">
                                        {post?.user?.full_name}
                                    </a>
                                    <p>{post?.profile?.bio}</p>
                                </div>

                                <hr className="d-none d-lg-block" />
                                <ul className="list-inline list-unstyled">
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <i className="fas fa-calendar"></i> {Moment(post?.date)}
                                    </li>
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <i className="fas fa-heart me-1" />
                                        {post?.likes?.length}
                                    </li>
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <i className="fas fa-eye" />
                                        {post?.view}
                                    </li>
                                </ul>
                                <ul className="list-inline text-primary-hover mt-0 mt-lg-3 text-start">
                                    {tags.map((tag, index) => (
                                        <li className="list-inline-item" key={index}>
                                            <a className="text-body text-decoration-none fw-bold" href="#">
                                                #{tag}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleLikePost} className="btn btn-outline-success">
                                    <i className="fas fa-thumbs-up me-2"></i>
                                    {post?.likes?.length}
                                </button>
                                <button onClick={handleBookmarkPost} className="btn btn-outline-primary ms-2">
                                    <i className="fas fa-bookmark"></i>
                                </button>
                                <button onClick={() => setShowTranslated(!showTranslated)} className="btn btn-secondary mt-3">
                                    {showTranslated ? "Show Original" : "Show English"}
                                </button>
                            </div>
                        </div>

                        <div className="col-lg-10 mb-5">

                            <img src={post.image_source} width={"100%"} height={"700px"} className="p-4" />
                            <p className="pb-4 ps-4 pe-4">{showTranslated ? post.translated_content.split(".").slice(1).join(". ") : post.original_content}</p>

                            <hr />
                            <div>
                                <h3>{post?.comments?.length || 0} comments</h3>
                                {post?.comments?.map((c, index) => (
                                    <div key={index} className="my-4 d-flex bg-light p-3 mb-3 rounded">
                                        <div>
                                            <div className="mb-2">
                                                <h5 className="m-0">{c.name}</h5>
                                                <span className="me-3 small">{Moment(c.date)}</span>
                                            </div>
                                            <p className="fw-bold">{c.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-light p-3 rounded">
                                <h3 className="fw-bold">Leave a reply</h3>
                                <small>Your email address will not be published. Required fields are marked *</small>
                                <form className="row g-3 mt-2" onSubmit={handleCommentSubmit}>
                                    <div className="col-md-6">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="full_name"
                                            value={createComment.full_name}
                                            onChange={handleCommentChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={createComment.email}
                                            onChange={handleCommentChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Comment *</label>
                                        <textarea
                                            className="form-control"
                                            name="comment"
                                            rows="3"
                                            value={createComment.comment}
                                            onChange={handleCommentChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary">Submit Comment</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Detail;
