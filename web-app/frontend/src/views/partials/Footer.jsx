import React from "react";

function Footer() {
    return (
        <footer>
            <div className="row bg-dark mx-0 card card-header  flex-row align-items-center text-center text-md-start w-100">
                <div className="col-md-5 mb-3 mb-md-0">
                    <div className="text-primary-hover text-white">
                        2024{" "}
                        | All rights reserved &copy;
                    </div>
                </div>
                <div className="col-md-3 mb-3 mb-md-0">
                    <img className="navbar-brand-item dark-mode-item" src="https://imgs.search.brave.com/80EgKEuzhehTd6cF_1ZFrDYCmLXjt7e_R-IHhk6LW_c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/Ni9FYXJ0aC1QTkct/SW1hZ2UucG5n" alt="News Portal" style={{ width: "50px", height: "50px" }} />
                </div>
                <div className="col-md-4">
                    <ul className="nav text-primary-hover justify-content-center justify-content-md-end">
                        <li className="nav-item">
                            <a className="nav-link text-white px-2 fs-5" href="#">
                                <i className="fab fa-facebook-square" />
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white px-2 fs-5" href="#">
                                <i className="fab fa-twitter-square" />
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link text-white px-2 fs-5" href="#">
                                <i className="fab fa-youtube-square" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
