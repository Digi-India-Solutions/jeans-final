import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData, serverURL } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const EditSubCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subCategoryName: "",
    image: null,
    status: false,
    description: "",
    // productId: [],
    oldImage: null,
  });
  const [btnLoading, setBtnLoading] = useState(false);
  // const [productList, setProductList] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getData(`api/subCategory/get_sub-category_by_id/${id}`);
        if (response?.success) {
          setFormData({
            subCategoryName: response?.data?.subCategoryName || "",
            description: response?.data?.description || "",
            // productId: response?.data?.productId?.map(p => p._id) || [],
            status: response?.data?.status || false,
            oldImage: response?.data?.images?.[0] || null,
            image: null,
          });
        }
      } catch (error) {
        toast.error("Error fetching category data");
        console.error("Fetch category error:", error);
      }
    };

    fetchCategory();
  }, [id]);

  const handleJoditChange = (newValue) => {
    setFormData(prev => ({ ...prev, description: newValue }));
  };

  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "file") {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, status: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const payload = new FormData();
    payload.append("subCategoryName", formData.subCategoryName);
    if (formData.image) payload.append("images", formData.image);
    payload.append("status", formData.status);
    payload.append("description", formData.description);
    // payload.append("productId", JSON.stringify(formData.productId));
    if (formData.oldImage) payload.append("oldImage", formData.oldImage);

    try {
      const response = await postData(`api/subCategory/update-sub-category/${id}`, payload);
      console.log("response=>>>", response);
      if (response?.success) {
        toast.success(response.message);
        navigate("/all-sub-category");
      } else {
        toast.error(response.message || "Failed to update category");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating category");
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
          <Link to="/all-sub-category" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="form-label">Sub Category  Name</label>
            <input type="text" name="subCategoryName" className="form-control" value={formData.subCategoryName} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Sub Category Image</label>
            <input type="file" name="image" className="form-control" onChange={handleChange} />
            {formData.oldImage && (
              <img src={`${formData.oldImage}`} alt="Old" width="100" style={{ marginTop: "10px" }} />
            )}
          </div>
          <div className="col-md-12">
            <label className="form-label">Description</label>
            <JoditEditor value={formData.description} onChange={handleJoditChange} />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="status" id="status" checked={formData.status} onChange={handleChange} />
              <label className="form-check-label" htmlFor="status">
                Active on Homepage
              </label>
            </div>
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-success"
              disabled={btnLoading}
            >
              {btnLoading ? "Please Wait..." : "Update Sub Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSubCategory;
