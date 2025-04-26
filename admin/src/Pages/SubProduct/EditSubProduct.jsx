import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getData, postData } from "../../services/FetchNodeServices";
import { ToastContainer, toast } from "react-toastify";
import { Autocomplete, TextField } from "@mui/material";
import JoditEditor from "jodit-react";
import "react-toastify/dist/ReactToastify.css";

const EditSubProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [sizeList, setSizeList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    productDescription: "",
    color: "",
    sizes: [],
    set: 1,
    price: 0,
    finalPrice: 0,
    subProductImage: [],
    oldProductImages: [],
  });

  // Fetch SubProduct Details
  useEffect(() => {
    const fetchSubProduct = async () => {
      try {
        const res = await getData(`api/subProduct/get_product_by_id/${id}`);
        if (res?.status) {
          const p = res.data;
          setFormData({
            productId: p.productId?._id || "",
            productName: p.productId?.productName || "",
            productDescription: p.productDescription || "",
            color: p.color || "",
            sizes: p.sizes?.map((s) => s._id) || [],
            price: p.productId?.price || 0,
            set: p.set || 1,
            finalPrice: p.finalPrice || 0,
            subProductImage: [],
            oldProductImages: p.productImages || [],
          });
        } else {
          toast.error("Failed to fetch sub product.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading sub product details!");
      }
    };
    fetchSubProduct();
  }, [id]);

  // Fetch dropdown lists
  useEffect(() => {
    fetchProductList();
    fetchSizeList();
    fetchColorList();
  }, []);

  const fetchProductList = async () => {
    try {
      const res = await getData("api/product/get-all-products-with-pagination");
      if (res.success) setProductList(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch products!");
    }
  };

  const fetchSizeList = async () => {
    try {
      const res = await getData("api/size/get_all_sizes");
      if (res.success) setSizeList(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch sizes!");
    }
  };

  const fetchColorList = async () => {
    try {
      const res = await getData("api/color/get_all_colors");
      if (res.success) setColorList(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch colors!");
    }
  };

  // Handlers
  const handleProductChange = (event, value) => {
    if (value) {
      const price = value.price || 0;
      setFormData((prev) => ({
        ...prev,
        productId: value._id,
        productName: value.productName,
        price,
        finalPrice: (price * prev.set).toFixed(2),
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "price" || name === "set") {
      const price = parseFloat(name === "price" ? value : formData.price) || 0;
      const set = parseFloat(name === "set" ? value : formData.set) || 1;
      updated.finalPrice = (price * set).toFixed(2);
    }

    setFormData(updated);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3 || files.length > 8) {
      toast.warning("Please select between 3 to 8 images.");
      return;
    }
    setFormData((prev) => ({ ...prev, subProductImage: files }));
  };

  const handleSizeChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      sizes: value.map((v) => v._id),
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      productDescription: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = new FormData();
      if (formData.subProductImage.length > 0) {
        formData.subProductImage.forEach((file) => {
          form.append("subProductImages", file);
        });
      } else {
        // If no new image is selected, send old images
        form.append("oldImages", JSON.stringify(formData.oldProductImages));
      }

      form.append("productId", formData.productId);
      form.append("productName", formData.productName);
      form.append("productDescription", formData.productDescription);
      form.append("color", formData.color);
      form.append("price", formData.price);
      form.append("set", formData.set);
      form.append("finalPrice", formData.finalPrice);
      form.append("sizes", JSON.stringify(formData.sizes));

      const response = await postData(`api/subProduct/update-sub-product/${id}`, form);

      if (response.success) {
        toast.success("Sub Product updated successfully!");
        navigate("/all-sub-products");
      } else {
        toast.error("Failed to update sub product.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Sub Product</h4>
        </div>
        <div className="links">
          <Link to="/all-sub-products" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3 mt-2" onSubmit={handleSubmit}>
          <div className="variant-container border p-3 mb-3">
            <div className="row">
              <div className="col-md-4">
                <label>Product*</label>
                <Autocomplete
                  options={productList}
                  getOptionLabel={(opt) => opt.productName || ""}
                  value={productList.find((p) => p._id === formData.productId) || null}
                  onChange={handleProductChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>

              <div className="col-md-4">
                <label>Color*</label>
                <input
                  type="text"
                  className="form-control"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label>Sizes*</label>
                <Autocomplete
                  multiple
                  options={sizeList}
                  getOptionLabel={(opt) => opt.size}
                  value={sizeList.filter((opt) => formData.sizes.includes(opt._id))}
                  onChange={handleSizeChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>

              <div className="col-md-4">
                <label>Set*</label>
                <input
                  type="number"
                  className="form-control"
                  name="set"
                  min={1}
                  value={formData.set}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label>Price*</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  disabled
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label>Final Price</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.finalPrice}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label>Images*</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>

              <div className="col-md-12 mt-3">
                <label>Product Description*</label>
                <JoditEditor
                  value={formData.productDescription}
                  onChange={handleDescriptionChange}
                />
              </div>
            </div>
          </div>

          <div className="col-md-12 text-center mt-4">
            <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSubProduct;




// import axios from "axios";
// import JoditEditor from "jodit-react";
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { getData, postData } from "../../services/FetchNodeServices.js";
// import { Autocomplete, TextField } from "@mui/material";

// const AddProduct = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [categoryList, setCategoryList] = useState([])
//   const [sizeList, setSizeList] = useState([])
//   const [colorList, setColorList] = useState([])
//   const [formData, setFormData] = useState({ productName: "", categoryId: [], productDescription: "", type: "", productImage: [], Variant: [{ productSingleImage: '', color: "", sizes: [], price: "", set: "", finalPrice: "",  },] });

//   const navigate = useNavigate();

//   const typeOptions = [{ name: "New Arrival" }, { name: "Featured Product" }, { name: "Best Seller" }];
//   console.log("XXXXXX:-", formData)
//   return (
//     // <>
        //     <ToastContainer />
        //     <div className="bread">
        //         <div className="head">
        //             <h4>Add Product</h4>
        //         </div>
        //         <div className="links">
        //             <Link to="/all-products" className="add-new">
        //                 Back <i className="fa-regular fa-circle-left"></i>
        //             </Link>
        //         </div>
        //     </div>

        //     <div className="d-form">
        //         <form className="row g-3 mt-2" onSubmit={handleSubmit}>
        //             <div className="col-md-3">
        //                 <label className="form-label">Product Image*</label>
        //                 <input type="file" className="form-control" multiple onChange={handleFileChange} />
        //             </div>

        //             <div className="col-md-3">
        //                 <label className="form-label">Product Name*</label>
        //                 <input type="text" name="productName" className="form-control" value={formData.productName} onChange={handleChange} required />
        //             </div>

        //             <div className="col-md-3">
        //                 <label className="form-label">Select Type</label>
        //                 <Autocomplete
        //                     multiple
        //                     options={typeOptions}
        //                     value={typeOptions.filter((opt) => formData.type.includes(opt.name))}
        //                     onChange={(e, newValue) => setFormData((prev) => ({ ...prev, type: newValue.map((opt) => opt.name), }))
        //                     }
        //                     getOptionLabel={(option) => option.name}
        //                     // value={typeOptions.find((opt) => opt.name === formData.type) || null}
        //                     // onChange={(e, value) => setFormData({ ...formData, type: value?.name || "" })}
        //                     renderInput={(params) => <TextField {...params} label="Select Type" />}
        //                 />
        //             </div>

        //             <div className="col-md-3" >
        //                 <label className="form-label">Select Category</label>
        //                 <Autocomplete
        //                     multiple
        //                     options={categoryList}
        //                     value={categoryList.filter((category) => formData.categoryId.includes(category._id))}
        //                     getOptionLabel={(option) => option.name}
        //                     onChange={(e, newValue) => setFormData((prev) => ({ ...prev, categoryId: newValue.map((category) => category._id), }))
        //                     }
        //                     renderInput={(params) => <TextField {...params} label="Select Category" />}
        //                 />
        //             </div>

        //             <div className="col-md-12">
        //                 <label className="form-label">Product Description*</label>
        //                 <JoditEditor value={formData.productDescription} onChange={handleJoditChange} />
        //             </div>

        //             {formData.Variant.map((variant, index) => (
        //                 <div key={index} className="variant-container border p-3 mb-3">
        //                     <div className="row">
        //                         <div className="col-md-2">
        //                             <label className="form-label">Color*</label>
        //                             <Autocomplete
        //                                 options={colorList}
        //                                 getOptionLabel={(option) => option.colorName}
        //                                 value={colorList.find((opt) => opt._id === variant.color) || null}
        //                                 onChange={(e, value) => handleVariantAutocomplete(index, "color", value?._id || "")}
        //                                 renderInput={(params) => <TextField {...params} label="Color" />}
        //                             />
        //                         </div>

        //                         <div className="col-md-2">
        //                             <label className="form-label">Sizes*</label>
        //                             <Autocomplete
        //                                 multiple
        //                                 options={sizeList}
        //                                 getOptionLabel={(option) => option.size}
        //                                 value={sizeList.filter((opt) => variant.sizes.includes(opt._id))}
        //                                 onChange={(e, newValues) =>
        //                                     handleVariantAutocomplete(index, "sizes", newValues.map((val) => val._id))
        //                                 }
        //                                 renderInput={(params) => <TextField {...params} label="Sizes" />}
        //                             />
        //                         </div>

        //                         <div className="col-md-2">
        //                             <label className="form-label">Price*</label>
        //                             <input type="number" name="price" className="form-control" value={variant.price} onChange={(e) => handleVariantChange(index, e)} required />
        //                         </div>

        //                         <div className="col-md-2">
        //                             <label className="form-label">Discount %*</label>
        //                             <input type="number" name="discountPrice" className="form-control" value={variant.discountPrice} onChange={(e) => handleVariantChange(index, e)} required />
        //                         </div>

        //                         <div className="col-md-2">
        //                             <label className="form-label">Final Price*</label>
        //                             <input type="number" name="finalPrice" className="form-control" value={variant.finalPrice} readOnly />
        //                         </div>

        //                         <div className="col-md-2">
        //                             <label className="form-label">Tax</label>
        //                             <input type="text" name="tax" className="form-control" value={variant.tax} onChange={(e) => handleVariantChange(index, e)} />
        //                         </div>

        //                         {index > 0 && (
        //                             <div className="col-md-2 mt-4">
        //                                 <button type="button" className="btn btn-danger" onClick={() => removeVariant(index)}>
        //                                     Delete
        //                                 </button>
        //                             </div>
        //                         )}
        //                     </div>
        //                 </div>
        //             ))}

        //             <div>
        //                 <button type="button" className="btn btn-primary" onClick={addVariant}>
        //                     Add More
        //                 </button>
        //             </div>

        //             <div className="col-md-12 mt-4 text-center">
        //                 <button type="submit" className="btn btn-success" disabled={isLoading}>
        //                     {isLoading ? "Submitting..." : "Submit"}
        //                 </button>
        //             </div>
        //         </form>
        //     </div>
        // </>
     
//   );
// };

// export default AddProduct;
