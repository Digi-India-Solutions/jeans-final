import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices.js";
import { Autocomplete, TextField } from "@mui/material";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    categoryId: [],
    type: [],
    productImage: [],
   
  });

  const typeOptions = [
    { name: "New Arrival" },
    { name: "Featured Product" },
    { name: "Best Seller" },
  ];

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await getData(`api/product/get_product_by_id/${id}`);
        if (res?.status) {
          const data = res.data;
          setFormData({
            ...data,
            productName: data?.productName || "",
            price: data?.price || "",
            categoryId: data?.categoryId?.map((v) => v._id) || [],
            type: data?.type || [],
            oldProductImages: data?.productImages || [],
          });
        } else {
          toast.error("Error fetching product details.");
        }
      } catch (error) {
        toast.error("Error loading product data!");
        console.error(error);
      }
    };

    fetchProductDetails();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await getData("api/category/get-all-categorys-with-pagination");
      if (response?.success) setCategoryList(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching categories");
    }
  };

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

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "productImage") {
          value.forEach((file) => form.append("productImages", file));
        }  else if (key === "categoryId" || key === "type") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });

      const response = await postData(`api/product/update-product/${id}`, form);

      if (response?.success) {
        toast.success("Product updated successfully!");
        navigate("/all-products");
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      toast.error("Failed to update product. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Product</h4>
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
            <input
              type="file"
              className="form-control"
              multiple
              onChange={handleFileChange}
              style={{ height: "60px" }}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Product Name*</label>
            <input
              type="text"
              name="productName"
              className="form-control"
              value={formData.productName}
              onChange={handleChange}
              required
              style={{ height: "60px" }}
            />
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
              value={categoryList.filter((cat) => formData.categoryId.includes(cat._id))}
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
              value={formData.price || ""}
              onChange={handleChange}
              required
              style={{ height: "60px" }}
            />
          </div>

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

export default EditProduct;