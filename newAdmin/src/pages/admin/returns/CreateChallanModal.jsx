// import React, { useEffect } from 'react'
// import Button from '../../../components/base/Button';
// import { postData } from '../../../services/FetchNodeServices';

// function CreateChallanModal({ setShowCreateChallanModal, setChallanForm, setSelectedCustomerOrders,
//     challanForm, customers, selectedCustomerOrders, vendors, handleCustomerChange, handleOrderChange, setSubProductsStock,
//     subProductsStock, challans, setChallans, fetchChallan }) {
//     const [file, setFile] = useState(null); // store uploaded file
//     const [previewOrder, setPreviewOrder] = useState([]); // preview for images
//     // Stock adjustment functions
//     const decrementStock = (productName, dispatchedPcs) => {
//         setSubProductsStock(prevStock =>
//             prevStock.map(product => {
//                 if (product.name === productName) {
//                     const newStock = Math.max(0, parseInt(product?.lotStock) - dispatchedPcs);
//                     console.log(`Stock Decrement: ${productName} - Dispatched: ${dispatchedPcs} pcs, New Stock: ${newStock} pcs`);
//                     return { ...product, lotStock: newStock };
//                 }
//                 return product;
//             })
//         );
//     };

//     const createChallan = async () => {
//         const customer = customers.find(c => c._id === challanForm?.customerId);
//         const itemsToDispatch = challanForm.items.filter(item => item.dispatchQty > 0);

//         if (!customer || itemsToDispatch.length === 0) {
//             alert('Please select customer, order and set dispatch quantities');
//             return;
//         }

//         // Validate stock availability
//         let stockError = false
//         itemsToDispatch.forEach(item => {
//             const dispatchedPcs = item.dispatchQty * item?.productId?.pcsInSet;
//             const stockItem = subProductsStock.find(stock => stock.name === item.name);

//             if (stockItem && stockItem.stock < dispatchedPcs) {
//                 alert(`Insufficient stock for ${item.name}. Available: ${stockItem.stock} pcs, Required: ${dispatchedPcs} pcs`);
//                 stockError = true;
//             }
//         });

//         if (stockError) {
//             return;
//         }

//         const totalValue = itemsToDispatch.reduce((sum, item) => sum + (item.dispatchQty * item?.pcsInSet * item?.singlePicPrice), 0);
//         const challanNumber = `CHN-2024-${String(challans.length + 1).padStart(3, '0')}`;

//         // Auto decrement stock when challan is created
//         itemsToDispatch.forEach(item => {
//             const dispatchedPcs = item.dispatchQty * item.pcsInSet;
//             // decrementStock(item.name, dispatchedPcs);
//         });

//         const newChallan = {
//             id: Date.now(),
//             challanNumber,
//             customer: customer.name,
//             customerId: customer._id,
//             orderId: challanForm?.orderId,
//             orderNumber: challanForm?.orderNumber,
//             items: itemsToDispatch?.map(item => ({
//                 name: item?.name,
//                 availableSizes: item?.availableSizes,
//                 dispatchedQty: item?.dispatchQty,
//                 price: item?.singlePicPrice,
//                 pcsInSet: item?.pcsInSet,
//                 selectedSizes: item?.availableSizes
//             })),
//             totalValue,
//             date: new Date().toISOString().split('T')[0],
//             status: 'Dispatched',
//             vendor: challanForm?.deliveryVendor,
//             notes: challanForm?.notes,
//         };
//         // console.log("AAAAAAAAAAA:==>", newChallan)
//         const respons = await postData('api/challan/create-challan', newChallan)
//         // console.log("AAAAAAAAAAA:==>", respons)
//         if (respons?.success === true) {
//             resetChallanForm();
//             fetchChallan()
//             setShowCreateChallanModal(false);

//         }
//         alert(`Challan created successfully!\nStock has been automatically decremented for dispatched items.`);
//     };


//     // const createChallanWithSlip = async () => {
//     //     const customer = customers.find(c => c._id === challanForm?.customerId);
//     //     const itemsToDispatch = challanForm.items.filter(item => item.dispatchQty > 0);

//     //     if (!customer || itemsToDispatch.length === 0) {
//     //         alert('Please select customer, order and set dispatch quantities');
//     //         return;
//     //     }

//     //     // Validate stock availability
//     //     let stockError = false;
//     //     itemsToDispatch.forEach(item => {
//     //         const dispatchedPcs = item.dispatchQty * item?.productId?.pcsInSet;
//     //         const stockItem = subProductsStock.find(stock => stock.name === item.name);

