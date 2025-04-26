import axios from "axios";
import JoditEditor from "jodit-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices.js";
import { Autocomplete, TextField } from "@mui/material";

const AddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: [],
    type: [],
    productImage: [],
    price: ""
  });

  const navigate = useNavigate();

  const fetchCategory = async () => {
    try {
      const response = await getData("api/category/get-all-categorys-with-pagination");
      if (response?.success) {
        setCategoryList(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching Category data");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3 || files.length > 8) {
      toast.warning("Please select between 3 to 8 images.");
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({ ...prev, productImage: files }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.productImage.length < 3 || formData.productImage.length > 8) {
      toast.error("Please select between 3 to 8 images before submitting.");
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "productImage") {
        value.forEach((file) => form.append("productImages", file));
      } else if (key === "categoryId" || key === "type") {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value);
      }
    });

    try {
      const response = await postData("api/product/create-product", form);
      if (response?.success) {
        toast.success("Product added successfully!");
        navigate("/all-products");
      } else {
        toast.error("Failed to add product. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { name: "New Arrival" },
    { name: "Featured Product" },
    { name: "Best Seller" }
  ];

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Add Product</h4>
        </div>
        <div className="links">
          <Link to="/all-products" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3 mt-2" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="form-label">Product Image*</label>
            <input type="file" className="form-control" multiple onChange={handleFileChange} style={{ height: '60px' }} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Product Name*</label>
            <input type="text" name="productName" style={{ height: '60px' }} className="form-control" value={formData.productName} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Select Type</label>
            <Autocomplete
              multiple
              options={typeOptions}
              value={typeOptions.filter((opt) => formData.type.includes(opt.name))}
              onChange={(e, newValue) =>
                setFormData((prev) => ({ ...prev, type: newValue.map((opt) => opt.name) }))
              }
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Select Type" />}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Select Category</label>
            <Autocomplete
              multiple
              options={categoryList}
              value={categoryList.filter((category) => formData.categoryId.includes(category._id))}
              getOptionLabel={(option) => option.name}
              onChange={(e, newValue) =>
                setFormData((prev) => ({ ...prev, categoryId: newValue.map((cat) => cat._id) }))
              }
              renderInput={(params) => <TextField {...params} label="Select Category" />}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price*</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={formData.price}
              onChange={handleChange}
              required
              style={{ height: '60px' }}
            />
          </div>

          {/* <div className="col-md-4">
            <label className="form-label">Total Stoke*</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={formData.stoke}
              onChange={handleChange}
              required
              style={{ height: '60px' }}
            />
          </div> */}

          <div className="col-md-12 mt-4 text-center">
            <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
