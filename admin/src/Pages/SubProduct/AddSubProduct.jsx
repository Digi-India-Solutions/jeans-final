import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Autocomplete, TextField } from "@mui/material";
import JoditEditor from "jodit-react";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const AddSubProduct = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [productList, setProductList] = useState([]);
    const [sizeList, setSizeList] = useState([]);
    const [colorList, setColorList] = useState([]);
    const [formData, setFormData] = useState({
        productId: "",
        productName: "",
        productDescription: "",
        categoryId: [],
        color: "",
        sizes: [],
        price: "",
        set: "",
        finalPrice: "",
        subProductImage: [],
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchColor();
        fetchSize();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await getData("api/product/get-all-products-with-pagination");
            if (response.success) setProductList(response.data || []);
        } catch (error) {
            toast.error("Failed to fetch products!");
        }
    };

    const fetchColor = async () => {
        try {
            const response = await getData("api/color/get_all_colors");
            if (response.success) setColorList(response.data);
        } catch (error) {
            toast.error("Error fetching colors!");
        }
    };

    const fetchSize = async () => {
        try {
            const response = await getData("api/size/get_all_sizes");
            if (response.success) setSizeList(response.data);
        } catch (error) {
            toast.error("Error fetching sizes!");
        }
    };

    const handleProductSelect = (event, value) => {
        if (value) {
            setFormData((prev) => ({
                ...prev,
                productId: value._id,
                productName: value.productName,
                price: value.price || "",
            }));

            if (formData.set) {
                const price = parseFloat(formData.price) || 0;
                const set = parseFloat(formData.set) || 0;
                setFormData((prev) => ({
                    ...prev,
                    finalPrice: (price * set).toFixed(2),
                }));
            }

        }
    };

    const handleJoditChange = (newContent) => {
        setFormData((prev) => ({
            ...prev,
            productDescription: newContent,
        }));
    };

    const handleFormDataChange = (e) => {
        const { name, value } = e.target;
        let updated = {
            ...formData,
            [name]: value,
        };

        if (name === "price" || name === "set") {
            const price = parseFloat(name === "price" ? value : formData.price) || 0;
            const set = parseFloat(name === "set" ? value : formData.set) || 0;
            updated.finalPrice = (price * set).toFixed(2);
        }

        setFormData(updated);
    };

    const handleFormDataFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files?.length < 3 || files?.length > 8) {
            toast.warning("Please select between 3 to 8 images.");
            e.target.value = "";
            return;
        }
        setFormData((prev) => ({
            ...prev,
            subProductImage: files,
        }));
    };

    const handleFormDataAutocomplete = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value.map((v) => v._id),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.subProductImage?.length < 3) {
            toast.error("Please upload between 3 to 8 images.");
            return;
        }

        setIsLoading(true);
        try {
            const form = new FormData();
            for (let file of formData.subProductImage) {
                form.append("subProductImages", file);
            }

            form.append("productID", formData.productId);
            form.append("productName", formData.productName);
            form.append("productDescription", formData.productDescription);
            form.append("color", formData.color);
            form.append("price", formData.price);
            form.append("set", formData.set);
            form.append("finalPrice", formData.finalPrice);
            form.append("sizes", JSON.stringify(formData.sizes));

            const response = await postData("api/subProduct/create-sub-product", form, true);

            if (response.success) {
                toast.success("Sub product added successfully!");
                navigate("/all-sub-products");
            } else {
                toast.error("Failed to add sub product.");
            }
        } catch (error) {
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
                    <h4>Add Sub Product</h4>
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
                                    onChange={handleProductSelect}
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
                                    onChange={handleFormDataChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label>Sizes*</label>
                                <Autocomplete
                                    multiple
                                    options={sizeList}
                                    getOptionLabel={(opt) => opt.size}
                                    value={sizeList.filter((opt) => formData.sizes.includes(opt._id))}
                                    onChange={(e, newVal) => handleFormDataAutocomplete("sizes", newVal)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </div>

                            <div className="col-md-4">
                                <label>Set*</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="set"
                                    value={formData.set}
                                    onChange={handleFormDataChange}
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
                                    onChange={handleFormDataChange}
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
                                    onChange={handleFormDataFileChange}
                                />
                            </div>

                            <div className="col-md-12 mt-3">
                                <label>Product Description*</label>
                                <JoditEditor
                                    value={formData.productDescription}
                                    onChange={handleJoditChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12 text-center mt-4">
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddSubProduct;
