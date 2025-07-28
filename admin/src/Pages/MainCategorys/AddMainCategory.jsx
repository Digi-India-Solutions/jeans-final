import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const AddMainCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ subCategoryName: "", image: null, status: false, subCategoryId: [], description: "" });
  const navigate = useNavigate();

  // const handleJoditChange = (newValue) => {
  //   setFormData({ ...formData, description: newValue });
  // };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prevData) => ({ ...prevData, image: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({ ...prevData, status: !prevData.status, }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // const uploadData = new FormData();
    // uploadData.append("mainCategoryName", formData.mainCategoryName);
    // uploadData.append("images", formData.image);
    // uploadData.append("status", formData.status);
    // uploadData.append("productId", JSON.stringify(formData.productId));
    // uploadData.append("description", formData.description);
    const body = { mainCategoryName: formData.mainCategoryName, status: formData.status, }
    try {
      const response = await postData("api/mainCategory/create-main-category", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response=>>>", response);
      if (response?.success === true) {
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
          {/* <div className="col-md-4">
            <label htmlFor="image" className="form-label">
              Sub Category Image
            </label>
            <input type="file" name="image" className="form-control" id="image" accept="image/*" onChange={handleChange}
              required />
            {formData.image && (
              <img src={URL.createObjectURL(formData.image)} alt="Preview" width="100" />
            )}
          </div> */}

          <div className="col-md-4">
            <label htmlFor="name" className="form-label">
              Main Category Name
            </label>
            <input type="text" name="mainCategoryName" className="form-control" id="mainCategoryName" value={formData.mainCategoryName} onChange={handleChange} required />
          </div>

          {/* <div className="col-md-4" style={{ marginTop: "10px" }}>
            <label className="form-label">Select Sub Category</label>
            <Autocomplete
              multiple
              options={categoryList}
              value={categoryList.filter((product) => formData?.subCategoryId?.includes(product._id))}
              getOptionLabel={(option) => option.productName}
              onChange={(e, newValue) => setFormData((prev) => ({ ...prev, productId: newValue.map((product) => product._id), }))
              }
              renderInput={(params) => <TextField {...params} label="Select Product" />}
            />
          </div> */}

          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="status" checked={formData.status} onChange={handleCheckboxChange} />
              <label className="form-check-label" htmlFor="status">
                Active on Homepage
              </label>
            </div>
          </div>
          {/* 
          <hr />
          <div className="col-md-12">
            <label className="form-label">Sub Category Details</label>
            <JoditEditor value={formData.description} onChange={handleJoditChange} />
          </div> */}

          <div className="col-md-12 mt-3">
            <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add Main Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddMainCategory;
