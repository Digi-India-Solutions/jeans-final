import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const AddSubCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({ subCategoryName: "", image: null, status: false, subCategoryId: [], description: "" });
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchCategory = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await getData("api/subProduct/get-all-sub-products");
  //       console.log("response=>>>", response);
  //       if (response?.success === true) {
  //         setCategoryList(response?.data || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchCategory();
  // }, []);

  const handleJoditChange = (newValue) => {
    setFormData({ ...formData, description: newValue });
  };

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

    const uploadData = new FormData();
    uploadData.append("subCategoryName", formData.subCategoryName);
    uploadData.append("images", formData.image);
    uploadData.append("status", formData.status);
    // uploadData.append("productId", JSON.stringify(formData.productId));
    uploadData.append("description", formData.description);

    try {
      const response = await postData("api/subCategory/create-sub-category", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response=>>>", response);
      if (response?.success === true) {
        toast.success(response?.message || "Category created successfully");
        navigate("/all-sub-category");
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
          <Link to="/all-sub-category" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="image" className="form-label">
              Sub Category Image
            </label>
            <input type="file" name="image" className="form-control" id="image" accept="image/*" onChange={handleChange}
              required />
            {formData.image && (
              <img src={URL.createObjectURL(formData.image)} alt="Preview" width="100" />
            )}
          </div>

          <div className="col-md-4">
            <label htmlFor="name" className="form-label">
              Sub Category Name
            </label>
            <input type="text" name="subCategoryName" className="form-control" id="subCategoryName" value={formData.subCategoryName} onChange={handleChange} required />
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

          <hr />
          <div className="col-md-12">
            <label className="form-label">Sub Category Details</label>
            <JoditEditor value={formData.description} onChange={handleJoditChange} />
          </div>

          <div className="col-md-12 mt-3">
            <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add Sub Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddSubCategory;
