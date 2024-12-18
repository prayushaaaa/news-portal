// UserProfile.js
import { useEffect, useState } from "react";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import { useNavigate } from "react-router-dom";

function UserProfile() {
    const [userProfile, setUserProfile] = useState(null);
    const userId = useUserData()?.user_id;
    const navigate = useNavigate();

    const fetchProfile = () => {
        apiInstance.get(`user/profile/${userId}/`).then((res) => {
            setUserProfile(res.data);
        });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (!userProfile) return null;

    function EditProfile() {
        navigate('/edit-profile');
    }

    function ViewBookmarks() {
        navigate(`/view-bookmarks/${userId}/`);
    }

    return (
        <section className="pt-5 pb-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="row-lg-10 row-md-12">
                        {/* Profile Card */}
                        <div className="card">
                            <div className="card-header text-center">
                                <h3 className="mb-0">User Profile</h3>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Profile Picture and Basic Info */}
                                    <div className="col-md-4 text-center">
                                        <img
                                            src={userProfile.image || "default-avatar.jpg"}
                                            alt="User Avatar"
                                            className="rounded-circle mb-3"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                                border: "2px solid #dee2e6",
                                            }}
                                        />
                                        <h4 className="mb-1">{userProfile.full_name}</h4>
                                        <p className="text-muted">{userProfile.bio || "No bio available"}</p>


                                    </div>

                                    {/* Personal Details */}
                                    <div className="col-md-8">
                                        <h5 className="mb-3">Personal Details</h5>
                                        <div className="row">
                                            <div className="col-6 mb-2">
                                                <strong>Email:</strong>
                                            </div>
                                            <div className="col-6 mb-2 text-muted">
                                                {userProfile.user.email || "Not specified"}
                                            </div>
                                            <div className="col-6 mb-2">
                                                <strong>Country:</strong>
                                            </div>
                                            <div className="col-6 mb-2 text-muted">
                                                {userProfile.country || "Not specified"}
                                            </div>
                                            <div className="col-6 mb-2">
                                                <strong>Social Media:</strong>
                                            </div>
                                            <div className="col-6 mb-2 text-muted">
                                                {userProfile.facebook || "Not provided"}
                                            </div>
                                        </div>
                                        {/* Edit Profile Button */}
                                        <button className="btn btn-primary mt-2" onClick={EditProfile}>
                                            Edit Profile <i className="fas fa-edit"></i>
                                        </button>
                                        {/* Edit Profile Button */}
                                        <button className="btn btn-secondary ms-2 mt-2" onClick={ViewBookmarks}>
                                            ViewBookmarks <i className="fas fa-bookmark"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UserProfile;