//     //         if (stockItem && stockItem.stock < dispatchedPcs) {
//     //             alert(
//     //                 `Insufficient stock for ${item.name}. Available: ${stockItem.stock} pcs, Required: ${dispatchedPcs} pcs`
//     //             );
//     //             stockError = true;
//     //         }
//     //     });

//     //     if (stockError) return;

//     //     const totalValue = itemsToDispatch.reduce(
//     //         (sum, item) => sum + item.dispatchQty * item?.pcsInSet * item?.singlePicPrice,
//     //         0
//     //     );

//     //     const challanNumber = `CHN-2024-${String(challans.length + 1).padStart(3, '0')}`;

//     //     // Build payload as FormData to include file
//     //     const formData = new FormData();
//     //     formData.append('challanNumber', challanNumber);
//     //     formData.append('customer', customer.name);
//     //     formData.append('customerId', customer._id);
//     //     formData.append('orderId', challanForm?.orderId);
//     //     formData.append('orderNumber', challanForm?.orderNumber);
//     //     formData.append('totalValue', totalValue);
//     //     formData.append('date', new Date().toISOString().split('T')[0]);
//     //     formData.append('status', 'Dispatched');
//     //     formData.append('vendor', challanForm?.deliveryVendor);
//     //     formData.append('notes', challanForm?.notes);

//     //     // send items as JSON
//     //     formData.append(
//     //         'items',
//     //         JSON.stringify(
//     //             itemsToDispatch.map(item => ({
//     //                 name: item?.name,
//     //                 availableSizes: item?.availableSizes,
//     //                 dispatchedQty: item?.dispatchQty,
//     //                 price: item?.singlePicPrice,
//     //                 pcsInSet: item?.pcsInSet,
//     //                 selectedSizes: item?.availableSizes,
//     //             }))
//     //         )
//     //     );

//     //     // append file if present
//     //     if (file) {
//     //         formData.append('biltiSlip', file);
//     //     }

//     //     const response = await postData('api/challan/create-challan-with-slip', formData, true); // your postData should handle FormData correctly

//     //     if (response?.success) {
//     //         resetChallanForm();
//     //         fetchChallan();
//     //         setShowCreateChallanModal(false);
//     //         alert(`Challan created successfully!\nStock has been automatically decremented for dispatched items.`);
//     //     } else {
//     //         alert('Failed to create challan');
//     //     }
//     // };

//     const resetChallanForm = () => {
//         setChallanForm({ customerId: '', orderId: '', items: [], deliveryVendor: 'BlueDart', notes: '' });
//         setSelectedCustomerOrders([]);
//     };

//     const updateChallanItemQuantity = (index, dispatchQty) => {
//         const updatedItems = challanForm.items.map((item, i) =>
//             i === index ? { ...item, dispatchQty: Math.min(Math.max(0, dispatchQty), item?.quantity) } : item
//         );

//         setChallanForm({
//             ...challanForm,
//             items: updatedItems
//         });
//     };

//     // console.log("challanForm=>", challanForm)
//     const filetrOrder = selectedCustomerOrders.filter((order) => order?.status !== 'Cancelled' && order?.status !== 'Returned' && order?.status !== 'Delivered' && order?.status !== 'Dispatched');

//     console.log("filetrOrder", filetrOrder)

//     const fetchChallanByCustomerAndOrder = async () => {
//         try {
//             const data = { customerId: challanForm?.customerId, orderId: challanForm?.orderId };
//             console.log("data=>", data)
//             const response = await postData('api/challan/get-all-challans-by-customer-and-order', data);
//             if (response?.status === true) {
//                 setPreviewOrder(response?.data);
//                 console.log("response=>", response)
//             }
//         } catch (error) {
//             console.log("error=>", error)
//         }
//     }
//     useEffect(() => {
//         fetchChallanByCustomerAndOrder();

//     }, [challanForm?.customerId, challanForm?.orderId])

// console.log("previewOrder=>", previewOrder ,challanForm)

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold">Create Delivery Challan</h2>
//                         <button
//                             onClick={() => {
//                                 setShowCreateChallanModal(false);
//                                 resetChallanForm();
//                             }}
//                             className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                         >
//                             <i className="ri-close-line"></i>
//                         </button>
//                     </div>

