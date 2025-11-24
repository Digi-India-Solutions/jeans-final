// import React from 'react'
// import Button from '../../../components/base/Button';

// function OrderTable({ filteredOrders, getStatusColor, getPaymentTypeColor, setSelectedOrder,
//     canUpdateStatus, setShowOrderModal, openStatusUpdate, openPaymentUpdate, updateOrderStatus, totalPages, currentPage, setCurrentPage, openEditOrderNote }) {


//     return (
//         <div className="overflow-x-auto" >
//             <table className="w-full" >
//                 <thead className="bg-gray-50" >
//                     <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Order Details
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Customer
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Payment Details
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Status
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Delivered Pcs
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Totale Pcs
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Tracking
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Actions
//                         </th>
//                     </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredOrders?.map(order => {
//                         const totalPCS = order?.items.reduce((acc, item) => {
//                             return acc + (item?.quantity * item?.pcsInSet);
//                         }, 0);

//                         const DeleverdPCS = order?.items.reduce((acc, item) => {
//                             return acc + (item?.deliveredPcs || 0);
//                         }, 0);


//                         return (
//                             <tr key={order?._id} className="hover:bg-gray-50" style={{width: '100 vw'}} >
//                                 <td className="px-6 py-4 whitespace-nowrap" style={{width:'5%'}}>
//                                     <div>
//                                         <div className="text-sm font-medium text-gray-900">{order?.orderNumber}</div>
//                                         <div className="text-sm text-gray-500">
//                                             {order?.orderDate} • {order?.orderType}
//                                         </div>
//                                         <div className="text-xs text-gray-400">
//                                             {order?.items?.length} set{order?.items?.length > 1 ? 's' : ''}
//                                         </div>
//                                         {order.orderNote && (
//                                             <div className="text-xs text-blue-600 mt-1" title={order.orderNote}>
//                                                 Note: {order.orderNote.length > 20 ? order.orderNote.substring(0, 20) + '...' : order.orderNote}
//                                             </div>
//                                         )}
//                                         {order.transportName && (
//                                             <div className="text-xs text-purple-600">
//                                                 Transport: {order.transportName}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap" style={{width:'20%'}}>
//                                     <div>
//                                         <div className="text-sm font-medium text-gray-900">{order?.customer?.name}</div>
//                                         <div className="text-sm text-gray-500">{order?.customer?.email}</div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap" style={{width:'20%'}}>
//                                     <div>
//                                         <div className="text-sm font-medium text-gray-900">₹{order?.total?.toLocaleString()}</div>
//                                         <div className="text-sm text-green-600">Paid: ₹{order?.paidAmount?.toLocaleString()}</div>
//                                         {order?.balanceAmount > 0 && (
//                                             <div className="text-sm text-red-600">Balance: ₹{order?.balanceAmount?.toLocaleString()}</div>
//                                         )}
//                                         <div className="text-xs text-gray-500">{order?.paymentMethod}</div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap" style={{width:'10%'}}>
//                                     <div className="space-y-1">
//                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order?.status)}`}>
//                                             {order?.status}
//                                         </span>
//                                         <div>
//                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(order?.paymentType)}`}>
//                                                 {order?.paymentType}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap" style={{width:'10%'}}>
//                                     <div className="text-center">
//                                         <div className="text-lg font-bold text-blue-600">{DeleverdPCS || 0}</div>
//                                         <div className="text-xs text-gray-500">pieces</div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="text-center">
//                                         <div className="text-lg font-bold text-blue-600">{totalPCS || 0}</div>
//                                         <div className="text-xs text-gray-500">pieces</div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     {order?.trackingId ? (
//                                         <div>
//                                             <div className="text-sm font-medium text-gray-900">{order?.trackingId}</div>
//                                             <div className="text-xs text-gray-500">{order?.deliveryVendor}</div>
//                                         </div>
//                                     ) : (
//                                         <span className="text-sm text-gray-400">No tracking</span>
//                                     )}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                     <div className="flex flex-col space-y-1">
//                                         <div className="flex space-x-1">
//                                             <Button
//                                                 onClick={() => {
//                                                     setSelectedOrder(order);
//                                                     setShowOrderModal(true);
//                                                 }}
//                                                 className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
//                                             >
//                                                 View
//                                             </Button>
//                                             <Button
//                                                 onClick={() => openEditOrderNote(order)}
//                                                 className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs px-1 py-1"
//                                             >
//                                                 Note
//                                             </Button>
//                                             {canUpdateStatus(order?.status) && (
//                                                 <Button
//                                                     onClick={() => openStatusUpdate(order)}
//                                                     className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-1 py-1"
//                                                 >
//                                                     Status
//                                                 </Button>
//                                             )}
//                                         </div>
//                                         <div className="flex space-x-1">
//                                             {order.balanceAmount > 0 && (
//                                                 <Button
//                                                     onClick={() => openPaymentUpdate(order)}
//                                                     className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-xs px-2 py-1"
//                                                 >
//                                                     Payment
//                                                 </Button>
//                                             )}
//                                             {order.status !== 'Cancelled' && order?.status !== 'Delivered' && (
//                                                 <Button
//                                                     onClick={() => {
//                                                         if (confirm('Are you sure you want to cancel this order?')) {
//                                                             updateOrderStatus(order?._id, 'Cancelled');
//                                                         }
//                                                     }}
//                                                     className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
//                                                 >
//                                                     Cancel
//                                                 </Button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )
//                     })}
//                 </tbody>
//             </table>

