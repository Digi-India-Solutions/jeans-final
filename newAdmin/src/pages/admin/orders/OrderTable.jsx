import React from 'react'
import Button from '../../../components/base/Button';

function OrderTable({ filteredOrders, getStatusColor, getPaymentTypeColor, setSelectedOrder,
    canUpdateStatus, setShowOrderModal, openStatusUpdate, openPaymentUpdate, updateOrderStatus, totalPages, currentPage, setCurrentPage, openEditOrderNote }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivered Pcs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tracking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders?.map(order => (
                        <tr key={order?._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{order?.orderNumber}</div>
                                    <div className="text-sm text-gray-500">
                                        {order?.orderDate} • {order?.orderType}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {order?.items?.length} set{order?.items?.length > 1 ? 's' : ''}
                                    </div>
                                    {order.orderNote && (
                                        <div className="text-xs text-blue-600 mt-1" title={order.orderNote}>
                                            Note: {order.orderNote.length > 20 ? order.orderNote.substring(0, 20) + '...' : order.orderNote}
                                        </div>
                                    )}
                                    {order.transportName && (
                                        <div className="text-xs text-purple-600">
                                            Transport: {order.transportName}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{order?.customer?.name}</div>
                                    <div className="text-sm text-gray-500">{order?.customer?.email}</div>
                                    {/* <div className="text-xs text-gray-400">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.customer.type === 'B2B'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {order.customer.type}
                              </span>
                            </div> */}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">₹{order?.total?.toLocaleString()}</div>
                                    <div className="text-sm text-green-600">Paid: ₹{order?.paidAmount?.toLocaleString()}</div>
                                    {order?.balanceAmount > 0 && (
                                        <div className="text-sm text-red-600">Balance: ₹{order?.balanceAmount?.toLocaleString()}</div>
                                    )}
                                    <div className="text-xs text-gray-500">{order?.paymentMethod}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order?.status)}`}>
                                        {order?.status}
                                    </span>
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(order?.paymentType)}`}>
                                            {order?.paymentType}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{order?.deliveredPcs || 0}</div>
                                    <div className="text-xs text-gray-500">pieces</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order?.trackingId ? (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{order?.trackingId}</div>
                                        <div className="text-xs text-gray-500">{order?.deliveryVendor}</div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400">No tracking</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex space-x-1">
                                        <Button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderModal(true);
                                            }}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            onClick={() => openEditOrderNote(order)}
                                            className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs px-1 py-1"
                                        >
                                            Note
                                        </Button>
                                        {canUpdateStatus(order?.status) && (
                                            <Button
                                                onClick={() => openStatusUpdate(order)}
                                                className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-1 py-1"
                                            >
                                                Status
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex space-x-1">
                                        {order.balanceAmount > 0 && (
                                            <Button
                                                onClick={() => openPaymentUpdate(order)}
                                                className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-xs px-2 py-1"
                                            >
                                                Payment
                                            </Button>
                                        )}
                                        {order.status !== 'Cancelled' && order?.status !== 'Delivered' && (
                                            <Button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this order?')) {
                                                        updateOrderStatus(order?._id, 'Cancelled');
                                                    }
                                                }}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700'}`}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default OrderTable