//                     <div className="space-y-6">
//                         {/* Customer & Order Selection */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
//                                 <div className="relative">
//                                     <select
//                                         value={challanForm?.customerId}
//                                         onChange={(e) => handleCustomerChange(e.target.value, 'challan')}
//                                         className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                                     >
//                                         <option value="">Choose Customer</option>
//                                         {customers?.map(customer => (
//                                             <option key={customer?._id} value={customer?._id}>
//                                                 {customer?.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
//                                 <div className="relative">
//                                     <select
//                                         value={challanForm.orderId}
//                                         onChange={(e) => handleOrderChange(e.target.value, 'challan')}
//                                         className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                                         disabled={!challanForm?.customerId}
//                                     >
//                                         <option value="">Choose Order</option>
//                                         {filetrOrder?.map(order => (
//                                             <option key={order?._id} value={order._id}>
//                                                 {order?.orderNumber} - ₹{order?.subtotal?.toLocaleString()} ({order?.createdAt.split('T')[0]}) ({order?.status})
//                                             </option>
//                                         ))}
//                                     </select>
//                                     <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Order Items */}
//                         {challanForm?.items?.length > 0 && (
//                             <div>
//                                 <h3 className="font-medium mb-3">Order Items - Set Dispatch Quantities</h3>
//                                 <div className="space-y-3">
//                                     {challanForm?.items?.map((item, index) => (
//                                         <div key={index} className="bg-gray-50 p-4 rounded-lg">
//                                             <div className="grid grid-cols-5 gap-4 items-center">
//                                                 <div className="col-span-2">
//                                                     <div className="font-medium">{item?.name}</div>
//                                                     <div className="text-sm text-gray-500">Size: {item.availableSizes.map((item, index) => <>{item} {index !== item?.availableSizes?.length - 1 && ", "}</>)}</div>
//                                                 </div>
//                                                 <div className="text-center">
//                                                     <div className="text-sm text-gray-500">Ordered</div>

//                                                     <div className="font-medium" style={{}}>
//                                                         pcs ({item?.pcsInSet}) × quantity ({item?.quantity})
//                                                     </div>

//                                                     <div className="font-medium">
//                                                         {item?.pcsInSet * item?.quantity}
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-center">
//                                                     <div className="text-sm text-gray-500">Quantity</div>
//                                                     <div className="font-medium text-orange-600">{item?.quantity}</div>
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-sm text-gray-500 mb-1">Dispatch Qty</label>
//                                                     <input
//                                                         type="number"
//                                                         value={item?.dispatchQty}
//                                                         onChange={(e) => updateChallanItemQuantity(index, parseInt(e.target.value) || 0)}
//                                                         min="0"
//                                                         max={item?.quantity}
//                                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
//                                                     />
//                                                 </div>
//                                             </div>
//                                             {item?.dispatchQty > 0 && (
//                                                 <div className="mt-2 text-right">
//                                                     <span className="text-sm font-medium text-blue-600">
//                                                         Dispatch Value: ₹{(item.dispatchQty * item?.productId?.singlePicPrice * item?.productId?.pcsInSet).toLocaleString()}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//                                     <div className="flex justify-between items-center">
//                                         <span className="font-medium">Total Dispatch Value:</span>
//                                         <span className="text-xl font-bold text-blue-600">
//                                             ₹{challanForm?.items?.reduce((sum, item) => sum + (item.dispatchQty * item?.productId?.singlePicPrice * item?.productId?.pcsInSet), 0).toLocaleString()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Additional Details */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Vendor</label>
//                                 <div className="relative">
//                                     <select
//                                         value={challanForm?.deliveryVendor}
//                                         onChange={(e) => setChallanForm({ ...challanForm, deliveryVendor: e.target.value })}
//                                         className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                                     >
//                                         {vendors.map(vendor => (
//                                             <option key={vendor} value={vendor}>{vendor}</option>
//                                         ))}
//                                     </select>
//                                     <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional) / Tracking Id</label>
//                                 <input
//                                     type="text"
//                                     value={challanForm.notes}
//                                     onChange={(e) => setChallanForm({ ...challanForm, notes: e.target.value })}
//                                     placeholder="Special delivery instructions..."
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex space-x-3 pt-4">
//                             <Button
//                                 onClick={() => {
//                                     setShowCreateChallanModal(false);
//                                     resetChallanForm();
//                                 }}
//                                 className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 onClick={createChallan}
//                                 className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//                                 disabled={!challanForm.customerId || !challanForm.orderId || challanForm.items.every(item => item.dispatchQty === 0)}
//                             >
//                                 Create Challan
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CreateChallanModal


