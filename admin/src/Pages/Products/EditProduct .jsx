import axios from "axios";
import JoditEditor from "jodit-react";
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
    const [categoryList, setCategoryList] = useState([])
    const [sizeList, setSizeList] = useState([])
    const [colorList, setColorList] = useState([])
    const [formData, setFormData] = useState({ productName: "", productDescription: "", categoryId: [], type: "", productImage: [], Variant: [{ color: "", sizes: [], price: "", discountPrice: "", finalPrice: "", tax: "", },] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productResponse = await getData(`api/product/get_product_by_id/${id}`);
                const productData = productResponse?.data;
                if (productResponse?.status) {
                    setFormData({
                        ...productData,
                        productName: productData?.productName || "",
                        productDescription: productData?.productDescription || "",
                        Variant: productData?.Variant?.map(v => ({ ...v, sizes: v?.sizes?.map(size => size?._id), color: v.color._id, price: v?.price || 0, discountPrice: v?.discountPrice || 0, finalPrice: v?.finalPrice || "", tex: v?.tex || "0" })) || [],
                        categoryId: productData?.categoryId?.map(v => v._id) || [],
                        type: productData?.type || [],
                        oldProductImages: productData?.productImages || [],
                        // sizes: productData?.sizes?.map(size =>size?._id ) || [],
                        // colors: productData?.colors?.map(color => color?._id) || [],

                    });
                } else toast.error("Error fetching product details.");
            } catch (error) {
                toast.error("Error loading product data!");
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, [id]);

    const fetchCategory = async () => {
        try {
            const response = await getData("api/category/get-all-categorys-with-pagination");
            console.log("response.data:----", response)
            if (response?.success) {
                setCategoryList(response.data);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "Error fetching Category data");
        }
    }

    const fetchColor = async () => {
        try {
            const response = await getData("api/color/get_all_colors");
            // console.log("response.data:----", response)
            if (response?.success) {
                setColorList(response.data);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "Error fetching color data");
        }
    };

    const fetchSize = async () => {
        try {
            const response = await getData("api/size/get_all_sizes");
            // console.log("response.data:----", response)
            if (response?.success) {
                setSizeList(response.data);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "Error fetching size data");
        }
    };

    useEffect(() => {
        fetchCategory()
        fetchColor()
        fetchSize()
    }, [])
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length < 3 || files.length > 8) {
            alert("Please select between 3 to 8 images.");
            e.target.value = "";
            return;
        }
        setFormData({ ...formData, productImage: files });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleJoditChange = (newValue) => {
        setFormData((prev) => ({ ...prev, productDescription: newValue }));
    };

    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const updatedVariants = [...formData.Variant];
        updatedVariants[index][name] = value;

        if (name === "price" || name === "discountPrice") {
            const price = parseFloat(updatedVariants[index].price) || 0;
            const discount = parseFloat(updatedVariants[index].discountPrice) || 0;
            updatedVariants[index].finalPrice = (price - (price * discount) / 100).toFixed(2);
        }

        setFormData({ ...formData, Variant: updatedVariants });
    };

    const handleVariantAutocomplete = (index, field, value) => {
        const updatedVariants = [...formData.Variant];
        updatedVariants[index][field] = value;
        setFormData({ ...formData, Variant: updatedVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData?.productImage?.length === 0 || formData?.productImage?.length > 8) {
            alert("Please select between 3 to 8 images before submitting.");
            setIsLoading(false);
            return;
        }

        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "Variant" || key === "categoryId" || key === "type") {
                form.append(key, JSON.stringify(formData[key]));
            } else if (key === "productImage") {
                formData.productImage.forEach((file) => form.append("productImages", file));
            } else if (key === "oldProductImages") {
                formData.oldProductImages.forEach(file => form.append("oldProductImages", file));
            } else {
                form.append(key, formData[key]);
            }
        });



        try {
            const response = await postData(`api/product/update-product/${id}`, form);
            if (response.success === true) {
                toast.success("Product updated successfully!");
                navigate("/all-products");
            }
        } catch (error) {
            toast.error("Failed to update product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    console.log("XXXXXXXXXXXX", formData)
    const addVariant = () => {
        setFormData({ ...formData, Variant: [...formData.Variant, { color: "", sizes: [], price: "", discountPrice: "", finalPrice: "", tax: "", },], });
    };

    const removeVariant = (index) => {
        const updatedVariants = formData.Variant.filter((_, i) => i !== index);
        setFormData({ ...formData, Variant: updatedVariants });
    };
    const typeOptions = [{ name: "New Arrival" }, { name: "Featured Product" }, { name: "Best Seller" }];

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
                    <div className="col-md-3">
                        <label className="form-label">Product Image*</label>
                        <input type="file" className="form-control" multiple onChange={handleFileChange} />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Product Name*</label>
                        <input type="text" name="productName" className="form-control" value={formData.productName} onChange={handleChange} required />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Select Type</label>
                        <Autocomplete
                            multiple
                            options={typeOptions}
                            value={typeOptions.filter((opt) => formData.type.includes(opt.name))}
                            onChange={(e, newValue) => setFormData((prev) => ({ ...prev, type: newValue.map((opt) => opt.name), }))
                            }
                            getOptionLabel={(option) => option.name}
                            // value={typeOptions.find((opt) => opt.name === formData.type) || null}
                            // onChange={(e, value) => setFormData({ ...formData, type: value?.name || "" })}
                            renderInput={(params) => <TextField {...params} label="Select Type" />}
                        />
                    </div>

                    <div className="col-md-3" >
                        <label className="form-label">Select Category</label>
                        <Autocomplete
                            multiple
                            options={categoryList}
                            value={categoryList.filter((category) => formData.categoryId.includes(category._id))}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, newValue) => setFormData((prev) => ({ ...prev, categoryId: newValue.map((category) => category._id), }))
                            }
                            renderInput={(params) => <TextField {...params} label="Select Category" />}
                        />
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Product Description*</label>
                        <JoditEditor value={formData.productDescription} onChange={handleJoditChange} />
                    </div>

                    {formData.Variant.map((variant, index) => (
                        <div key={index} className="variant-container border p-3 mb-3">
                            <div className="row">
                                <div className="col-md-2">
                                    <label className="form-label">Color*</label>
                                    <Autocomplete
                                        options={colorList}
                                        getOptionLabel={(option) => option.colorName}
                                        value={colorList.find((opt) => opt._id === variant.color) || null}
                                        onChange={(e, value) => handleVariantAutocomplete(index, "color", value?._id || "")}
                                        renderInput={(params) => <TextField {...params} label="Color" />}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Sizes*</label>
                                    <Autocomplete
                                        multiple
                                        options={sizeList}
                                        getOptionLabel={(option) => option.size}
                                        value={sizeList.filter((opt) => variant.sizes.includes(opt._id))}
                                        onChange={(e, newValues) =>
                                            handleVariantAutocomplete(index, "sizes", newValues.map((val) => val._id))
                                        }
                                        renderInput={(params) => <TextField {...params} label="Sizes" />}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Price*</label>
                                    <input type="number" name="price" className="form-control" value={variant.price} onChange={(e) => handleVariantChange(index, e)} required />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Discount %*</label>
                                    <input type="number" name="discountPrice" className="form-control" value={variant.discountPrice} onChange={(e) => handleVariantChange(index, e)} required />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Final Price*</label>
                                    <input type="number" name="finalPrice" className="form-control" value={variant.finalPrice} readOnly />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Tax</label>
                                    <input type="text" name="tax" className="form-control" value={variant.tax} onChange={(e) => handleVariantChange(index, e)} />
                                </div>

                                {index > 0 && (
                                    <div className="col-md-2 mt-4">
                                        <button type="button" className="btn btn-danger" onClick={() => removeVariant(index)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div>
                        <button type="button" className="btn btn-primary" onClick={addVariant}>
                            Add More
                        </button>
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
