import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";

function Category() {
    const params = useParams();
    const category = params.category;

    const [currentPage, setCurrentPage] = useState(1);
    const [articles, setArticles] = useState(null);
    const [sentimentFilter, setSentimentFilter] = useState("all"); // New filter state

    const fetchData = async () => {
        try {
            const response = await apiInstance.get(`post/category/posts/${category}/`);
            setArticles(response.data[0]);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [category]);

    if (!articles) {
        return (
            <>
                <Header />
                <div className="container mt-4">
                    <h2>Loading...</h2>
                </div>
                <Footer />
            </>
        );
    }

    const itemsPerPage = 24;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Filter articles based on sentiment filter
    const filteredNewsItems = articles?.news_articles?.filter(article => {
        if (sentimentFilter === "all") return true;
        return article.sentiment_score === parseInt(sentimentFilter);
    });

    const newsItems = filteredNewsItems?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNewsItems?.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div>
            <Header />
            <section className="p-0">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <h2 className="text-start d-block mt-4">
                                <i className="bi bi-grid-fill"></i> {category.charAt(0).toUpperCase() + String(category).slice(1)} News
                            </h2>

                            {/* Sentiment Filter Dropdown */}
                            <select
                                value={sentimentFilter}
                                onChange={(e) => setSentimentFilter(e.target.value)}
                                className="form-select mt-3 mb-4"
                            >
                                <option value="all">All</option>
                                <option value="1">Positive</option>
                                <option value="-1">Negative</option>
                                <option value="0">Neutral</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-2 pb-0">
                <div className="container">
                    <div className="row">
                        {newsItems.map((article, index) => (
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

                    <nav className="d-flex mt-2">
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link text-dark fw-bold me-1 rounded" onClick={() => setCurrentPage(currentPage - 1)}>
                                    <i className="fas fa-arrow-left me-2" />
                                    Previous
                                </button>
                            </li>
                        </ul>
                        <ul className="pagination">
                            {pageNumbers.map(number => (
                                <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                    <button className="page-link text-dark fw-bold rounded" onClick={() => setCurrentPage(number)}>{number}</button>
                                </li>
                            ))}
                        </ul>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link text-dark fw-bold ms-1 rounded" onClick={() => setCurrentPage(currentPage + 1)}>
                                    Next
                                    <i className="fas fa-arrow-right ms-3 " />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Category;
