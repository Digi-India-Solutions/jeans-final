import React, { useEffect, useMemo, useState } from "react";
import Button from "../../../components/base/Button";
import { postData } from "../../../services/FetchNodeServices";

function CreateReturnModal({
    setShowCreateReturnModal,
    setReturnForm,
    setSelectedCustomerOrders,
    customers,
    returnForm,
    selectedCustomerOrders,
    refundMethods,
    handleCustomerChange,
    handleOrderChange,
    fetchReturn,
    returns,
}) {
    const [previewOrder, setPreviewOrder] = useState([]);
    const [mathord, setMathord] = useState([]);
    const [withoutOrderData, setWithoutOrderData] = useState([]);

    // ✅ Reset the return form when closing or after creating
    const resetReturnForm = () => {
        setReturnForm({
            customerId: "",
            orderId: "",
            items: [],
            reason: "", refundMethod: refundMethods?.[0] || "Original Payment Method",
        });
        setSelectedCustomerOrders([]);
    };

    // ✅ Create return logic
    const createReturn = async () => {
        const customer = customers?.find((c) => c?._id === returnForm?.customerId);
        const itemsToReturn = returnForm?.items?.filter((item) => item?.returnPcs > 0);

        if (!customer || itemsToReturn.length === 0) {
            alert("Please select customer, order, and set valid return quantities.");
            return;
        }

        const totalRefund = itemsToReturn.reduce(
            (sum, item) => sum + (item?.refundAmount || 0),
            0
        );

        const returnNumber = `RET-${new Date().getFullYear()}-${String(
            returns.length + 1
        ).padStart(3, "0")}`;

        const newReturn = {
            returnNumber,
            customer: customer?.name,
            customerId: customer?._id,
            orderNumber: returnForm?.orderNumber,
            orderId: returnForm?.orderId,
            items: itemsToReturn.map((item) => ({
                name: item?.name,
                availableSizes: item?.availableSizes,
                returnPcs: item?.returnPcs,
                reason: item?.reason,
                refundAmount: item?.refundAmount,
                pcsInSet: item?.pcsInSet,
                productId: item?.productId?._id,
                alreadyReturned: item?.alreadyReturned,
                singlePicPrice: item?.singlePicPrice
            })),
            totalRefund,
            date: new Date().toISOString().split("T")[0],
            status: "Pending",
            refundMethod: returnForm?.refundMethod,
        };

        try {
            const response = await postData("api/return/create-return", { data: newReturn });
            if (response?.success) {
                await fetchReturn();
                resetReturnForm();
                setShowCreateReturnModal(false);
                alert("Return created successfully! Stock will be updated when approved.");
            } else {
                alert("Failed to create return. Please try again.");
            }
        } catch (err) {
            console.error("Error creating return:", err);
            alert("An error occurred while creating return.");
        }
    };

    // ✅ Update item in return form
    const updateReturnItem = (index, field, value, alreadyReturned) => {
        const updatedItems = returnForm.items.map((item, i) => {
            if (i !== index) return item;
            const updated = { ...item, [field]: value };

            if (field === "returnPcs") {
                const qty = Math.min(Math.max(0, value), item?.deliveredPcs ?? 0);
                const price = parseInt(item?.singlePicPrice || item?.price || 0);
                updated.returnPcs = qty;
                updated.refundAmount = qty * price;
                updated.alreadyReturned = alreadyReturned || 0
            }

            return updated;
        });
        setReturnForm({ ...returnForm, items: updatedItems });
    };

    // ✅ Fetch previous returns by customer & order
    const fetchReturnByCustomerAndOrder = async () => {
        if (!returnForm?.customerId || !returnForm?.orderId) return;
        try {
            const data = { customerId: returnForm.customerId, orderId: returnForm.orderId };
            const response = await postData("api/return/get-all-returns-by-customer-and-order", data);
            if (response?.status) setPreviewOrder(response.data);
        } catch (err) {
            console.error("Error fetching previous returns:", err);
        }
    };

    useEffect(() => {
        fetchReturnByCustomerAndOrder();
    }, [returnForm?.customerId, returnForm?.orderId]);

    // ✅ Combine previous returns to calculate remaining qty
    const mergedItems = useMemo(() => {
        if (!returnForm?.items?.length) return [];
        return returnForm.items.map((item) => {

            const returnCount = previewOrder
                ?.flatMap((ch) => ch.items)
                ?.filter((i) => i?.name === item?.name)
                ?.reduce((sum, i) => sum + (i?.returnPcs || 0), 0);
            const remaining = Math.max(item?.deliveredPcs - returnCount, 0);
            const singlePicPrice = item.singlePicPrice
            return { ...item, alreadyReturned: returnCount, remainingQty: remaining, singlePicPrice };
        });
    }, [returnForm?.items, previewOrder]);

    const deliveredOrders = selectedCustomerOrders.filter(
        (order) => order?.status === "Delivered"
    );

    // ✅ Compute total refund at render level
    const totalRefund = mergedItems.reduce(
        (sum, item) =>
            sum +
            (parseInt(item?.returnPcs || 0) * parseInt(item?.singlePicPrice || item?.price || 0)),
        0
    );
    console.log("totalRefund==>", returnForm)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Create Return</h2>
                        <div>
                            <select
                                value={mathord}
                                onChange={(e) => setMathord(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose Mathord</option>
                                {['With Orders', 'Without Orders']?.map((customer, index) => (
                                    <option key={index} value={customer}>
                                        {customer}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setShowCreateReturnModal(false);
                                resetReturnForm();
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* Form */}
                    {mathord === 'Without Orders' ?
                        <div className="space-y-6">
                            {/* Customer Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Customer
                                    </label>
                                    <select
                                        value={returnForm?.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value, "return")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customers?.map((c) => (
                                            <option key={c?._id} value={c?._id}>
                                                {c?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Editable Return Items */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-medium">Return Items</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newItem = {
                                                name: "", deliveredPcs: 0, alreadyReturned: 0,
                                                returnPcs: 0, reason: "", refundAmount: 0,
                                            };
                                            setReturnForm({ ...returnForm, items: [...(returnForm.items || []), newItem], });
                                        }}
                                        className="bg-blue-900 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {returnForm?.items?.length > 0 ? (
                                    <div className="space-y-3">
                                        {returnForm.items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
                                                {/* Remove item */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = returnForm.items.filter((_, i) => i !== index);
                                                        setReturnForm({ ...returnForm, items: updated });
                                                    }}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>

                                                <div className="grid grid-cols-6 gap-4 items-center">
                                                    {/* Editable Name */}
                                                    <div className="col-span-2">
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Item Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.name || ""}
                                                            onChange={(e) => updateReturnItem(index, "name", e.target.value)}
                                                            placeholder="Enter item name"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Delivered PCS */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Delivered PCS
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.deliveredPcs || 0}
                                                            onChange={(e) =>
                                                                updateReturnItem(
                                                                    index,
                                                                    "deliveredPcs",
                                                                    parseInt(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Return Qty */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Return Qty
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={Math.max(item.deliveredPcs - item.alreadyReturned, 0)}
                                                            value={item.returnPcs || 0}
                                                            onChange={(e) =>
                                                                updateReturnItem(
                                                                    index,
                                                                    "returnPcs",
                                                                    parseInt(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Reason */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Reason
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.reason || ""}
                                                            onChange={(e) =>
                                                                updateReturnItem(index, "reason", e.target.value)
                                                            }
                                                            placeholder="Reason for return"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Refund (editable) */}
                                                    <div className="text-center">
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Refund (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.refundAmount || 0}
                                                            onChange={(e) =>
                                                                updateReturnItem(
                                                                    index,
                                                                    "refundAmount",
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm italic mt-3">
                                        No items added yet. Click “+ Add Item” to start.
                                    </p>
                                )}
                            </div>

                            {/* Total Refund */}
                            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total Refund:</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        ₹
                                        {returnForm.items
                                            ?.reduce((sum, i) => sum + (i.refundAmount || 0), 0)
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Refund Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Refund Method
                                </label>
                                <select
                                    value={returnForm?.refundMethod}
                                    onChange={(e) =>
                                        setReturnForm({ ...returnForm, refundMethod: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {refundMethods?.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button className="flex-1 bg-gray-700 text-white hover:bg-gray-900" onClick={() => setShowCreateReturnModal(false)}>Cancel</button>
                                <button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={createReturn}>Create Return</button>
                            </div>
                        </div>

                        :
                        <div className="space-y-6">
                            {/* Customer & Order Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Customer
                                    </label>
                                    <select
                                        value={returnForm?.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value, "return")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customers?.map((customer) => (
                                            <option key={customer?._id} value={customer?._id}>
                                                {customer?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Order
                                    </label>
                                    <select
                                        value={returnForm?.orderId}
                                        onChange={(e) => handleOrderChange(e.target.value, "return")}
                                        disabled={!returnForm?.customerId}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose Order</option>
                                        {deliveredOrders?.map((order) => (
                                            <option key={order?._id} value={order?._id}>
                                                {order?.orderNumber} - ₹{order?.subtotal?.toLocaleString()} (
                                                {order?.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Return Items */}
                            {mergedItems?.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-3">Return Items</h3>
                                    <div className="space-y-3">
                                        {mergedItems.map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-6 gap-4 items-center">
                                                    {/* Item name */}
                                                    <div className="col-span-2">
                                                        <div className="font-medium">Name: {item?.name}</div>
                                                        {/* {item.availableSizes?.length > 0 && (
                                                        <div className="text-sm text-gray-500">
                                                            Sizes: {item.availableSizes.join(", ")}
                                                        </div>
                                                    )} */}
                                                    </div>

                                                    {/* Dispatched */}
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Dispatched PCS</div>
                                                        <div className="font-medium">
                                                            {item?.deliveredPcs ?? 0}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Alrady Return Qty
                                                        </label>
                                                        <div className="text-green-600 font-semibold">
                                                            {item.alreadyReturned}
                                                        </div>
                                                    </div>


                                                    {/* Return Qty */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Return Qty
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item?.deliveredPcs - item.alreadyReturned}
                                                            value={item.returnPcs || 0}
                                                            onChange={(e) =>
                                                                updateReturnItem(
                                                                    index,
                                                                    "returnPcs",
                                                                    parseInt(e.target.value) || 0,
                                                                    item.alreadyReturned

                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Reason */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">
                                                            Reason
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.reason || ""}
                                                            onChange={(e) =>
                                                                updateReturnItem(index, "reason", e.target.value)
                                                            }
                                                            placeholder="Reason"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Refund */}
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Refund</div>
                                                        <div className="font-medium text-orange-600">
                                                            ₹{item.refundAmount?.toLocaleString() || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Refund */}
                                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Refund:</span>
                                            <span className="text-xl font-bold text-orange-600">
                                                ₹{totalRefund.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Refund Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Refund Method
                                </label>
                                <select
                                    value={returnForm?.refundMethod}
                                    onChange={(e) =>
                                        setReturnForm({ ...returnForm, refundMethod: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {refundMethods?.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <Button
                                    onClick={() => {
                                        setShowCreateReturnModal(false);
                                        resetReturnForm();
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={createReturn}
                                    disabled={
                                        !returnForm.customerId ||
                                        !returnForm.orderId ||
                                        mergedItems.every((i) => !i.returnPcs)
                                    }
                                    className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                                >
                                    Create Return
                                </Button>
                            </div>
                        </div>}
                </div>
            </div>
        </div>
    );
}

export default CreateReturnModal;
