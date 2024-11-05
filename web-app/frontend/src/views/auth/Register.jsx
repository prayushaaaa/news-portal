import React, { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { register } from '../../utils/auth';
import Toast from "../../plugin/Toast";

function Register() {
    const [bioData, setBioData] = useState({ full_name: "", email: "", password: "", password2: "", });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setBioData({
            ...bioData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setBioData({
            full_name: "",
            email: "",
            password: "",
            password2: "",
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = register(bioData.full_name, bioData.email, bioData.password, bioData.password2);

        if (error) {
            Toast("error", JSON.stringify(error));
            resetForm();
        } else {
            navigate('/');
        }

        setIsLoading(false);
    }

    return (
        <>
            <Header />
            <section className="container d-flex flex-column vh-100" style={{ marginTop: "150px" }}>
                <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
                    <div className="col-lg-5 col-md-8 py-8 py-xl-0">
                        <div className="card shadow">
                            <div className="card-body p-6">
                                <div className="mb-4">
                                    <h1 className="mb-1 fw-bold">Sign up</h1>
                                    <span>
                                        Already have an account?
                                        <Link to="/login/" className="ms-1">
                                            Sign In
                                        </Link>
                                    </span>
                                </div>
                                {/* Form */}
                                <form className="needs-validation" noValidate="" onSubmit={handleRegister}>
                                    {/* Username */}
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Full Name
                                        </label>
                                        <input type="text" id="full_name" className="form-control" name="full_name" placeholder="John Doe" onChange={handleChange} value={bioData.full_name} required="" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input type="email" id="email" className="form-control" name="email" placeholder="johndoe@gmail.com" onChange={handleChange} value={bioData.email} required="" />
                                    </div>

                                    {/* Password */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <input type="password" id="password" className="form-control" name="password" placeholder="**************" onChange={handleChange} value={bioData.password} required="" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Confirm Password
                                        </label>
                                        <input type="password" id="password" className="form-control" name="password2" placeholder="**************" onChange={handleChange} value={bioData.password2} required="" />
                                    </div>
                                    <div>
                                        <div className="d-grid">
                                            {isLoading === true ? (
                                                <button type="submit" className="btn btn-primary " disabled>
                                                    Processing <i className="fas fa-spinner fa-spin "></i>
                                                </button>
                                            ) : (
                                                <button type="submit" className="btn btn-primary">
                                                    Sign Up <i className="fas fa-user-plus"></i>
                                                </button>
                                            )}
                                        </div>
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

export default Register;
