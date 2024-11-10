import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

function Header() {
    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);

    return (
        <header className="navbar-dark bg-dark navbar-sticky header-static">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <img className="navbar-brand-item dark-mode-item" src="https://imgs.search.brave.com/80EgKEuzhehTd6cF_1ZFrDYCmLXjt7e_R-IHhk6LW_c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/Ni9FYXJ0aC1QTkct/SW1hZ2UucG5n" alt="News Portal" style={{ width: "50px", height: "50px" }} />
                    </Link>
                    <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="h6 d-none d-sm-inline-block text-white">Menu</span>
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="nav mt-3 mt-lg-0 px-4 flex-nowrap align-items-center">
                            <div className="nav-item w-100">
                                <form className="rounded position-relative">
                                    <input className="form-control pe-5 bg-light" type="search" placeholder="Search Articles" aria-label="Search" />
                                    <Link to={"/search/"} className="btn bg-transparent border-0 px-2 py-0 position-absolute top-50 end-0 translate-middle-y" type="submit">
                                        <i className="bi bi-search fs-5"> </i>
                                    </Link>
                                </form>
                            </div>
                        </div>
                        <ul className="navbar-nav navbar-nav-scroll ms-auto">
                            <li className="nav-item dropdown active">
                                <Link className="nav-link active" to="/">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item dropdown">
                                <Link className="nav-link active" to="/category/">
                                    Category
                                </Link>
                            </li>
                            <li className="nav-item dropdown active">
                                <Link className="nav-link active" to="/dashboard">
                                    User Dashboard
                                </Link>
                            </li>
                            {isLoggedIn() ? (
                                <>
                                    <li className="nav-item dropdown active">
                                        <Link to={"/dashboard/"} className="btn text-black" style={{ backgroundColor: "#f5cb5c" }} href="dashboard.html">
                                            Dashboard <i className="fas fa-home"></i>
                                        </Link>
                                    </li>
                                    <li className="nav-item dropdown active">
                                        <Link to={"/logout/"} className="btn ms-2 text-black" style={{ backgroundColor: "#f5cb5c" }} href="dashboard.html">
                                            Logout <i className="fas fa-sign-out-alt"></i>
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item dropdown active">
                                        <Link to={"/register/"} className="btn text-black" style={{ backgroundColor: "#f5cb5c" }} href="dashboard.html">
                                            Register <i className="fas fa-user-plus"></i>
                                        </Link>
                                    </li>
                                    <li className="nav-item dropdown active">
                                        <Link to={"/login/"} className="btn ms-2 text-black" style={{ backgroundColor: "#f5cb5c" }} href="dashboard.html">
                                            Login <i className="fas fa-sign-in-alt"></i>
                                        </Link>
                                    </li>
                                </>
                            )}




                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
