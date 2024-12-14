import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import Toast from "../../plugin/Toast";
import useUserData from "../../plugin/useUserData";
import TrendChart from "../../components/TrendChart";

function Detail() {
    const [post, setPost] = useState({});
    const [tags, setTags] = useState([]);
    const [showTranslated, setShowTranslated] = useState(false);
    const [createComment, setCreateComment] = useState({ full_name: "", email: "", comment: "" });
    const [selectedWord, setSelectedWord] = useState(null);
    const [chartData, setChartData] = useState([]); 

    const params = useParams();

    // Fetch the main post data
    const fetchData = async () => {
        const response = await apiInstance.get(`news-article/detail/${params.news_article_id}`);
        setPost(response.data);
        console.log(response.data)
        setTags(response.data?.tags?.split(",") || []);
    };

    // Fetch sentiment trends for each valid word
    const fetchChartData = async () => {
        if (!post?.translated_title) return; 
        const words = post.translated_title
            .toLowerCase()
            .split(" ") 
            .filter(word => word !== "and" && word.length > 2);

        const fetchedCharts = [];
        for (const word of words) {
            try {
                const response = await apiInstance.get(`/topic-trends-by-words/?words=${word}`);
                if (response.data?.length > 0) {
                    fetchedCharts.push({ word, data: response.data });
                }
            } catch (error) {
                console.error(`Error fetching trend for ${word}:`, error);
            }
        }
        setChartData(fetchedCharts);
        if (fetchedCharts.length > 0) {
            setSelectedWord(fetchedCharts[0].word); // Default to the first word's chart
        }
    };


    useEffect(() => {
        fetchData();
    }, [params.news_article_id]);

    useEffect(() => {
        fetchChartData();
    }, [post?.translated_title]);

    const handleWordClick = (word) => {
        setSelectedWord(word);
    };

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
        console.log(json)
        await apiInstance.post(`news-article/comment-article/`, json);
        Toast("success", "Comment posted.");
        fetchData();
        setCreateComment({ full_name: "", email: "", comment: "" });
    };

    const handleLikePost = async () => {
        const response = await apiInstance.post(`news-article/like-article/`, { user_id: useUserData()?.user_id, news_article_id: post.id });
        Toast("success", response.data?.message);
        fetchData();
    };

    const handleBookmarkPost = async () => {
        const response = await apiInstance.post(`news-article/bookmark-news-article/`, { user_id: useUserData().user_id, news_article_id: post.id });
        Toast("success", response.data?.message);
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
                            <span
                                className="badge mb-2 ms-2 text-decoration-none"
                                style={{
                                    backgroundColor:
                                        post.sentiment_score === 1
                                            ? "Green"
                                            : post.sentiment_score === -1
                                            ? "red"
                                            : "grey",
                                }}
                            >
                                {post?.sentiment_score === 1
                                    ? "Positive"
                                    : post.sentiment_score === -1
                                    ? "Negative"
                                    : "Neutral"}
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
                            {/* Post Author and Details */}
                            <div className="text-start text-lg-center mb-5">
                                <a
                                    href="#"
                                    className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block"
                                >
                                    {post?.user?.full_name}
                                </a>
                                <p>{post?.profile?.bio}</p>
                                <ul className="list-inline list-unstyled">
                                    <li>
                                        <i className="fas fa-calendar"></i> {Moment(post?.date)}
                                    </li>
                                </ul>
                                <button onClick={handleLikePost} className="btn btn-outline-success">
                                    <i className="fas fa-thumbs-up me-2"></i>
                                    {post?.likes?.length}
                                </button>
                                <button
                                    onClick={handleBookmarkPost}
                                    className="btn btn-outline-primary ms-2"
                                >
                                    <i className="fas fa-bookmark"></i>
                                </button>
                                <button
                                    onClick={() => setShowTranslated(!showTranslated)}
                                    className="btn btn-secondary mt-3"
                                >
                                    {showTranslated ? "Show Original" : "Show English"}
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-lg-10 mb-5">
                            <img
                                src={post.image_source}
                                width={"100%"}
                                height={"700px"}
                                className="p-4"
                            />
                            <p className="pb-4 ps-4 pe-4">
                                {showTranslated
                                    ? post.translated_content.split(".").slice(1).join(". ")
                                    : post.original_content}
                            </p>

                            {/* Sentiment Trend Charts */}
                            <hr />
                            <section className="pt-0">
                <div className="container position-relative">
                    <div className="row">
                        <div className="col-lg-10 mb-5">
                            {/* Sentiment Trend Word Selector */}
                            <h3>Select a word to view sentiment trends:</h3>
                            <div className="mb-4">
                                {chartData.map((chart) => (
                                    <button
                                        key={chart.word}
                                        onClick={() => handleWordClick(chart.word)}
                                        className={`btn btn-outline-primary me-2 ${selectedWord === chart.word ? "active" : ""}`}
                                    >
                                        {chart.word}
                                    </button>
                                ))}
                            </div>

                            {/* Trend Chart */}
                            {selectedWord ? (
                                <div>
                                    <h4>Trends for "{selectedWord}"</h4>
                                    <TrendChart
                                        data={chartData.find((chart) => chart.word === selectedWord)?.data || []}
                                    />
                                </div>
                            ) : (
                                <p>No word selected for trends.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <hr />
                            <div>
                                <h3>{post?.news_article_comments?.length || 0} comments</h3>
                                {post?.news_article_comments?.map((c, index) => (
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
