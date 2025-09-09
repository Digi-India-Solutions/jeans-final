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

    // Handle text input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file upload with validation
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size should be less than 2MB");
                return;
            }
            setFormData((prev) => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (!formData.title.trim() || !formData.body.trim()) {
            toast.error("Please fill all fields");
            setIsLoading(false);
            return;
        }

        try {
            let response;
            if (formData?.image) {
                // Send as multipart if image exists
                const form = new FormData();
                form.append("title", formData.title);
                form.append("body", formData.body);
                form.append("image", formData.image);

                response = await postData("api/notification/create-notification", form, true);
            } else {
                // Otherwise send simple JSON
                response = await postData("api/notification/create-notification-without-image", {
                    title: formData.title,
                    body: formData.body,
                });
            }

            if (response?.success) {
                toast.success(response?.message || "Notification created successfully");
                setFormData({ title: "", body: "", image: null });
                setPreview(null);
                navigate("/all-notification");
            } else {
                toast.error(response?.message || "Failed to create notification");
            }
        } catch (error) {
            toast.error("Error adding notification");
            console.error("Error adding notification:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bread d-flex justify-content-between align-items-center mb-3">
                <h4>Add Notification</h4>
                <Link to="/all-notification" className="btn btn-outline-secondary">
                    <i className="fa-regular fa-circle-left"></i> Back
                </Link>
            </div>

            <div className="card shadow p-4">
                <form className="row g-3" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="col-md-4">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input type="text" name="title" id="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="Enter notification title" required />
                    </div>

                    {/* Body */}
                    <div className="col-md-4">
                        <label htmlFor="body" className="form-label">Body</label>
                        <input type="text" name="body" id="body" className="form-control" value={formData.body} onChange={handleChange} placeholder="Enter notification message" required />
                    </div>

                    {/* Image Upload */}
                    <div className="col-md-4">
                        <label htmlFor="image" className="form-label">Image (optional)</label>
                        <input type="file" id="image" name="image" accept="image/*" className="form-control" onChange={handleFileChange} />
                        {preview && (
                            <div className="mt-2">
                                <img src={preview} alt="preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc", }} />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-44 mt-3">
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>Saving...
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
