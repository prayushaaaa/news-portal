import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import "./Index.css"; // Custom CSS for animations/transitions
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import Moment from "../../plugin/Moment";

function Index() {
    const [news, setNews] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch news, blogs, and categories data
    useEffect(() => {
        const fetchData = async () => {
            const trendingNewsRes = await apiInstance.get("news-article/list-by-views/");
            const trendingBlogRes = await apiInstance.get("post/list-by-views/");
            const categoryRes = await apiInstance.get("post/category/list/");

            setNews(trendingNewsRes.data);
            setBlogs(trendingBlogRes.data);
            setCategories(categoryRes.data);
        };
        fetchData();
    }, []);

    return (
        <>
            <Header />
            <div className="homepage">
                {/* Hero Section */}
                {news.length > 0 && (

                    <section className="hero-section" style={{ backgroundImage: `url(${news[0].image_source})`, height: '698px' }}>
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1>{news[0].translated_title}</h1>
                            <p>{news[0].translated_content.split(".")[0]}.</p>
                            <Link to={`/news-detail/${news[0].id}`} className="btn btn-primary">Read More</Link>
                        </div>
                    </section>
                )}

                {/* Latest News Section */}
                <section className="latest-news">

                    <section className="pt-2 pb-0">
                        <div className="container">
                            <div className="row">
                                <h2 className="text-start d-block my-4 ">
                                    Trending News
                                </h2>
                                {news?.slice(0, 8).map((article, index) => (
                                    <div className="col-sm-6 col-lg-3"
                                        key={index}                            >
                                        <div className="card mb-4" style={{
                                            border: article.sentiment_score === 1
                                                ? "2px solid green"
                                                : article.sentiment_score === -1
                                                    ? "2px solid red"
                                                    : "none"
                                        }}>
                                            <div className="card-fold position-relative">
                                                <img
                                                    className="card-img"
                                                    style={{ width: "100%", height: "160px", objectFit: "cover" }}
                                                    src={article.image_source}
                                                    alt="Card image"
                                                />
                                            </div>
                                            <div className="card-body px-3 pt-3">
                                                <h4 className="card-title">
                                                    <Link to={`/news-detail/${article.id}`} className="btn-link text-reset stretched-link fw-bold text-decoration-none">
                                                        {article.original_title}
                                                    </Link>
                                                </h4>
                                                <ul className="mt-3 list-style-none" style={{ listStyle: "none" }}>
                                                    <li className="mt-2">
                                                        <i className="fas fa-calendar"></i> {article.nep_timestamp}
                                                    </li>
                                                    <li className="mt-2">
                                                        <i className="fas fa-eye"></i> {article.view} Views
                                                    </li>
                                                    <li>
                                                        <button className="text-dark text-decoration-none mt-2">
                                                            <i className="fas fa-read"></i> Read More
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </section>


                {/* Categories Section */}
                <section className="bg-light pt-5 pb-5 mb-3 mt-3">
                    <div className="container">
                        <div className="row g-0">
                            <div className="col-12 ">
                                <div className="mb-4">
                                    <h2>Categories</h2>
                                </div>
                                <div className="d-flex flex-wrap justify-content-between">
                                    {categories?.map((c, index) => (
                                        <div className="mt-2" key={index}>
                                            <Link to={`/category/${c.title}/`}>
                                                <div className="card bg-transparent">
                                                    <img className="card-img" src={c.image} style={{ width: "200px", height: "100px", objectFit: "cover" }} alt="card image" />
                                                    <div className="d-flex flex-column align-items-center mt-3 pb-2">
                                                        <h5 className="mb-0">{c.title}</h5>
                                                        <small> Articles</small>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hero Blog Section */}
                {blogs.length > 0 && (
                    <section className="hero-section" style={{ backgroundImage: `url(${blogs[0].image})`, margin: 0, padding: 0, height: "600px" }}>
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1>{blogs[0].title}</h1>
                            <p>{blogs[0].description}</p>
                            <Link to={`/blog-detail/${blogs[0].id}`} className="btn btn-primary">Read More</Link>
                        </div>
                    </section>
                )}
                {/* Trending Blogs Section */}

                <section className="latest-blogs">
                    <section className="pt-2 pb-0">
                        <div className="container">
                            <div className="row">
                                <h2 className="text-start d-block my-4 ">
                                    Trending Blogs
                                </h2>
                                <div className="row">
                                    {blogs.length > 0 ? (
                                        blogs.map((post) => (
                                            <div className="col-sm-6 col-lg-3" key={post.id}>
                                                <div className="card mb-4">
                                                    <div className="card-img-container position-relative">
                                                        <img
                                                            className="card-img"
                                                            style={{
                                                                width: "100%",
                                                                height: "160px",
                                                                objectFit: "cover",
                                                            }}
                                                            src={post.image || "default-image-url"} // Handle fallback image if not present
                                                            alt={post.title}
                                                        />
                                                    </div>
                                                    <div className="card-body px-3 pt-3">
                                                        <h4 className="card-title">
                                                            <Link
                                                                to={`/blog-detail/${post.slug}/`}
                                                                className="btn-link text-reset stretched-link fw-bold text-decoration-none"
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        </h4>
                                                        <ul className="mt-3 list-unstyled">
                                                            <li>
                                                                <small>{post?.category?.title}</small>
                                                            </li>
                                                            <li>
                                                                <small>Saved on {Moment(post.date)}</small>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    style={{
                                                                        border: "none",
                                                                        background: "none",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-thumbs-up text-primary me-1"></i>
                                                                    {post.likes?.length || 0}
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
                        </div>
                    </section>
                </section>


            </div>
            <Footer />
        </>
    );
}

export default Index;
