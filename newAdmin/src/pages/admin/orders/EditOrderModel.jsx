import React, { useEffect, useState } from 'react'
import Button from '../../../components/base/Button';
import { getData, postData } from '../../../services/FetchNodeServices';
import CreateUserModel from './CreateUserModels.jsx';
import Select from "react-select";

function EditOrderModel({ subProducts, fetchAllOrder, orders, setOrders, setFilteredOrders, filteredOrders, setOrderToPrint, openProductSelection, setShowPrintOrderModal, setShowProductSelectionModal, calculatePointsValue, calculatePointsToEarn, getTotalPaidAmount, setShowEditOrderModal, setNewOrderForm, newOrderForm }) {
    const [customers, setCustomers] = useState(null);
    const [qrScanInput, setQrScanInput] = useState('');
    const [showUserModal, setShowUserModal] = useState(false)
    const [loding, setLoding] = useState(false)

    console.log("newOrderForm:UPDATE==>X--", newOrderForm)
    const removeItemFromOrder = (index) => {
        setNewOrderForm({
            ...newOrderForm,
            items: newOrderForm?.items?.filter((_, i) => i !== index)
        });
    };


    const getPaymentType = () => {
        const balance = getBalanceAmount();
        return balance === 0 ? 'Complete Payment' : 'Partial Payment';
    };

    const getBalanceAmount = () => {
        const total = getTotalValue();
        const paid = getTotalPaidAmount();
        return Math.max(0, total - paid);
    };

    const addPaymentMethod = () => {
        // alert("Add Payment Method");
        setNewOrderForm({
            ...newOrderForm,
            payments: [...newOrderForm?.payments, { method: 'Cash', amount: '' }]
        });

    };
    console.log("newOrderForm:==>", newOrderForm)
    const updateItemQuantity = (index, newQuantity) => {
        if (newQuantity <= 0) return;

        setNewOrderForm({
            ...newOrderForm,
            items: newOrderForm?.items?.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            )
        });
    };

    const removeItemSize = (index, sizeToRemove) => {
        setNewOrderForm({
            ...newOrderForm,
            items: newOrderForm.items.map((item, i) => {
                if (i === index) {
                    // Normalize product sizes safely
                    const product = subProducts?.find((p) => p._id === item.productId);
                    const productSizes = normalizeSizes(product?.sizes);

                    // Remove the selected size
                    const updatedSizes = productSizes.filter((size) => size !== sizeToRemove);

                    return { ...item, availableSizes: updatedSizes };
                }
                return item;
            }),
        });
    };

    const getTotalValue = () => {
        return newOrderForm?.items?.reduce((sum, item) => sum + (item?.quantity * (item?.singlePicPrice * item?.pcsInSet)), 0);
    };

    const getTotalPcs = () => {
        return newOrderForm?.items?.reduce((sum, item) => {
            return sum + (Number(item?.quantity) * Number(item?.pcsInSet || 0));
        }, 0);
    };

    const getTotalQuantity = () => {
        return newOrderForm?.items?.reduce((sum, item) => sum + Number(item?.quantity), 0);
    };
    // console.log("ZZZZZZZZZZZZZ:==>", newOrderForm?.items?.reduce((sum, item) => sum + item?.quantity, 0));
    const handleCustomerSelect = (customerId) => {

        const customer = customers?.find(c => c?._id === customerId);
        console.log("customercustomercustomer:==>", customer, customerId);
        if (customer) {
            setNewOrderForm({ ...newOrderForm, customerId, customerName: customer?.name, customerEmail: customer?.email, customerPhone: customer.phone, deliveryAddress: [customer.address.street + " " + customer.address.city + " " + customer.address.state + " " + customer.address.zipCode + " " + customer.address.country].filter(Boolean).join(", ") });
        } else {
            setNewOrderForm({ ...newOrderForm, customerId, customerName: '', customerEmail: '', customerPhone: '', deliveryAddress: '' });
        }
    };
    console.log("customercustomercustomer:==>", newOrderForm);
    const handleQRScan = () => {
        if (!qrScanInput.trim()) return;

        const foundProduct = subProducts?.find(p => p?.barcode === qrScanInput.trim());
        if (foundProduct) {
            // Check if product already exists in items
            const existingItemIndex = newOrderForm?.items?.findIndex(item => item?.productId === foundProduct?._id);

            if (existingItemIndex >= 0) {
                // Increase quantity if already exists
                const updatedItems = [...newOrderForm?.items];
                updatedItems[existingItemIndex].quantity += 1;
                setNewOrderForm({ ...newOrderForm, items: updatedItems });
            } else {
                // Add new item
                const newItem = { productId: foundProduct._id, name: foundProduct.name, quantity: 1, singlePicPrice: foundProduct.singlePicPrice, pcsInSet: foundProduct?.pcsInSet };
                setNewOrderForm({
                    ...newOrderForm, items: [...newOrderForm?.items, newItem]
                });
            }

            // Play success beep
            playBeepSound('success');
            setQrScanInput('');
        } else {
            // Play error beep for invalid/not found barcode
            playBeepSound('error');
            // Don't clear the input on error so user can see what was scanned
        }
    };

    // Auto-scan detection for physical barcode scanners
    const handleBarcodeInputChange = (value) => {
        setQrScanInput(value);

        // Auto-detect when barcode scanner finishes input (typically 13 digits for EAN-13)
        if (value.length === 13 && /^\d{13}$/.test(value)) {
            // Small delay to ensure scanner has finished
            setTimeout(() => {
                const foundProduct = subProducts.find(p => p.barcode === value);
                if (foundProduct) {
                    // Check if product already exists in items
                    const existingItemIndex = newOrderForm?.items?.findIndex(item => item.productId === foundProduct._id);

                    if (existingItemIndex >= 0) {
                        // Increase quantity if already exists
                        const updatedItems = [...newOrderForm?.items];
                        updatedItems[existingItemIndex].quantity += 1;
                        setNewOrderForm({ ...newOrderForm, items: updatedItems });
                    } else {
                        // Add new item
                        const newItem = {
                            productId: foundProduct._id,
                            name: foundProduct.name,
                            quantity: 1,
                            singlePicPrice: foundProduct.singlePicPrice,
                            pcsInSet: foundProduct?.pcsInSet
                        };
                        setNewOrderForm({
                            ...newOrderForm, items: [...newOrderForm?.items, newItem]
                        });
                    }

                    // Play success beep and clear input
                    playBeepSound('success');
                    setQrScanInput('');
                } else {
                    // Play error beep for invalid/not found barcode
                    playBeepSound('error');
                }
            }, 100);
        }
    };


    const removePaymentMethod = (index) => {
        if (newOrderForm.payments.length > 1) {
            setNewOrderForm({
                ...newOrderForm,
                payments: newOrderForm?.payments.filter((_, i) => i !== index)
            });
        }
    };

    const updatePaymentMethod = (index, field, value) => {
        // Create a new array with the updated payment
        const updatedPayments = newOrderForm.payments.map((payment, i) =>
            i === index ? { ...payment, [field]: value } : payment
        );

        // Calculate totals
        const subtotal = getTotalValue();
        // console.log("💰 Payment Debug:", "subtotal:=>", subtotal);// e.g., base price total
        const pointsRedemptionValue = calculatePointsValue(newOrderForm.redeemPoints || newOrderForm?.customerAvailablePoints);
        // console.log("pointsRedemptionValue==>", pointsRedemptionValue, newOrderForm);
        const finalTotal = parseFloat((subtotal - pointsRedemptionValue).toFixed(2));

        // Compute current total payment entered by user
        const totalPaymentEntered = updatedPayments.reduce(
            (sum, payment) => sum + (parseFloat(payment?.amount) || 0),
            0
        );

        // console.log("💰 Payment Debug:", "Total Entered:", totalPaymentEntered, "Allowed:", finalTotal);

        if (totalPaymentEntered <= subtotal || totalPaymentEntered <= finalTotal) {
            setNewOrderForm({ ...newOrderForm, payments: updatedPayments });
        } else {
            alert("⚠️ Total payment cannot exceed the order total amount.");
        }
    };

    const calculateMaxRedeemablePoints = (cartValue) => {
        // Max 30% of cart value can be redeemed
        const maxValue = cartValue * 0.3;
        return Math.floor(maxValue / 0.5); // Convert to points (1 point = ₹0.50)
    };

    const handleRedeemPointsChange = (points) => {
        const cartValue = getTotalValue();
        const maxRedeemable = calculateMaxRedeemablePoints(cartValue);
        const validPoints = Math.min(points, Math.min(maxRedeemable, newOrderForm.customerAvailablePoints));

        setNewOrderForm({
            ...newOrderForm,
            redeemPoints: Math.max(0, validPoints) // Ensure non-negative
        });
    };

    const handleRedeemMax = () => {
        const cartValue = getTotalValue();
        const maxRedeemable = calculateMaxRedeemablePoints(cartValue);
        const maxAllowed = Math.min(maxRedeemable, newOrderForm.customerAvailablePoints);

        setNewOrderForm({
            ...newOrderForm,
            redeemPoints: maxAllowed
        });
    };

    const updateItemPcsInSet = (index, newPcsInSet) => {
        if (newPcsInSet <= 0) return;

        setNewOrderForm({
            ...newOrderForm,
            items: newOrderForm.items.map((item, i) =>
                i === index ? { ...item, pcsInSet: newPcsInSet } : item
            )
        });
    };


    const updateOrder = async (e) => {
        e.preventDefault();

        if (newOrderForm.items.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }
        setLoding(false);
        const subtotal = getTotalValue();
        const pointsRedemptionValue = calculatePointsValue(newOrderForm.redeemPoints);
        const finalTotal = subtotal - pointsRedemptionValue;
        const paidAmount = getTotalPaidAmount();
        const balanceAmount = Math.max(0, finalTotal - paidAmount);

        // Calculate points to earn based on final amount (after redemption)
        const pointsToEarn = calculatePointsToEarn(finalTotal);

        const newOrder = {
            id: Date.now(),
            orderNumber: newOrderForm.orderNumber,
            customer: {
                userId: newOrderForm.customerId,
                name: newOrderForm.customerName,
                email: newOrderForm.customerEmail,
                phone: newOrderForm.customerPhone,
                // type: newOrderForm.customerType,
                deliveryAddress: newOrderForm.deliveryAddress
            },
            items: newOrderForm.items.map(item => ({
                ...item,
                productId: item.productId,
                // Add product images and selected sizes for display
                images: [subProducts.find(p => p.id === item.productId)?.image || ''],
                selectedSizes: subProducts.find(p => p.id === item.productId)?.sizes || []
            })),
            subtotal: subtotal,
            pointsRedeemed: newOrderForm.redeemPoints,
            pointsRedemptionValue: pointsRedemptionValue,
            total: finalTotal,
            status: 'Pending',
            paymentType: balanceAmount === 0 ? 'Complete Payment' : 'Partial Payment',
            paidAmount,
            orderNote: newOrderForm?.orderNote,
            transportName: newOrderForm?.transportName,
            balanceAmount,
            payments: newOrderForm.payments.filter(p => parseFloat(p.amount) > 0),
            paymentMethod: newOrderForm.payments[0]?.method || 'Cash',
            orderType: newOrderForm.orderType,
            orderDate: new Date().toISOString().split('T')[0],
            trackingId: '',
            deliveryVendor: '',
            pointsEarned: pointsToEarn,
            pointsEarnedValue: calculatePointsValue(pointsToEarn),
            statusHistory: [
                { status: 'Pending', date: new Date().toISOString().split('T')[0], updatedBy: 'System' }
            ]
        };
        setLoding(true)
        // alert(JSON.stringify(newOrder))
        // console.log("newOrder==>", newOrder, newOrderForm?._id);
        const response = await postData(`api/order/update-order-by-admin/${newOrderForm?._id}`, newOrder);
        if (!response?.success) {
            setLoding(false)
            console.log('Error:', response?.message);
            return;
        }
        fetchAllOrder()
        setOrders([newOrder]);
        setFilteredOrders([newOrder]);

        // Show print option after order creation
        setOrderToPrint(newOrder);
        setShowPrintOrderModal(true);

        setNewOrderForm({
            customerId: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            customerType: 'Retail',
            deliveryAddress: '',
            orderType: 'Offline',
            payments: [{ method: 'Cash', amount: '' }],
            items: [],
            customerAvailablePoints: 0,
            redeemPoints: 0,
            pointsToEarn: 0
        });
        setShowEditOrderModal(false);
        setLoding(false);
    };


    const fetchCustomers = async () => {
        try {
            const response = await getData("api/user/get-all-user");
            if (response.success) {
                setCustomers(response.data);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, [showUserModal])

    const normalizeSizes = (sizes) => {
        if (!sizes) return [];

        if (Array.isArray(sizes)) return sizes;

        if (typeof sizes === "string") {
            // Try JSON.parse
            try {
                const parsed = JSON.parse(sizes);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // Fallback: comma-separated values
                return sizes
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean);
            }
        }

        return [];
    };

    const fetchRewordByUserId = async (Id) => {
        try {
            const response = await getData(`api/reward/get-all-rewards-by-id/${Id}`)

            if (response?.success === true) {
                // console.log("FFFFFFFFF:==>", response.data.points)
                setNewOrderForm({ ...newOrderForm, customerAvailablePoints: response?.data?.points })
            }
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        fetchRewordByUserId(newOrderForm?.customerId)
    }, [newOrderForm?.customerId])


    const updateItemSinglePicPrice = (index, price) => {
        const updatedItems = newOrderForm.items.map((item, i) => {
            if (i === index) {
                return { ...item, singlePicPrice: price };
            }
            return item;
        });

        setNewOrderForm(prev => ({ ...prev, items: updatedItems, }));
    };

    // console.log("FFFFFFFFF:==>BBBB", newOrderForm, finalTotal)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Edit New Order</h2>
                        <button
                            onClick={() => {
                                setShowEditOrderModal(false);
                                setNewOrderForm({
                                    customerId: '', customerName: '', customerEmail: '', customerPhone: '', deliveryAddress: '', orderType: 'Offline', payments: [{ method: 'Cash', amount: '' }], items: []
                                })
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={updateOrder} className="space-y-4">
                                {/* Customer Information */}
                                <div>
                                    <h3 className="font-medium mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                            <div className="relative">
                                                {/* <Select
                                                    options={customers?.map((product) => ({
                                                        value: product._id,
                                                        label: `${product.productName} (${product?.mainCategoryId?.mainCategoryName})`,
                                                    }))}

                                                    value={
                                                        formData.productId
                                                            ? {
                                                                value: formData.productId,
                                                                label:
                                                                    productList?.find((p) => p._id === formData.productId)?.productName +
                                                                    " (" +
                                                                    productList?.find((p) => p._id === formData.productId)?.mainCategoryId
                                                                        ?.mainCategoryName +
                                                                    ")",
                                                            }
                                                            : null
                                                    }

                                                    onChange={(e) => handleParentProductChange(e.value)}

                                                    placeholder="Select Parent Product"
                                                    className="text-sm"
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            borderColor: formErrors.productId ? "red" : "#d1d5db",
                                                            boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                                                            "&:hover": { borderColor: "#3b82f6" },
                                                        }),
                                                    }}
                                                /> */}

                                                <Select
                                                    options={[
                                                        ...(customers ? customers.map((customer) => ({
                                                            value: customer?._id,
                                                            label: customer?.name,
                                                        })) : []),
                                                        { value: "new", label: "+ Add New Customer" },
                                                    ]}

                                                    value={
                                                        newOrderForm?.customerId
                                                            ? {
                                                                value: newOrderForm?.customerId,
                                                                label:
                                                                    customers?.find((c) => c._id === newOrderForm?.customerId)?.name ||
                                                                    "+ Add New Customer",
                                                            }
                                                            : null
                                                    }

                                                    onChange={(selected) => handleCustomerSelect(selected?.value)}

                                                    placeholder="Select Customer"
                                                    className="text-sm"
                                                    isSearchable={true}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: "#374151",
                                                            boxShadow: "none",
                                                            "&:hover": { borderColor: "#3b82f6" },
                                                        }),
                                                    }}
                                                />

                                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setShowUserModal(true)}
                                                className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 flex items-center justify-center w-10 h-10 mt-2"
                                                title="Add New User"
                                            >
                                                <i className="ri-user-add-line"></i>
                                            </Button>
                                        </div>

                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                            <div className="relative">
                                                <select
                                                    value={newOrderForm.customerType}
                                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerType: e.target.value })}
                                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                                    disabled={newOrderForm.customerId && newOrderForm.customerId !== 'new'}
                                                >
                                                    <option value="Retail">Retail</option>
                                                    <option value="B2B">B2B</option>
                                                </select>
                                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            </div>
                                        </div> */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                            <input type="text" value={newOrderForm?.customerName} onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" required readOnly={newOrderForm?.customerId && newOrderForm?.customerId !== 'new'} />
                                        </div> */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" value={newOrderForm?.customerEmail} onChange={(e) => setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" required readOnly={newOrderForm?.customerId && newOrderForm.customerId !== 'new'} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel" value={newOrderForm?.customerPhone} onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" required readOnly={newOrderForm?.customerId && newOrderForm?.customerId !== 'new'} />
                                        </div>
                                        <div className=' col-span-2'>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">Delivery Address</label>
                                            <textarea value={newOrderForm?.deliveryAddress} onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryAddress: e.target.value })} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none" maxLength="500" required
                                            // readOnly={newOrderForm?.customerId && newOrderForm?.customerId !== 'new'} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Information */}

                                <div>
                                    <h3 className="font-medium mb-3">Order Information</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                                            <div className="relative">
                                                <select
                                                    value={newOrderForm?.orderType}
                                                    onChange={(e) => setNewOrderForm({ ...newOrderForm, orderType: e.target.value })}
                                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                                >
                                                    <option value="Offline">Offline</option>
                                                    <option value="Online">Online</option>
                                                </select>
                                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Note</label>
                                            <input
                                                type="text"
                                                value={newOrderForm.orderNote}
                                                onChange={(e) => setNewOrderForm({ ...newOrderForm, orderNote: e.target.value })}
                                                placeholder="Special instructions..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                maxLength="200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transport Name</label>
                                            <input
                                                type="text"
                                                value={newOrderForm.transportName}
                                                onChange={(e) => setNewOrderForm({ ...newOrderForm, transportName: e.target.value })}
                                                placeholder="Transport company..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                maxLength="100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* QR Code Scanner & Product Selection */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">Add Product Sets</h3>
                                        <Button
                                            type="button"
                                            onClick={() => setShowProductSelectionModal(true)}
                                            className="bg-green-600 text-white hover:bg-green-700 text-sm"
                                        >
                                            <i className="ri-add-line mr-1"></i>
                                            Manual Selection
                                        </Button>
                                    </div>

                                    {/* QR Scanner - Enhanced with auto-detection */}
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-medium text-blue-900 mb-2">QR Code / Barcode Scanner</h4>
                                        <div className="flex space-x-2">
                                            <input type="text" value={qrScanInput} onChange={(e) => handleBarcodeInputChange(e.target.value)} placeholder="Scan barcode or enter manually (auto-detects 13 digits)" className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" autoComplete="off" />
                                            <Button type="button" onClick={handleQRScan} className="bg-blue-600 text-white hover:bg-blue-700"                                            >
                                                <i className="ri-qr-scan-line mr-1"></i>
                                                Add
                                            </Button>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-blue-600">
                                                • Physical scanner: Auto-detects and adds product on 13-digit scan
                                            </p>
                                            <p className="text-xs text-blue-600">
                                                • Manual entry: Click "Add" button or press Enter
                                            </p>
                                            {/* <p className="text-xs text-green-600">
                                                ✓ Valid scan = Success beep + Product added
                                            </p>
                                            <p className="text-xs text-red-600">
                                                ✗ Invalid scan = Error beep + No action
                                            </p> */}
                                        </div>
                                    </div>

                                    {/* Enhanced Editable Cart Lines */}
                                    <div className="space-y-2">
                                        {newOrderForm?.items?.map((item, index) => {
                                            const totalPcs = item?.quantity * (item?.pcsInSet || 0);
                                            const product = subProducts?.find(p => p._id === item?.productId);
                                            const normalizedSizes = normalizeSizes(item?.availableSizes);
                                            return (
                                                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                                    <img
                                                        src={product?.subProductImages[0] || ''}
                                                        alt={item.color}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium">{item?.color}</div>
                                                        <div className="text-sm text-gray-500">₹{item?.singlePicPrice} per piece Price <input
                                                            type="text"
                                                            pattern="[0-9]*"
                                                            min="0"
                                                            value={item?.singlePicPrice || 0}
                                                            onChange={(e) => updateItemSinglePicPrice(index, parseInt(e.target.value) || 1)}
                                                            className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                                        />
                                                        </div>

                                                        <div className="text-xs text-blue-600">
                                                            Total: {item?.quantity} set{item?.quantity > 1 ? 's' : ''} × {item?.pcsInSet || 0} pcs = {totalPcs} pieces
                                                        </div>

                                                        {/* Editable Pieces per Set */}
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs text-gray-600">Pcs per set:</span>
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateItemPcsInSet(index, parseInt(item?.pcsInSet || 1) - 1)}
                                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs hover:bg-gray-50"
                                                                    disabled={item?.pcsInSet <= 1}
                                                                >
                                                                    <i className="ri-subtract-line text-xs"></i>
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.pcsInSet || 1}
                                                                    onChange={(e) => updateItemPcsInSet(index, parseInt(e.target.value) || 1)}
                                                                    className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateItemPcsInSet(index, parseInt(item?.pcsInSet || 1) + 1)}
                                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs hover:bg-gray-50"
                                                                >
                                                                    <i className="ri-add-line text-xs"></i>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Available Sizes with Remove Option */}


                                                        {/* {normalizedSizes?.length > 0 && (
                                                            <div className="mt-1">
                                                                <div className="text-xs text-gray-600 mb-1">Sizes:</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {normalizedSizes?.map((size) => (
                                                                        <span
                                                                            key={size}
                                                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                                            onClick={() => removeItemSize(index, size)}
                                                                            title="Click to remove size"
                                                                        >
                                                                            {size}
                                                                            <i className="ri-close-line ml-1 text-xs"></i>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )} */}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItemQuantity(index, parseInt(item.quantity) - 1)}
                                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                                                        >
                                                            <i className="ri-subtract-line text-sm"></i>
                                                        </button>
                                                        <span className="w-12 text-center font-medium">{item?.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItemQuantity(index, parseInt(item?.quantity) + 1)}
                                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-gray-500 rounded-md hover:bg-gray-50"
                                                        >
                                                            <i className="ri-add-line text-sm"></i>
                                                        </button>
                                                    </div>
                                                    <div className="font-medium">₹{(item?.quantity * parseInt(item?.pcsInSet) * parseInt(item?.singlePicPrice))?.toLocaleString()}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItemFromOrder(index)}
                                                        className="text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {newOrderForm?.items?.length === 0 && (
                                            <p className="text-gray-500 text-center py-8">No sets added yet</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <CreateUserModel fetchCustomers={fetchCustomers} showUserModal={showUserModal} setShowUserModal={setShowUserModal} />
                                </div>
                                {/* Enhanced Redeem Points Section */}
                                {newOrderForm?.customerAvailablePoints > 0 && getTotalValue() > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-medium">Redeem Points</h3>
                                            <div className="text-sm text-blue-600">
                                                Available: {newOrderForm?.customerAvailablePoints?.toLocaleString()} pts
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                                            {/* Points Rules Display */}
                                            <div className="text-sm text-orange-800 bg-orange-100 p-3 rounded-lg">
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <div>
                                                        <span className="font-medium">Available Points:</span>
                                                        <div className="text-lg font-bold text-orange-900">
                                                            {newOrderForm?.customerAvailablePoints?.toLocaleString()} pts
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Points Value:</span>
                                                        <div className="text-lg font-bold text-green-600">
                                                            ₹{calculatePointsValue(newOrderForm?.customerAvailablePoints)?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="border-t border-orange-200 pt-2">
                                                    <div className="flex justify-between mb-1">
                                                        <span>Conversion Rate:</span>
                                                        <span className="font-medium">1 point = ₹0.50</span>
                                                    </div>
                                                    <div className="flex justify-between mb-1">
                                                        <span>Max Redemption:</span>
                                                        <span className="font-medium">30% of cart value</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-orange-900">
                                                        <span>Max Redeemable:</span>
                                                        <span>{calculateMaxRedeemablePoints(getTotalValue())?.toLocaleString()} pts (₹{calculatePointsValue(calculateMaxRedeemablePoints(getTotalValue()))?.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Redeem Points Input */}
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Redeem Now</label>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRedeemPointsChange(newOrderForm?.redeemPoints - 100)}
                                                            className="w-8 h-8 flex items-center justify-center border border-orange-300 rounded-md hover:bg-orange-100"
                                                            disabled={newOrderForm?.redeemPoints <= 0}
                                                        >
                                                            <i className="ri-subtract-line text-sm"></i>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={newOrderForm?.redeemPoints || 0}
                                                            onChange={(e) => handleRedeemPointsChange(parseInt(e.target.value) || 0)}
                                                            placeholder="Enter points"
                                                            className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                            min="0"
                                                            max={Math.min(calculateMaxRedeemablePoints(getTotalValue()), newOrderForm?.customerAvailablePoints)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRedeemPointsChange(newOrderForm?.redeemPoints + 100)}
                                                            className="w-8 h-8 flex items-center justify-center border border-orange-300 rounded-md hover:bg-orange-100"
                                                            disabled={newOrderForm?.redeemPoints >= Math.min(calculateMaxRedeemablePoints(getTotalValue()), newOrderForm?.customerAvailablePoints)}
                                                        >
                                                            <i className="ri-add-line text-sm"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">Discount Value</div>
                                                    <div className="font-bold text-green-600 text-lg">
                                                        ₹{calculatePointsValue(newOrderForm?.redeemPoints || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Max Redeem Button */}
                                            <div className="flex justify-between items-center">
                                                <Button
                                                    type="button"
                                                    onClick={handleRedeemMax}
                                                    className="bg-orange-600 text-white hover:bg-orange-700 text-sm px-4 py-2"
                                                    disabled={newOrderForm?.redeemPoints >= Math.min(calculateMaxRedeemablePoints(getTotalValue()), newOrderForm?.customerAvailablePoints)}
                                                >
                                                    Max Redeem ({Math.min(calculateMaxRedeemablePoints(getTotalValue()), newOrderForm?.customerAvailablePoints)?.toLocaleString()} pts)
                                                </Button>
                                                {newOrderForm?.redeemPoints > 0 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => setNewOrderForm({ ...newOrderForm, redeemPoints: 0 })}
                                                        className="bg-gray-500 text-white hover:bg-gray-600 text-sm px-3 py-2"
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Redemption Summary */}
                                            {newOrderForm?.redeemPoints > 0 && (
                                                <div className="text-xs text-orange-700 bg-orange-200 p-3 rounded">
                                                    <div className="flex justify-between mb-1">
                                                        <span>Redeeming:</span>
                                                        <span className="font-medium">{newOrderForm?.redeemPoints?.toLocaleString() || 0} points</span>
                                                    </div>
                                                    <div className="flex justify-between mb-1">
                                                        <span>Discount:</span>
                                                        <span className="font-medium">₹{calculatePointsValue(newOrderForm?.redeemPoints || 0)?.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold">
                                                        <span>Payable After Discount:</span>
                                                        <span>₹{(getTotalValue() - calculatePointsValue(newOrderForm?.redeemPoints || 0))?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Multiple Payment Methods */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">Payment Information</h3>
                                        <Button
                                            type="button"
                                            onClick={addPaymentMethod}
                                            className="bg-green-50 text-green-600 hover:bg-green-100 text-sm px-3 py-1"
                                        >
                                            <i className="ri-add-line mr-1"></i>
                                            Add Payment
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {newOrderForm?.payments?.map((payment, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="relative">
                                                        <select
                                                            value={payment.method}
                                                            onChange={(e) => updatePaymentMethod(index, 'method', e.target.value)}
                                                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                                        >
                                                            <option value="Cash">Cash</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                            <option value="Credit Card">Credit Card</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={payment.amount}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                                            updatePaymentMethod(index, 'amount', cleaned);
                                                        }}
                                                        placeholder="Amount (₹)"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                {newOrderForm?.payments?.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePaymentMethod(index)}
                                                        className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Total Paid:</span>
                                            <span className="font-medium text-green-600">₹{getTotalPaidAmount()?.toLocaleString()}</span>
                                        </div>
                                        {getBalanceAmount() > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Balance Due:</span>
                                                {/* <span className="font-medium text-red-600">₹{getBalanceAmount()?.toLocaleString()}</span> */}
                                                <span className="font-medium text-red-600">₹{Math.max(0, (getTotalValue() - calculatePointsValue(newOrderForm?.redeemPoints || 0)) - getTotalPaidAmount())?.toLocaleString()}</span>

                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-blue-200">
                                            <span>Payment Status:</span>
                                            <span className={getPaymentType() === 'Complete Payment' ? 'text-green-600' : 'text-yellow-600'}>
                                                {getPaymentType()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setShowEditOrderModal(false);
                                            setNewOrderForm({ customerId: '', customerName: '', customerEmail: '', customerPhone: '', deliveryAddress: '', orderType: 'Offline', payments: [{ method: 'Cash', amount: '' }], items: [] })
                                        }}
                                        className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-blue-900 text-white hover:bg-blue-700" disabled={newOrderForm?.items?.length === 0}  >
                                        {loding ? "Updating..." : " Update Order"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Order Summary - Enhanced with Points */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 p-4 rounded-lg sticky top-0">
                                <h3 className="font-medium mb-4">Order Summary</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Sets:</span>
                                        <span className="font-medium text-blue-600">{getTotalQuantity()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total Pcs:</span>
                                        <span className="font-medium text-purple-600">{getTotalPcs()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">₹{getTotalValue()?.toLocaleString()}</span>
                                    </div>

                                    {newOrderForm?.redeemPoints > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Points Discount:</span>
                                            <span className="font-medium text-green-600">-₹{calculatePointsValue(newOrderForm?.redeemPoints || 0).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span>Total Paid:</span>
                                        <span className="font-medium text-green-600">₹{getTotalPaidAmount()?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Balance:</span>
                                        <span className="font-medium text-red-600">₹{Math.max(0, (getTotalValue() - calculatePointsValue(newOrderForm?.redeemPoints || 0)) - getTotalPaidAmount())?.toLocaleString()}</span>
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-medium">
                                            <span>Final Amount:</span>
                                            <span className="text-lg text-blue-600">₹{(getTotalValue() - calculatePointsValue(newOrderForm?.redeemPoints || 0))?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {getTotalValue() > 0 && (
                                        <div className="mt-4 pt-3 border-t">
                                            <div className="flex justify-between font-medium">
                                                <span>Points to Earn:</span>
                                                <span className="text-orange-600">{calculatePointsToEarn(getTotalValue() - calculatePointsValue(newOrderForm?.redeemPoints || 0))} pts</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ₹100 = 1 point • Points expire in 90 days
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Real-time Order Items Summary */}
                                {newOrderForm?.items?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium text-sm mb-2">Items in Order:</h4>
                                        <div className="space-y-2">
                                            {newOrderForm?.items?.map((item, index) => {
                                                const totalPcs = item.quantity * (item.pcsInSet || 0);
                                                const lineTotal = item.quantity * item.pcsInSet * item.singlePicPrice;

                                                return (
                                                    <div key={index} className="text-xs bg-white p-2 rounded border">
                                                        <div className="font-medium truncate">{item.name}</div>
                                                        <div className="text-gray-600">
                                                            {item.quantity} sets × {item.pcsInSet} pcs = {totalPcs} pieces
                                                        </div>
                                                        <div className="text-green-600 font-medium">
                                                            ₹{item?.singlePicPrice} × {totalPcs} = ₹{lineTotal?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditOrderModel
