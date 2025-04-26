import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ShowDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const cart = location?.state?.card;

    if (!cart) return <p className="text-center mt-10">No cart data available.</p>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 max-h-[90%] overflow-y-auto relative">
                {/* <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-3xl font-bold"
                >
                    &times;
                </button> */}

                <button
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: "20px", backgroundColor: "#007bff", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem", }}
                >
                    ← Back
                </button>

                <h2 className="text-4xl font-bold text-center text-indigo-700 mb-8">
                    Cart Details
                </h2>

                {/* User Info & Payment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    <div className="bg-indigo-50 p-5 rounded-xl shadow">
                        <h4 className="text-lg font-semibold text-indigo-800 mb-2">Customer Information</h4>
                        <p><strong>Name:</strong> {cart.user?.name}</p>
                        <p><strong>Email:</strong> {cart.user?.email}</p>
                        <p><strong>Phone:</strong> {cart.user?.phone}</p>
                    </div>

                    <div className="bg-green-50 p-5 rounded-xl shadow">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">Payment Details</h4>
                        <p><strong>Total Amount:</strong> ₹{cart.totalAmount}</p>
                        <p><strong>Created At:</strong> {new Date(cart.createdAt).toLocaleString()}</p>
                        {cart.appliedCoupon && (
                            <p className="mt-2 text-green-700 font-medium">
                                Coupon: <strong>{cart.appliedCoupon.code}</strong> (₹{cart.appliedCoupon.discount} off)
                            </p>
                        )}
                    </div>
                </div>

                {/* Products */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Product Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cart.items.map((item) => (
                        <div
                            key={item._id}
                            className="border rounded-xl p-5 shadow hover:shadow-md transition duration-200 bg-white"
                        >
                            <div className="flex gap-4">
                                <img src={item.subProduct?.subProductImages?.[0]} alt="Product" style={{ width: 200, height: 200 }} className="w-28 h-28 object-cover rounded-lg border" />

                                <div className="flex flex-col justify-between text-sm space-y-1">
                                    <p><strong>Product ID:</strong> {item.subProduct?._id}</p>
                                    <p><strong>Product Name:</strong> {item.subProduct?.productId.productName}</p>
                                    <p><strong>Quantity:</strong> {item.quantity}</p>
                                    <p><strong>Price:</strong> ₹{item.price}</p>
                                    <p>
                                        <strong>Status:</strong>
                                        <span className={`ml-2 font-semibold capitalize ${item.status === "pending" ? "text-yellow-600" : "text-green-600"
                                            }`}>
                                            {item.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShowDetails;
