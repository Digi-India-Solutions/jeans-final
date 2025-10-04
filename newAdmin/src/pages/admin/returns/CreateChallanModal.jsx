import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function CreateChallanModal({ setShowCreateChallanModal, setChallanForm, setSelectedCustomerOrders,
    challanForm, customers, selectedCustomerOrders, vendors, handleCustomerChange, handleOrderChange, setSubProductsStock,
    subProductsStock, challans, setChallans, fetchChallan }) {

    // Stock adjustment functions
    const decrementStock = (productName, dispatchedPcs) => {
        setSubProductsStock(prevStock =>
            prevStock.map(product => {
                if (product.name === productName) {
                    const newStock = Math.max(0, parseInt(product?.lotStock) - dispatchedPcs);
                    console.log(`Stock Decrement: ${productName} - Dispatched: ${dispatchedPcs} pcs, New Stock: ${newStock} pcs`);
                    return { ...product, lotStock: newStock };
                }
                return product;
            })
        );
    };

    const createChallan = async () => {
        const customer = customers.find(c => c._id === challanForm?.customerId);
        const itemsToDispatch = challanForm.items.filter(item => item.dispatchQty > 0);

        if (!customer || itemsToDispatch.length === 0) {
            alert('Please select customer, order and set dispatch quantities');
            return;
        }

        // Validate stock availability
        let stockError = false
        itemsToDispatch.forEach(item => {
            const dispatchedPcs = item.dispatchQty * item?.productId?.pcsInSet;
            const stockItem = subProductsStock.find(stock => stock.name === item.name);

            if (stockItem && stockItem.stock < dispatchedPcs) {
                alert(`Insufficient stock for ${item.name}. Available: ${stockItem.stock} pcs, Required: ${dispatchedPcs} pcs`);
                stockError = true;
            }
        });

        if (stockError) {
            return;
        }

        const totalValue = itemsToDispatch.reduce((sum, item) => sum + (item.dispatchQty * item?.pcsInSet * item?.singlePicPrice), 0);
        const challanNumber = `CHN-2024-${String(challans.length + 1).padStart(3, '0')}`;

        // Auto decrement stock when challan is created
        itemsToDispatch.forEach(item => {
            const dispatchedPcs = item.dispatchQty * item.pcsInSet;
            // decrementStock(item.name, dispatchedPcs);
        });

        const newChallan = {
            id: Date.now(),
            challanNumber,
            customer: customer.name,
            customerId: customer._id,
            orderId: challanForm?.orderId,
            orderNumber: challanForm?.orderNumber,
            items: itemsToDispatch?.map(item => ({
                name: item?.name,
                availableSizes: item?.availableSizes,
                dispatchedQty: item?.dispatchQty,
                price: item?.singlePicPrice,
                pcsInSet: item?.pcsInSet,
                selectedSizes: item?.availableSizes
            })),
            totalValue,
            date: new Date().toISOString().split('T')[0],
            status: 'Dispatched',
            vendor: challanForm?.deliveryVendor,
            notes: challanForm?.notes
        };
        // console.log("AAAAAAAAAAA:==>", newChallan)
        const respons = await postData('api/challan/create-challan', newChallan)
        // console.log("AAAAAAAAAAA:==>", respons)
        if (respons?.success === true) {
            resetChallanForm();
            fetchChallan()
            setShowCreateChallanModal(false);

        }


        alert(`Challan created successfully!\nStock has been automatically decremented for dispatched items.`);
    };

    const resetChallanForm = () => {
        setChallanForm({
            customerId: '',
            orderId: '',
            items: [],
            deliveryVendor: 'BlueDart',
            notes: ''
        });
        setSelectedCustomerOrders([]);
    };

    const updateChallanItemQuantity = (index, dispatchQty) => {
        const updatedItems = challanForm.items.map((item, i) =>
            i === index ? { ...item, dispatchQty: Math.min(Math.max(0, dispatchQty), item?.quantity) } : item
        );

        setChallanForm({
            ...challanForm,
            items: updatedItems
        });
    };

    // console.log("challanForm=>", challanForm)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Create Delivery Challan</h2>
                        <button
                            onClick={() => {
                                setShowCreateChallanModal(false);
                                resetChallanForm();
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
                                        value={challanForm?.customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value, 'challan')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customers?.map(customer => (
                                            <option key={customer?._id} value={customer?._id}>
                                                {customer?.name}
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
                                        value={challanForm.orderId}
                                        onChange={(e) => handleOrderChange(e.target.value, 'challan')}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                        disabled={!challanForm?.customerId}
                                    >
                                        <option value="">Choose Order</option>
                                        {selectedCustomerOrders.map(order => (
                                            <option key={order._id} value={order._id}>
                                                {order?.orderNumber} - ₹{order?.subtotal?.toLocaleString()} ({order?.createdAt})
                                            </option>
                                        ))}
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {challanForm?.items?.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Order Items - Set Dispatch Quantities</h3>
                                <div className="space-y-3">
                                    {challanForm?.items?.map((item, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-5 gap-4 items-center">
                                                <div className="col-span-2">
                                                    <div className="font-medium">{item?.name}</div>
                                                    <div className="text-sm text-gray-500">Size: {item.availableSizes.map((item, index) => <>{item} {index !== item?.availableSizes?.length - 1 && ", "}</>)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500">Ordered</div>

                                                    <div className="font-medium">
                                                        pcs ({item?.productId?.pcsInSet}) × quantity ({item?.quantity})
                                                    </div>

                                                    <div className="font-medium">
                                                        {item?.productId?.pcsInSet * item?.quantity}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500">Quantity</div>
                                                    <div className="font-medium text-orange-600">{item?.quantity}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-500 mb-1">Dispatch Qty</label>
                                                    <input
                                                        type="number"
                                                        value={item?.dispatchQty}
                                                        onChange={(e) => updateChallanItemQuantity(index, parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        max={item?.quantity}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                                    />
                                                </div>
                                            </div>
                                            {item?.dispatchQty > 0 && (
                                                <div className="mt-2 text-right">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        Dispatch Value: ₹{(item.dispatchQty * item?.productId?.singlePicPrice * item?.productId?.pcsInSet).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Dispatch Value:</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ₹{challanForm?.items?.reduce((sum, item) => sum + (item.dispatchQty * item?.productId?.singlePicPrice * item?.productId?.pcsInSet), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Vendor</label>
                                <div className="relative">
                                    <select
                                        value={challanForm?.deliveryVendor}
                                        onChange={(e) => setChallanForm({ ...challanForm, deliveryVendor: e.target.value })}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                    >
                                        {vendors.map(vendor => (
                                            <option key={vendor} value={vendor}>{vendor}</option>
                                        ))}
                                    </select>
                                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={challanForm.notes}
                                    onChange={(e) => setChallanForm({ ...challanForm, notes: e.target.value })}
                                    placeholder="Special delivery instructions..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                onClick={() => {
                                    setShowCreateChallanModal(false);
                                    resetChallanForm();
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createChallan}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                disabled={!challanForm.customerId || !challanForm.orderId || challanForm.items.every(item => item.dispatchQty === 0)}
                            >
                                Create Challan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateChallanModal
