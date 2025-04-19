import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const AddCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", image: null, status: false,
    // productId: [], 
    description: ""
  });
  // const [productList, setProductList] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await getData("api/product/get-all-products-with-pagination");
  //       if (response?.success === true) {
  //         setProductList(response?.data || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchProducts();
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
    uploadData.append("name", formData.name);
    uploadData.append("images", formData.image);
    uploadData.append("status", formData.status);
    // uploadData.append("productId", JSON.stringify(formData.productId));
    uploadData.append("description", formData.description);

    try {
      const response = await postData("api/category/create-category", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response?.success === true) {
        toast.success(response?.message || "Category created successfully");
        navigate("/all-dieses");
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
          <h4>Add Disease</h4>
        </div>
        <div className="links">
          <Link to="/all-dieses" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="image" className="form-label">
              Category Image
            </label>
            <input type="file" name="image" className="form-control" id="image" accept="image/*" onChange={handleChange}
              required />
            {formData.image && (
              <img src={URL.createObjectURL(formData.image)} alt="Preview" width="100" />
            )}
          </div>

          <div className="col-md-4">
            <label htmlFor="name" className="form-label">
              Category Name
            </label>
            <input type="text" name="name" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
          </div>

          {/* <div className="col-md-4" style={{ marginTop: "10px" }}>
            <label className="form-label">Select Product</label>
            <Autocomplete
              multiple
              options={productList}
              value={productList.filter((product) => formData.productId.includes(product._id))}
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
            <label className="form-label">Category Details</label>
            <JoditEditor value={formData.description} onChange={handleJoditChange} />
          </div>

          <div className="col-md-12 mt-3">
            <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddCategory;