import React, { useEffect, useState, useMemo } from "react";
import Button from "../../../components/base/Button";
import { postData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";

function CreateChallanModal({
  setShowCreateChallanModal,
  setChallanForm,
  setSelectedCustomerOrders,
  challanForm,
  customers,
  selectedCustomerOrders,
  vendors,
  handleCustomerChange,
  handleOrderChange,
  setSubProductsStock,
  subProductsStock,
  challans,
  setChallans,
  fetchChallan,
  orders,
}) {
  const [previewOrder, setPreviewOrder] = useState([]); // previous challans of same order

  // 🧠 Get filtered orders (excluding Cancelled, Returned, Delivered)
  const filteredOrders = useMemo(
    () =>
      selectedCustomerOrders.filter(
        (o) =>
          !["Cancelled", "Returned", "Dispatched"].includes(
            o?.status
          )
      ),
    [selectedCustomerOrders]
  );

  // 🧩 Update dispatch qty for an item
  const updateChallanItemQuantity = (index, dispatchQty, alreadyDispatched) => {
    const updatedItems = challanForm.items.map((item, i) =>
      i === index
        ? {
          ...item,
          dispatchQty: Math.min(
            Math.max(0, dispatchQty),
            item?.quantity - (item?.alreadyDispatched || 0)
          ),
          alreadyDispatched: alreadyDispatched
        }
        : item
    );

    setChallanForm({ ...challanForm, items: updatedItems });
  };

  // 📦 Create Challan
  const createChallan = async () => {
    const customer = customers.find((c) => c._id === challanForm?.customerId);
    const itemsToDispatch = challanForm.items.filter(
      (item) => item.dispatchQty > 0
    );

    if (!customer || itemsToDispatch.length === 0) {
      toast.warning("Please select customer, order and dispatch quantities");
      return;
    }

    // Validate stock
    for (const item of itemsToDispatch) {
      const dispatchedPcs = item.dispatchQty * item?.productId?.pcsInSet;
      const stockItem = subProductsStock.find((s) => s.name === item.name);
      if (stockItem && stockItem.stock < dispatchedPcs) {
        toast.error(
          `Insufficient stock for ${item.name}. Available: ${stockItem.stock} pcs, Required: ${dispatchedPcs} pcs`
        );
        return;
      }
    }

    const totalValue = itemsToDispatch.reduce(
      (sum, i) => sum + i.dispatchQty * i?.pcsInSet * i?.singlePicPrice,
      0
    );

    const payload = {
      customerId: customer._id,
      customer: customer.name,
      orderId: challanForm?.orderId,
      orderNumber: challanForm?.orderNumber,
      items: itemsToDispatch.map((item) => ({
        color: item?.color,
        availableSizes: item?.availableSizes,
        dispatchedQty: item?.dispatchQty,
        price: item?.singlePicPrice,
        pcsInSet: item?.pcsInSet,
        selectedSizes: item?.availableSizes,
        alreadyDispatched: item?.alreadyDispatched,
      })),
      totalValue,
      date: new Date().toISOString().split("T")[0],
      status: "Dispatched",
      vendor: challanForm?.deliveryVendor,
      notes: challanForm?.notes,
    };

    try {
      const response = await postData("api/challan/create-challan", payload);

      if (response?.success) {
        toast.success("Challan created successfully!");
        fetchChallan();
        resetForm();
        setShowCreateChallanModal(false);
      } else {
        toast.error("Failed to create challan");
      }
    } catch (err) {
      toast.error("Server error, please try again");
      console.error(err);
    }
  };

  // 🧹 Reset
  const resetForm = () => {
    setChallanForm({
      customerId: "",
      orderId: "",
      items: [],
      deliveryVendor: "BlueDart",
      notes: "",
    });
    setSelectedCustomerOrders([]);
  };

  // 🔍 Fetch existing challans for same customer & order
  const fetchChallanByCustomerAndOrder = async () => {
    if (!challanForm?.customerId || !challanForm?.orderId) return;
    try {
      const data = {
        customerId: challanForm.customerId,
        orderId: challanForm.orderId,
      };
      const response = await postData(
        "api/challan/get-all-challans-by-customer-and-order",
        data
      );

      if (response?.status === true) {
        setPreviewOrder(response?.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChallanByCustomerAndOrder();
  }, [challanForm?.customerId, challanForm?.orderId]);

  // 🧾 Calculate already dispatched per product
  const mergedItems = useMemo(() => {
    if (!challanForm?.items?.length) return [];

    return challanForm.items.map((item) => {
      const dispatchedCount = previewOrder
        ?.flatMap((ch) => ch.items)
        .filter((i) => i.name === item.name)
        .reduce((sum, i) => sum + (i.dispatchedQty || 0), 0);

      const remaining = Math.max(item.quantity - dispatchedCount, 0);

      return {
        ...item,
        alreadyDispatched: dispatchedCount,
        remainingQty: remaining,
      };
    });
  }, [challanForm?.items, previewOrder]);


  useEffect(() => {
    if (orders && customers) {
      const matchedCustomer = customers.find((c) =>
        c?.email?.trim().toLowerCase() === orders?.customer?.email?.trim().toLowerCase()
      );

      console.log("mergedItems==XXX>", challanForm, customers, matchedCustomer)
      handleOrderChange(orders?._id, "challan")
      setSelectedCustomerOrders([orders]);
      setChallanForm((prev) => ({
        ...prev,
        customerId: matchedCustomer?._id || "",
        orderId: orders?._id || "",
        orderNumber: orders?.orderNumber || "",
        deliveryVendor: orders?.transportName || "BlueDart",
        notes: orders?.orderNote || "",

      }));
    }
  }, [orders, customers]);

  const handleSelectAll = () => {
    const allItems = mergedItems.map((item) => ({
      ...item,
      dispatchQty: item.remainingQty,
    }));
    setChallanForm((prev) => ({ ...prev, items: allItems }));
  }
  // console.log("mergedItems==XXX>", challanForm, customers)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Create Delivery Challan
            </h2>
            <button
              onClick={() => {
                setShowCreateChallanModal(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Customer & Order Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer
              </label>
              <select
                value={challanForm?.customerId}
                onChange={(e) => handleCustomerChange(e.target.value, "challan")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Choose Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Order
              </label>
              <select
                value={challanForm?.orderId}
                onChange={(e) => handleOrderChange(e.target.value, "challan")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                disabled={!challanForm?.customerId}
              >
                <option value="">Choose Order</option>
                {filteredOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.orderNumber} - ₹{o.subtotal?.toLocaleString()} (
                    {o?.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order Items */}
          {mergedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">
                  Dispatch Quantities per Item
                </h3>
                <Button onClick={handleSelectAll} >
                  All QUANTITY
                </Button>
              </div>
              {mergedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-lg"
                >
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2">
                      <div className="font-medium text-gray-800">{item?.color}</div>
                      <div className="text-xs text-gray-500">
                        Sizes: {item.availableSizes.join(", ")}
                      </div>
                    </div>

                    <div className="text-center text-sm">
                      <div className="text-gray-500">Ordered Qty</div>
                      <div className="font-semibold">{item?.quantity}</div>
                    </div>

                    <div className="text-center text-sm">
                      <div className="text-gray-500">Already Dispatched</div>
                      <div className="text-green-600 font-semibold">
                        {item.alreadyDispatched}
                      </div>
                    </div>

                    <div className="text-center text-sm">
                      <div className="text-gray-500 mb-1">New Dispatch</div>
                      <input
                        type="number"
                        value={item.dispatchQty || 0}
                        onChange={(e) =>
                          updateChallanItemQuantity(index, +e.target.value, item.alreadyDispatched)
                        }
                        min="0"
                        max={item.remainingQty}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                    </div>
                  </div>

                  {item?.dispatchQty > 0 && (
                    <div className="mt-2 text-right text-xs text-blue-600">
                      Value: ₹
                      {(
                        item.dispatchQty *
                        item?.productId?.singlePicPrice *
                        item?.productId?.pcsInSet
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {mergedItems.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center font-medium">
              <span>Total Dispatch Value:</span>
              <span className="text-xl text-blue-600 font-bold">
                ₹
                {mergedItems
                  .reduce(
                    (sum, item) =>
                      sum +
                      item.dispatchQty *
                      item?.productId?.singlePicPrice *
                      item?.productId?.pcsInSet,
                    0
                  )
                  .toLocaleString()}
              </span>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Vendor
              </label>
              <select
                value={challanForm?.deliveryVendor}
                onChange={(e) =>
                  setChallanForm({ ...challanForm, deliveryVendor: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {vendors.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes / Tracking ID
              </label>
              <input
                type="text"
                value={challanForm.notes}
                onChange={(e) =>
                  setChallanForm({ ...challanForm, notes: e.target.value })
                }
                placeholder="Special instructions or tracking number..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => {
                setShowCreateChallanModal(false);
                resetForm();
              }}
              className="flex-1 bg-gray-700 text-white hover:bg-gray-900"
            >
              Cancel
            </Button>

            <Button
              onClick={createChallan}
              className="flex-1 bg-blue-900 text-white hover:bg-blue-700"
              disabled={
                !challanForm.customerId ||
                !challanForm.orderId ||
                mergedItems.every((i) => i.dispatchQty === 0)
              }
            >
              Create Challan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateChallanModal;