//             {totalPages > 1 && (
//                 <div className="flex justify-center mt-6">
//                     <div className="flex space-x-2">
//                         <Button
//                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                             disabled={currentPage === 1}
//                             className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
//                         >
//                             Previous
//                         </Button>

//                         {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                             <Button
//                                 key={page}
//                                 onClick={() => setCurrentPage(page)}
//                                 className={`px-4 py-2 ${currentPage === page
//                                     ? 'bg-blue-600 text-white'
//                                     : 'bg-gray-100 text-gray-700'}`}
//                             >
//                                 {page}
//                             </Button>
//                         ))}

//                         <Button
//                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                             disabled={currentPage === totalPages}
//                             className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
//                         >
//                             Next
//                         </Button>
//                     </div>
//                 </div>
//             )}

//         </div>
//     )
// }

// export default OrderTable


import React from "react";
import Button from "../../../components/base/Button";

function OrderTable({
    filteredOrders, getStatusColor, getPaymentTypeColor, setSelectedOrder, canUpdateStatus, setShowOrderModal, openStatusUpdate,
    openPaymentUpdate, updateOrderStatus, totalPages, currentPage, setCurrentPage, openEditOrderNote, permiton, openDeleteOrder,
    showCreateOrderModal, setShowCreateOrderModal
}) {
    return (
        <div className="overflow-x-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 bg-gray-50 z-10">
                    <tr className="sticky top-0 bg-gray-50 z-10">
                        {["Order Details", "Customer", "Payment Details", "Status", "Total Pcs", "Delivered Pcs", "Tracking", "Actions",].map((heading) => (
                            <th
                                key={heading}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders?.map((order) => {
                        const totalPCS = order?.items.reduce(
                            (acc, item) => acc + (item?.quantity || 0) * (item?.pcsInSet || 0),
                            0
                        );

                        const deliveredPCS = order?.items.reduce(
                            (acc, item) => acc + (item?.deliveredPcs || 0),
                            0
                        );

                        // const returnPcs = order?.items.reduce(
                        //     (acc, item) => acc + (item?.returnPcs || 0),
                        //     0
                        // );

                        const truncatedNote =
                            order.orderNote && order.orderNote.length > 25
                                ? order.orderNote.substring(0, 25) + "…"
                                : order.orderNote;

                        return (
                            <tr key={order?._id} className="hover:bg-gray-50">
                                {/* Order Details */}
                                <td className="px-4 py-4 whitespace-nowrap w-1/6">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order?.orderNumber}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order?.orderDate} • {order?.orderType}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {order?.items?.length} set
                                            {order?.items?.length > 1 ? "s" : ""}
                                        </div>

                                        {order.orderNote && (
                                            <div
                                                className="text-xs text-blue-600 mt-1 truncate max-w-[120px]"
                                                title={order.orderNote}
                                            >
                                                Note: {truncatedNote}
                                            </div>
                                        )}

                                        {order.transportName && (
                                            <div className="text-xs text-purple-600">
                                                Transport: {order.transportName}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Customer */}
                                <td className="px-4 py-4 whitespace-nowrap w-1/5">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order?.customer?.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order?.customer?.email}
                                        </div>
                                    </div>
                                </td>

                                {/* Payment */}
                                <td className="px-4 py-4 whitespace-nowrap w-1/5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₹{order?.total?.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-green-600">
                                            Paid: ₹{order?.paidAmount?.toLocaleString()}
                                        </div>
                                        {order?.balanceAmount > 0 && (
                                            <div className="text-sm text-red-600">
                                                Balance: ₹{order?.balanceAmount?.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            {order?.paymentMethod}
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4 whitespace-nowrap w-28">
                                    <div className="space-y-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                order?.status
                                            )}`}
                                        >
                                            {order?.status}
                                        </span>
                                        <div>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(
                                                    order?.paymentType
                                                )}`}
                                            >
                                                {order?.paymentType}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Total */}
                                <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                    <div className="text-lg font-bold text-blue-600">
                                        {totalPCS || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">pieces</div>
                                </td>

                                {/* Delivered */}
                                <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                    <div className="text-lg font-bold text-blue-600">
                                        {deliveredPCS || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">pieces</div>
                                </td>
                                {/* Return Qty */}
                                {/* <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                    <div className="text-lg font-bold text-blue-600">
                                        {returnPcs || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">QTY</div>
                                </td> */}


                                {/* Tracking */}
                                <td className="px-4 py-4 whitespace-nowrap w-32">
                                    {order?.trackingId ? (
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order?.trackingId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order?.deliveryVendor}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">No tracking</span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-40">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex space-x-1">
                                            {permiton.read && <Button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                className="bg-blue-500 text-blue-600 hover:bg-blue-900 text-xs px-2 py-1"
                                            >
                                                View
                                            </Button>}
                                            {permiton.update && <Button
                                                onClick={() => openEditOrderNote(order)}
                                                className="bg-purple-500 text-purple-600 hover:bg-purple-900 text-xs px-1 py-1"
                                            >
                                                Note
                                            </Button>}
                                            {permiton.delete && (
                                                <div className="flex space-x-1">
                                                    <Button
                                                        onClick={() => openDeleteOrder(order)}
                                                        className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}

                                            {canUpdateStatus(order?.status) && (
                                                <Button
                                                    onClick={() => openStatusUpdate(order)}
                                                    className="bg-green-500 text-green-600 hover:bg-green-100 text-xs px-1 py-1"
                                                >
                                                    Status
                                                </Button>
                                            )}
                                        </div>
                                        {permiton.update && <div className="flex space-x-1">
                                            {/* <Button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowCreateOrderModal(true)
                                                }}
                                                className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-2 py-1 rounded"
                                            >
                                                Edit Order
                                            </Button> */}
                                            {order.balanceAmount > 0 && (
                                                <Button
                                                    onClick={() => openPaymentUpdate(order)}
                                                    className="bg-yellow-500 text-white-600 hover:bg-yellow-100 text-xs px-2 py-1"
                                                >
                                                    Payment
                                                </Button>
                                            )}
                                            {order.status !== "Cancelled" &&
                                                order?.status !== "Delivered" && (
                                                    <Button
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    "Are you sure you want to cancel this order?"
                                                                )
                                                            ) {
                                                                updateOrderStatus(order?._id, "Cancelled");
                                                            }
                                                        }}
                                                        className="bg-red-500 text-red-600 hover:bg-red-900 text-xs px-2 py-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                        </div>}

                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center sticky top-0 bg-gray-50 z-10">
                    <div className="flex space-x-2 sticky top-0 bg-gray-50 z-10">
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 ${currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderTable;
