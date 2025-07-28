import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const AddCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mainCategoryList, setMainCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    banner: null,
    status: false,
    mainCategoryId: [],
    description: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchmainCategories = async () => {
      try {
        const response = await getData('api/mainCategory/get-all-main-categorys-with-pagination');
        if (response.success) {
          setMainCategoryList(response.data || []);
        }
      } catch (error) {
        toast.error("Error fetching maincategories");
        console.error(error);
      }
    };

    fetchmainCategories();
  }, []);

  const handleJoditChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, status: !prev.status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const uploadData = new FormData();
    uploadData.append("name", formData.name);
    uploadData.append("image", formData.image);
    uploadData.append("banner", formData.banner);
    uploadData.append("status", formData?.status);
    uploadData.append("description", formData?.description);
    uploadData.append("mainCategoryId", formData?.mainCategoryId);
    // formData.mainCategoryId.forEach((id) => {
    //   uploadData.append("mainCategoryId", id);
    // });

    try {
      const response = await postData("api/category/create-category", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.success) {
        toast.success("Category created successfully");
        navigate("/all-dieses");
      } else {
        toast.error(response?.message || "Error adding category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread d-flex justify-content-between align-items-center mb-3">
        <h4>Add Sub Category</h4>
        <Link to="/all-dieses" className="btn btn-outline-primary">
          Back <i className="fa-regular fa-circle-left"></i>
        </Link>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="image" className="form-label">Category Image *</label>
            <input type="file" name="image" className="form-control" id="image" accept="image/*" onChange={handleChange} required />
            {formData.image && <img src={URL.createObjectURL(formData.image)} alt="Preview" width="100" className="mt-2" />}
          </div>

          <div className="col-md-4">
            <label htmlFor="name" className="form-label"> Sub Category Name *</label>
            <input type="text" name="name" className="form-control" id="name" value={formData.name} onChange={handleChange} required placeholder="Enter category name" />
          </div>

          {/* <div className="col-md-4">
            <label className="form-label">Select Main Categories *</label>
            <Autocomplete
              multiple
              options={mainCategoryList}
              getOptionLabel={(option) => option?.mainCategoryName}
              value={mainCategoryList.filter((item) => formData.mainCategoryId.includes(item?._id))}
              onChange={(e, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  mainCategoryId: newValue.map((item) => item._id),
                }))
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Choose maincategories" variant="outlined" />
              )}
            />
          </div> */}
          <div className="col-md-4">
            <label className="form-label">Select Main Category *</label>
            <Autocomplete
              options={mainCategoryList}
              getOptionLabel={(option) => option?.mainCategoryName || ""}
              value={
                mainCategoryList.find((item) => item._id === formData.mainCategoryId) || null
              }
              onChange={(e, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  mainCategoryId: newValue?._id || "",
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Choose main category"
                  variant="outlined"
                />
              )}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="banner" className="form-label">Category Banner *</label>
            <input type="file" name="banner" className="form-control" id="banner" accept="image/*" onChange={handleChange} required />
            {formData.banner && <img src={URL.createObjectURL(formData.banner)} alt="Preview" width="100" className="mt-2" />}
          </div>

          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="status" checked={formData.status} onChange={handleCheckboxChange} />
              <label className="form-check-label" htmlFor="status">Active on Homepage</label>
            </div>
          </div>

          <div className="col-md-12">
            <label className="form-label">Category Details</label>
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

export default AddCategory;
