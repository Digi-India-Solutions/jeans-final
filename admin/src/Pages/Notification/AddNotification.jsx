import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices";

const AddNotification = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        image: null,
    });
    const [preview, setPreview] = useState(null);

    const navigate = useNavigate();

    // Handle text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, image: file }));
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        if (!formData.title || !formData.body || !formData.image) {
            toast.error("Please fill all fields");
            setIsLoading(false);
            return;
        }

        try {
            // Prepare multipart form data
            const form = new FormData();
            form.append("title", formData.title);
            form.append("body", formData.body);
            form.append("image", formData.image);

            const response = await postData("api/notification/create-notification", form);

            if (response?.success) {
                toast.success(response?.message || "Notification created successfully");
                setFormData({ title: "", body: "", image: null });
                setPreview(null);
                navigate("/all-notification");
            } else {
                toast.error(response?.message || "Failed to create notification");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error adding notification");
            console.error("Error adding notification:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bread d-flex justify-content-between align-items-center mb-3">
                <div className="head">
                    <h4>Add Notification</h4>
                </div>
                <div className="links">
                    <Link to="/all-notification" className="btn btn-outline-secondary">
                        <i className="fa-regular fa-circle-left"></i> Back
                    </Link>
                </div>
            </div>

            <div className="d-form">
                <form className="row g-3" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="col-md-4">
                        <label htmlFor="title" className="form-label">
                            Notification Title
                        </label>
                        <input type="text" name="title" className="form-control" id="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    {/* Body */}
                    <div className="col-md-4">
                        <label htmlFor="body" className="form-label">
                            Notification Body
                        </label>
                        <input type="text" name="body" className="form-control" id="body" value={formData.body} onChange={handleChange} required />
                    </div>

                    {/* Image */}
                    <div className="col-md-4">
                        <label htmlFor="image" className="form-label">
                            Notification Image
                        </label>
                        <input type="file" name="image" accept="image/*" className="form-control" id="image" onChange={handleFileChange} required />
                        {preview && (
                            <img src={preview} alt="preview" className="mt-2" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px" }} />
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-md-12 mt-3">
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Saving...
                                </>
                            ) : (
                                "Add Notification"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddNotification;
