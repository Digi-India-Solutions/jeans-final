import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditMainCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mainCategoryName: "",
    image: null,
    oldImage: null,
    status: false,
    description: "",
  });

  const [btnLoading, setBtnLoading] = useState(false);

  // Fetch category by ID
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getData(
          `api/mainCategory/get_main-category_by_id/${id}`
        );
        if (response?.success) {
          setFormData({
            mainCategoryName: response.data?.mainCategoryName || "",
            description: response.data?.description || "",
            status: response.data?.status || false,
            oldImage: response.data?.images?.[0] || null,
            image: null,
          });
        } else {
          toast.error(response.message || "Failed to fetch category");
        }
      } catch (error) {
        toast.error("Error fetching category");
        console.error("Fetch category error:", error);
      }
    };

    fetchCategory();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const payload = new FormData();
      payload.append("mainCategoryName", formData.mainCategoryName);
      payload.append("status", formData.status);
      if (formData.description) payload.append("description", formData.description);
      if (formData.image) {
        payload.append("images", formData.image);
      } else if (formData.oldImage) {
        payload.append("oldImage", formData.oldImage);
      }

      const response = await postData(
        `api/mainCategory/update-main-category/${id}`,
        payload
      );

      if (response?.success) {
        toast.success(response.message || "Category updated successfully");
        navigate("/all-main-category");
      } else {
        toast.error(response.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Error updating category");
      console.error("Update category error:", error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Main Category</h4>
        </div>
        <div className="links">
          <Link to="/all-main-category" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          {/* Category Name */}
          <div className="col-md-6">
            <label className="form-label">Main Category Name</label>
            <input
              type="text"
              name="mainCategoryName"
              className="form-control"
              value={formData.mainCategoryName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="col-md-6">
            <label className="form-label">Category Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="form-control"
              onChange={handleChange}
            />
            {formData.oldImage && !formData.image && (
              <img
                src={formData.oldImage}
                alt="Current"
                width="100"
                style={{ marginTop: "10px", borderRadius: "6px" }}
              />
            )}
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                width="100"
                style={{ marginTop: "10px", borderRadius: "6px" }}
              />
            )}
          </div>

          {/* Description (optional future use) */}
          {/* <div className="col-md-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div> */}

          {/* Status */}
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="status"
                id="status"
                checked={formData.status}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="status">
                Active on Homepage
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-success"
              disabled={btnLoading}
            >
              {btnLoading ? "Please wait..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditMainCategory;
