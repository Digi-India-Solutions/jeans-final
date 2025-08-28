import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices";

const AddCoupon = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ couponCode: "", discount: "", couponTitle: "", minCartAmount: "",  });
    const navigate = useNavigate();

    // Input fields config
    const fields = [
        { name: "couponCode", label: "Coupon Code", type: "text" },
        { name: "discount", label: "Coupon Amount", type: "text" },
        { name: "couponTitle", label: "Coupon Title", type: "text" },
        { name: "minCartAmount", label: "Min Cart Amount", type: "text" },
        // { name: "maxDiscountAmount", label: "Max Discount Amount", type: "text" },
    ];

    // Handle change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "minCartAmount" || name === "maxDiscountAmount" || name === "discount") {
            const numericValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.couponCode || !formData.discount) {
            toast.error("Please fill all required fields");
            setIsLoading(false);
            return;
        }

        try {
            const response = await postData("api/coupon/create-coupon", formData);
            if (response?.success) {
                toast.success(response?.message || "Coupon created successfully");
                navigate("/all-coupen");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error adding coupon");
            console.error("Error adding coupon:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>Add Coupon</h4>
                </div>
                <div className="links">
                    <Link to="/all-coupen" className="add-new">
                        Back <i className="fa-regular fa-circle-left"></i>
                    </Link>
                </div>
            </div>

            <div className="d-form">
                <form className="row g-3" onSubmit={handleSubmit}>
                    {fields.map(({ name, label, type }) => (
                        <div className="col-md-4" key={name}>
                            <label htmlFor={name} className="form-label"> {label} </label>
                            <input type={type} name={name} id={name} className="form-control" value={formData[name]} onChange={handleChange} required />
                        </div>
                    ))}

                    <div className="col-md-12 mt-3">
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Add Coupon"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddCoupon;
