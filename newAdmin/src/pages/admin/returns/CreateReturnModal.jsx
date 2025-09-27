import React from 'react'
import Button from '../../../components/base/Button';

function CreateReturnModal({ setShowCreateReturnModal, setReturnForm, setSelectedCustomerOrders, customers,
    returnForm, selectedCustomerOrders, refundMethods, handleCustomerChange, handleOrderChange, updateReturnItem,
    returns, setReturns }) {

    const createReturn = () => {
        const customer = customers.find(c => c.id === parseInt(returnForm.customerId));
        const itemsToReturn = returnForm.items.filter(item => item.returnQty > 0);

        if (!customer || itemsToReturn.length === 0) {
            alert('Please select customer, order and set return quantities');
            return;
        }

        const totalRefund = itemsToReturn.reduce((sum, item) => sum + item.refundAmount, 0);
        const returnNumber = `RET-2024-${String(returns.length + 1).padStart(3, '0')}`;

        const newReturn = {
            id: Date.now(),
            returnNumber,
            customer: customer.name,
            orderNumber: returnForm.orderId,
            items: itemsToReturn.map(item => ({
                name: item.name,
                size: item.size,
                returnQty: item.returnQty,
                reason: item.reason,
                refundAmount: item.refundAmount,
                pcsInSet: item.pcsInSet
            })),
            totalRefund,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            refundMethod: returnForm.refundMethod
        };

        setReturns([newReturn, ...returns]);
        resetReturnForm();
        setShowCreateReturnModal(false);

        alert(`Return created successfully!\nStock will be incremented when return is approved.`);
    };


    const resetReturnForm = () => {
        setReturnForm({
            customerId: '',
            orderId: '',
            items: [],
            reason: '',
            refundMethod: 'Original Payment Method'
        });
        setSelectedCustomerOrders([]);
    };
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
                                        value={returnForm.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value, 'return')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} ({customer.type})
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
                                        value={returnForm.orderId}
                                        onChange={(e) => handleOrderChange(e.target.value, 'return')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                        disabled={!returnForm.customerId}
                                    >
                                        <option value="">Choose Order</option>
                                        {selectedCustomerOrders.map(order => (
                                            <option key={order.id} value={order.id}>
                                                {order.id} - ₹{order.total.toLocaleString()} ({order.date})
                                            </option>
                                        ))}
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                        </div>

                        {/* Return Items */}
                        {returnForm.items.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Return Items</h3>
                                <div className="space-y-3">
                                    {returnForm.items.map((item, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-6 gap-4 items-center">
                                                <div className="col-span-2">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-gray-500">Size: {item.size}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500">Dispatched</div>
                                                    <div className="font-medium">{item.dispatchedQty}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-500 mb-1">Return Qty</label>
                                                    <input
                                                        type="number"
                                                        value={item.returnQty}
                                                        onChange={(e) => updateReturnItem(index, 'returnQty', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        max={item.dispatchedQty}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-500 mb-1">Reason</label>
                                                    <input
                                                        type="text"
                                                        value={item.reason}
                                                        onChange={(e) => updateReturnItem(index, 'reason', e.target.value)}
                                                        placeholder="Return reason"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500">Refund</div>
                                                    <div className="font-medium text-orange-600">₹{item.refundAmount?.toLocaleString() || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Refund Amount:</span>
                                        <span className="text-xl font-bold text-orange-600">
                                            ₹{returnForm.items
                                                .reduce((sum, item) => sum + (item.refundAmount || 0), 0)
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
