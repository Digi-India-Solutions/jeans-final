import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditCoupon = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ couponCode: "", discount: "", couponTitle: "", minCartAmount: "", maxDiscountAmount: "", });
    const [btnLoading, setBtnLoading] = useState(false);

    // Input fields config
    const fields = [
        { name: "couponCode", label: "Coupon Code", type: "text" },
        { name: "discount", label: "Coupon Discount", type: "text" },
        { name: "couponTitle", label: "Coupon Title", type: "text" },
        { name: "minCartAmount", label: "Min Cart Amount", type: "number" },
        { name: "maxDiscountAmount", label: "Max Discount Amount", type: "number" },
    ];

    // Fetch coupon data on mount
    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const response = await getData(`api/coupon/get-coupon-by-id/${id}`);
                if (response?.success) {
                    setFormData({
                        couponCode: response?.coupon?.couponCode || "",
                        discount: response?.coupon?.discount || "",
                        couponTitle: response?.coupon?.couponTitle || "",
                        minCartAmount: response?.coupon?.minCartAmount || "",
                        maxDiscountAmount: response?.coupon?.maxDiscountAmount || "",
                    });
                }
            } catch (error) {
                toast.error("Error fetching coupon data");
                console.error("Error fetching coupon:", error);
            }
        };
        fetchCoupon();
    }, [id]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "minCartAmount" || name === "maxDiscountAmount" || name === "discount") {
            const numericValue = value.replace(/[^0-9]/g, ""); // only numbers
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setBtnLoading(true);

        try {
            const response = await postData(`api/coupon/update-coupon/${id}`, formData);
            if (response?.success) {
                toast.success(response.message || "Coupon updated successfully");
                navigate("/all-coupen");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error updating coupon");
            console.error("Error updating coupon:", error);
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>Edit Coupon</h4>
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
                            <label htmlFor={name} className="form-label">{label}</label>
                            <input type={type} name={name} id={name} className="form-control" value={formData[name]} onChange={handleChange} required />
                        </div>
                    ))}

                    <div className="col-12 text-center mt-3">
                        <button type="submit" className="btn btn-success" disabled={btnLoading}>
                            {btnLoading ? "Please Wait..." : "Update Coupon"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditCoupon;
