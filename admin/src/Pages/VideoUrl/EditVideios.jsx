import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditVideios = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        videoUrl: ""
    });

    const [btnLoading, setBtnLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await getData(`api/video/get-url-by-id/${id}`);
                if (response?.success) {
                    setFormData({ videoUrl: response?.data?.videoUrl });
                    setPreviewUrl(response?.data?.videoUrl);
                }
            } catch (error) {
                toast.error("Error fetching video data");
                console.error("Error fetching video:", error);
            }
        };
        fetchVideo();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (name === "videoUrl") {
            setPreviewUrl(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBtnLoading(true);

        try {
            const response = await postData(`api/video/update-url/${id}`, {
                videoUrl: formData?.videoUrl
            });
            if (response?.success) {
                toast.success(response.message);
                navigate("/all-videos");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating video");
            console.error("Error updating video:", error);
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>Edit Video URL</h4>
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
                        <input
                            type="text"
                            name="videoUrl"
                            className="form-control"
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {previewUrl && (
                        <div className="col-md-12 mt-3">
                            <label className="form-label">Video Preview</label>
                            <div style={{ aspectRatio: "16/9", width: "50%" }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={previewUrl}
                                    title="Video Preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    <div className="col-md-12 mt-4">
                        <button type="submit" className="btn btn-success" disabled={btnLoading}>
                            {btnLoading ? "Saving..." : "Update Video"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditVideios;
