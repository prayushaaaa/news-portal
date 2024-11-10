import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";

import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import Toast from "../../plugin/Toast";


function Index() {
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState([]);

    const fetchData = async () => {
        try {
            const response_post = await apiInstance.get("post/list-by-views/");
            const response_category = await apiInstance.get("post/category/list/");
            setPosts(response_post.data);
            setCategory(response_category.data);
        }
        catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const postItems = posts?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(posts?.length / itemsPerPage)
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)


    return (
        <div>
            <Header />
            <section className="p-0">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <a href="#" className="d-block card-img-flash">
                                <img src="assets/images/adv-3.png" alt="" />
                            </a>
                            <h2 className="text-start d-block mt-1">Trending Blogs 🔥</h2>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-4 pb-0">
                <div className="container">
                    <div className="row">

                        {postItems?.map((post) => {
                            return <div className="col-sm-6 col-lg-3" key={post?.id}>
                                <div className="card mb-4">
                                    <div className="card-fold position-relative">
                                        <img className="card-img" style={{ width: "100%", height: "160px", objectFit: "cover" }} src={post.image} alt="Card image" />
                                    </div>
                                    <div className="card-body px-3 pt-3">
                                        <h4 className="card-title">
                                            <Link to={`blog-detail/${post.slug}`} className="btn-link text-reset stretched-link fw-bold text-decoration-none">
                                                {post.title}
                                            </Link>
                                        </h4>

                                        <button style={{ border: "none", background: "none" }}>
                                            <i className="fas fa-thumbs-up text-primary me-1"></i>{post.likes.length}
                                        </button>


                                        <ul className="mt-3 list-style-none" style={{ listStyle: "none" }}>
                                            <li>
                                                <a href="#" className="text-dark text-decoration-none">
                                                    <i className="fas fa-user"></i> {post?.user?.full_name || "Prayusha Acharya"}
                                                </a>
                                            </li>
                                            <li className="mt-2">
                                                <i className="fas fa-calendar"></i> {Moment(post.date)}
                                            </li>
                                            <li className="mt-2">
                                                <i className="fas fa-eye"></i>{post?.view}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        })}

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
                            {
                                pageNumbers?.map((number) => (
                                    <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                        <button className="page-link text-dark fw-bold rounded" onClick={() => setCurrentPage(number)}>{number}</button>
                                    </li>
                                ))
                            }

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

            <section className="bg-light pt-5 pb-5 mb-3 mt-3">
                <div className="container">
                    <div className="row g-0">
                        <div className="col-12 ">
                            <div className="mb-4">
                                <h2>Categories</h2>
                            </div>
                            <div className="d-flex flex-wrap justify-content-between">
                                {category?.map((cat) => {
                                    return <div className="mt-2" key={cat.id}>
                                        <div className="card bg-transparent">
                                            <img className="card-img" src={cat?.image} style={{ width: "150px", height: "80px", objectFit: "cover" }} alt="card image" />
                                            <div className="d-flex flex-column align-items-center mt-3 pb-2">
                                                <h5 className="mb-0">{cat?.title}</h5>
                                                <small>{cat.post_count || 0 + " Articles"}</small>
                                            </div>
                                        </div>
                                    </div>
                                })}



                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Index;
