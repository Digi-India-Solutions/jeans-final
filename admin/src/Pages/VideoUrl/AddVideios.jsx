    import React, { useState } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { ToastContainer, toast } from "react-toastify";
    import "react-toastify/dist/ReactToastify.css";
    import { postData } from "../../services/FetchNodeServices";

    const AddVideos = () => {
        const [isLoading, setIsLoading] = useState(false);
        const [formData, setFormData] = useState({ videoUrl: "" });
        const [previewUrl, setPreviewUrl] = useState("");

        const navigate = useNavigate();

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({ ...prevData, [name]: value }));
            if (name === "videoUrl") {
                setPreviewUrl(value);
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);

            if (!formData.videoUrl) {
                toast.error("Please fill in all fields");
                setIsLoading(false);
                return;
            }

            const body = { videoUrl: formData.videoUrl };

            try {
                const response = await postData("api/video/add", body);
                if (response?.success) {
                    toast.success(response?.message || "Video added successfully");
                    navigate("/all-videos");
                } else {
                    toast.error(response?.message || "Failed to add video");
                }
            } catch (error) {
                console.error("Error adding video:", error);
                toast.error("Server error while adding video");
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <>
                <ToastContainer />
                <div className="bread">
                    <div className="head">
                        <h4>Add Video</h4>
                    </div>
                    <div className="links">
                        <Link to="/all-videos" className="add-new">
                            Back <i className="fa-regular fa-circle-left"></i>
                        </Link>
                    </div>
                </div>

                <div className="d-form">
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <div className="col-md-6">
                            <label htmlFor="videoUrl" className="form-label">
                                Video URL
                            </label>
                            <input type="text" name="videoUrl" className="form-control" id="videoUrl" value={formData.videoUrl} onChange={handleChange} required />
                        </div>

                        {previewUrl && (
                            <div className="col-md-12 mt-3">
                                <label className="form-label">Video Preview</label>
                                <div style={{ aspectRatio: "16/9", width: "50%" }}>
                                    <iframe width="100%" height="100%" src={previewUrl} title="Video Preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                            </div>
                        )}

                        <div className="col-md-12 mt-4">
                            <button type="submit" className="btn btn-success" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Add Video"}
                            </button>
                        </div>
                    </form>
                </div>
            </>
        );
    };

    export default AddVideos;
