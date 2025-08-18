import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices";

const AddMainCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mainCategoryName: "",
    image: null,
    status: false,
    description: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prevData) => ({ ...prevData, image: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      status: !prevData.status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mainCategoryName.trim()) {
      toast.error("Main Category Name is required");
      return;
    }
    if (!formData.image) {
      toast.error("Image is required");
      return;
    }

    setIsLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("mainCategoryName", formData.mainCategoryName.trim());
      uploadData.append("images", formData.image);
      uploadData.append("status", formData.status);
      if (formData.description) {
        uploadData.append("description", formData.description.trim());
      }

      const response = await postData(
        "api/mainCategory/create-main-category",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response?.success) {
        toast.success(response?.message || "Category created successfully");
        navigate("/all-main-category");
      } else {
        toast.error(response?.message || "Error adding category");
      }
    } catch (error) {
      toast.error(error?.response?.message || "Error adding category");
      console.error("Error adding category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Add Main Category</h4>
        </div>
        <div className="links">
          <Link to="/all-main-category" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="col-md-4">
            <label htmlFor="image" className="form-label">
              Main Category Image
            </label>
            <input
              type="file"
              name="image"
              className="form-control"
              id="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                width="100"
                className="mt-2"
              />
            )}
          </div>

          {/* Name Input */}
          <div className="col-md-4">
            <label htmlFor="mainCategoryName" className="form-label">
              Main Category Name
            </label>
            <input
              type="text"
              name="mainCategoryName"
              className="form-control"
              id="mainCategoryName"
              value={formData.mainCategoryName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Status Checkbox */}
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="status">
                Active on Homepage
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="col-md-12 mt-3">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Add Main Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddMainCategory;
