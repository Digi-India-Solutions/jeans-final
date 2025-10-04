import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function CreateReturnModal({ setShowCreateReturnModal, setReturnForm, setSelectedCustomerOrders, customers,
    returnForm, selectedCustomerOrders, refundMethods, handleCustomerChange, handleOrderChange,fetchReturn,
    returns, setReturns }) {

    const createReturn = async () => {
        const customer = customers?.find(c => c?._id === returnForm?.customerId);
        const itemsToReturn = returnForm?.items?.filter(item => item?.returnQty > 0);

        if (!customer || itemsToReturn?.length === 0) {
            alert('Please select customer, order and set return quantities');
            return;
        }

        const totalRefund = itemsToReturn.reduce((sum, item) => sum + item.refundAmount, 0);
        const returnNumber = `RET-2024-${String(returns.length + 1).padStart(3, '0')}`;

        const newReturn = {
            returnNumber,
            customer: customer?.name,
            customerId: customer?._id,
            orderNumber: returnForm?.orderNumber,
            orderId: returnForm?.orderId,
            items: itemsToReturn?.map(item => ({
                name: item?.name,
                availableSizes: item?.availableSizes,
                returnQty: item?.returnQty,
                reason: item?.reason,
                refundAmount: item?.refundAmount,
                pcsInSet: item?.pcsInSet,
                productId: item?.productId?._id
            })),
            totalRefund,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            refundMethod: returnForm?.refundMethod
        };

        // console.log('newReturn===>', newReturn)
        const respons = await postData('api/return/create-return', { data: newReturn })
        // console.log('newReturn===>', respons)
        if (respons.success === true) {
            fetchReturn()
            resetReturnForm();
            setShowCreateReturnModal(false);
            alert(`Return created successfully!\nStock will be incremented when return is approved.`);
        }
        // setReturns([newReturn, ...returns]);
    };


    const resetReturnForm = () => {
        setReturnForm({ customerId: '', orderId: '', items: [], reason: '', refundMethod: 'Original Payment Method' });
        setSelectedCustomerOrders([]);
    };

    const updateReturnItem = (index, field, value) => {
        const updatedItems = returnForm.items.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };

                if (field === 'returnQty') {
                    // updatedItem.returnQty = Math.min(Math.max(0, value), item.dispatchedQty);
                    // updatedItem.refundAmount = updatedItem.returnQty * item.pcsInSet * item.price;
                    updatedItem.returnQty = Math.min(Math.max(0, value), item?.quantity);
                    updatedItem.refundAmount = parseInt(updatedItem?.returnQty) * parseInt(item?.pcsInSet) * parseInt(item?.price || item?.singlePicPrice);
                }

                return updatedItem;
            }
            return item;
        });

        setReturnForm({ ...returnForm, items: updatedItems });
    };



    console.log('returnForm===>', returnForm)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Create Return</h2>
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

                    <div className="space-y-6">
                        {/* Customer & Order Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                                <div className="relative">
                                    <select
                                        value={returnForm?.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value, 'return')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customers.map(customer => (
                                            <option key={customer?._id} value={customer?._id}>
                                                {customer?.name}
                                                {/* ({customer.type}) */}
                                            </option>
                                        ))}
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                                <div className="relative">
                                    <select
                                        value={returnForm?.orderId}
                                        onChange={(e) => handleOrderChange(e.target.value, 'return')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                        disabled={!returnForm?.customerId}
                                    >
                                        <option value="">Choose Order</option>
                                        {selectedCustomerOrders?.map(order => (
                                            <option key={order?._id} value={order?._id}>
                                                {order?.orderNumber} - ₹{order?.subtotal?.toLocaleString()} ({order?.createdAt})
                                            </option>
                                        ))}
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                        </div>

                        {/* Return Items */}
                        {returnForm?.items?.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Return Items</h3>
                                <div className="space-y-3">
                                    {returnForm.items.map((item, index) => {
                                        // Compute refund if not already set
                                        const refund = (item.refundAmount !== undefined)
                                            ? item.refundAmount
                                            : (item?.singlePicPrice || item.price || 0) * (item.returnQty || 0);

                                        return (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-6 gap-4 items-center">
                                                    {/* Name & Sizes */}
                                                    <div className="col-span-2">
                                                        <div className="font-medium">{item?.name}</div>
                                                        {item.availableSizes?.length > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                Sizes: {item.availableSizes.join(", ")}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Dispatched qty */}
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Dispatched</div>
                                                        <div className="font-medium">
                                                            {/* {item?.dispatchedQty ?? item?.dispatchQty ?? 0} */}
                                                            {item?.quantity ?? item?.quantity ?? 0}
                                                        </div>
                                                    </div>

                                                    {/* Return qty input */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">Return Qty</label>
                                                        <input
                                                            type="number"
                                                            value={item.returnQty || 0}
                                                            onChange={(e) => updateReturnItem(index, 'returnQty', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                            max={item.dispatchedQty ?? item.dispatchQty ?? item.quantity ?? 0}
                                                            // max={item?.quantity ?? 0}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                                        />
                                                    </div>

                                                    {/* Reason */}
                                                    <div>
                                                        <label className="block text-sm text-gray-500 mb-1">Reason</label>
                                                        <input
                                                            type="text"
                                                            value={item?.reason || ''}
                                                            onChange={(e) => updateReturnItem(index, 'reason', e.target.value)}
                                                            placeholder="Return reason"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>

                                                    {/* Refund */}
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500">Refund</div>
                                                        <div className="font-medium text-orange-600">
                                                            ₹{refund.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Refund Amount:</span>
                                        <span className="text-xl font-bold text-orange-600">
                                            ₹{returnForm?.items
                                                .reduce((sum, item) =>
                                                    sum + (parseInt(item?.singlePicPrice || item?.price || 0) * parseInt(item?.pcsInSet) * parseInt(item?.returnQty || 0)),
                                                    0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                            <div className="relative">
                                <select
                                    value={returnForm.refundMethod}
                                    onChange={(e) => setReturnForm({ ...returnForm, refundMethod: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                >
                                    {refundMethods.map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>

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
                                className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                                disabled={!returnForm.customerId || !returnForm.orderId || returnForm.items.every(item => item.returnQty === 0)}
                            >
                                Create Return
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateReturnModal
