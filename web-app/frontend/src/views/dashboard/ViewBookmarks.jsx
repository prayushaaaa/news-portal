import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";

const ViewBookmarks = () => {
    const params = useParams();
    const userId = params.userId;
    const [bookmarks, setBookmarks] = useState();

    // Fetch bookmarks data from API
    const fetchData = async () => {
        try {
            const response = await apiInstance.get(`all-bookmarks/${userId}/`);
            setBookmarks(response.data[0]); // Save response to state
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]); // Re-fetch data if userId changes

    if (!bookmarks) {
        return (
            <>
                <Header />
                <div className="container mt-4">
                    <h2>Loading Bookmarks...</h2>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div className="row mt-0 mt-md-4">
                        <div className="col-lg-12 col-md-8 col-12">
                            <>
                                <section className="py-4 py-lg-6 text-black rounded-3" style={{ border: "1px solid black", backgroundColor: "#f5cb5c" }}>
                                    <div className="container">
                                        <div className="row">
                                            <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                                                <div className="d-lg-flex align-items-center justify-content-between">
                                                    <div className="mb-4 mb-lg-0">
                                                        <h1 className="mb-1">Your Bookmarks </h1>
                                                    </div>
                                                    <div>
                                                        <Link to="/dashboard" className="btn" style={{ border: "1px solid black" }}>
                                                            <i className="fas fa-arrow-left"></i> Back to Dashboard
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="pt-4 pb-0">
                                    <div className="container">
                                        {/* News Bookmarks Section */}
                                        <h3 className="mb-3">News Bookmarks</h3>
                                        <div className="row">
                                            {bookmarks?.news_article_bookmarks?.length > 0 ? (
                                                bookmarks.news_article_bookmarks.map((bookmark) => (
                                                    <div className="col-sm-6 col-lg-3" key={bookmark.id}>
                                                        <div className="card mb-4">
                                                            <div className="card-img-container position-relative">
                                                                <img
                                                                    className="card-img"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "160px",
                                                                        objectFit: "cover",
                                                                    }}
                                                                    src={bookmark.news_article.image_source}
                                                                    alt={bookmark.news_article.translated_title}
                                                                />
                                                            </div>
                                                            <div className="card-body px-3 pt-3">
                                                                <h4 className="card-title">
                                                                    <Link
                                                                        to={`/news-detail/${bookmark.news_article.id}/`}
                                                                        className="btn-link text-reset stretched-link fw-bold text-decoration-none"
                                                                    >
                                                                        {bookmark.news_article.translated_title}
                                                                    </Link>
                                                                </h4>
                                                                <ul className="mt-3 list-unstyled">
                                                                    <li>
                                                                        <small>
                                                                            {bookmark.news_article.category}
                                                                        </small>
                                                                    </li>
                                                                    <li>
                                                                        <small>Saved on {Moment(bookmark.date)}</small>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            style={{
                                                                                border: "none",
                                                                                background: "none",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-thumbs-up text-primary me-1"></i>
                                                                            {bookmark.news_article.likes?.length || 0}
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No News Bookmarks found.</p>
                                            )}

                                        </div>

                                        {/* Blog Bookmarks Section */}
                                        <h3 className="mt-5 mb-3">Blog Bookmarks</h3>
                                        <div className="row">
                                            {bookmarks?.post_bookmarks?.length > 0 ? (
                                                bookmarks.post_bookmarks.map((bookmark) => (
                                                    <div className="col-sm-6 col-lg-3" key={bookmark.id}>
                                                        <div className="card mb-4">
                                                            <div className="card-img-container position-relative">
                                                                <img
                                                                    className="card-img"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "160px",
                                                                        objectFit: "cover",
                                                                    }}
                                                                    src={bookmark.post.image || "default-image-url"} // Handle fallback image if not present
                                                                    alt={bookmark.post.title}
                                                                />
                                                            </div>
                                                            <div className="card-body px-3 pt-3">
                                                                <h4 className="card-title">
                                                                    <Link
                                                                        to={`/blog-detail/${bookmark.post.slug}/`}
                                                                        className="btn-link text-reset stretched-link fw-bold text-decoration-none"
                                                                    >
                                                                        {bookmark.post.title}
                                                                    </Link>
                                                                </h4>
                                                                <ul className="mt-3 list-unstyled">
                                                                    <li>
                                                                        <small>{bookmark.post?.category?.title}</small>
                                                                    </li>
                                                                    <li>
                                                                        <small>Saved on {Moment(bookmark.date)}</small>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            style={{
                                                                                border: "none",
                                                                                background: "none",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-thumbs-up text-primary me-1"></i>
                                                                            {bookmark.post.likes?.length || 0}
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No Blog Bookmarks found.</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                            </>
                        </div>
                    </div>
                </div>
            </section>


            <Footer />
        </>
    );
};

export default ViewBookmarks;
