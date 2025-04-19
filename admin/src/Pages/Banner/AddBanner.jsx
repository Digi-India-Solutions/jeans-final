import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices.js";

const AddBanner = () => {
  const [formData, setFormData] = useState({
    bannerName: "",
    bannerStatus: false,
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bannerImage) {
      toast.error("Please select a banner image");
      return;
    }

    try {
      setIsLoading(true);
      const submitData = new FormData();
      submitData.append("name", formData.bannerName);
      submitData.append("images", bannerImage);
      submitData.append("isActive", formData.bannerStatus);

      const response = await postData("api/banner/create", submitData);
      if (response.status === true) {
        toast.success("Banner added successfully");
        navigate("/all-banners");
        setFormData({ bannerName: "", bannerStatus: false });
        setBannerImage(null);
        setPreviewImage(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to add banner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Add Shop Banner</h4>
        </div>
        <div className="links">
          <Link to="/all-banners" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="bannerName" className="form-label">
              Shop Banner Name
            </label>
            <input
              type="text"
              name="bannerName"
              value={formData.bannerName}
              onChange={handleChange}
              className="form-control"
              id="bannerName"
              required
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="bannerImage" className="form-label">
              Shop Banner Image
            </label>
            <input
              type="file"
              name="bannerImage"
              className="form-control"
              id="bannerImage"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="bannerStatus"
                id="bannerStatus"
                checked={formData.bannerStatus}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="bannerStatus">
                Active
              </label>
            </div>
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn ${isLoading ? "not-allowed" : "allowed"}`}
            >
              {isLoading ? "Please Wait..." : "Add Banner"}
            </button>
          </div>
        </form>
      </div>

      {previewImage && (
        <div className="preview-section mt-4 text-center">
          <h5>Preview</h5>
          <img
            src={previewImage}
            alt="Preview"
            className="img-fluid mt-2"
            style={{ maxWidth: "300px", borderRadius: "5px" }}
          />
        </div>
      )}
    </>
  );
};

export default AddBanner;
