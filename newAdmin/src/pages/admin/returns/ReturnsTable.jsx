import React from 'react'
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

function ReturnsTable({ getFilteredReturns, handleEdit, handleStatusUpdate, handlePrint, handleDelete,
    returnCurrantPage,
    setReturnCurrantPage,
    returnPage,
    
}) {
    console.log("getFilteredReturns==>", getFilteredReturns()[1])
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Return Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client & Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Refund & Pieces
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status & Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredReturns().map((returnItem) => {
                            const totalReturnPcs = returnItem.items.reduce((sum, item) => sum + (item.returnPcs), 0);

                            return (
                                <tr key={returnItem.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{returnItem.returnNumber}</div>
                                            <div className="text-sm text-gray-500">{(returnItem.createdAt).split('T')[0]}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{returnItem.customer}</div>
                                            <div className="text-sm text-gray-500">Order: {returnItem.orderId?.orderNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">₹{returnItem.totalRefund.toLocaleString()}</div>
                                            <div className="text-sm text-orange-600">{totalReturnPcs} pcs to return</div>
                                            <div className="text-sm text-gray-500">{returnItem?.items?.length} item{returnItem?.items?.length > 1 ? 's' : ''}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${returnItem?.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                returnItem.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    returnItem.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {returnItem?.status}
                                            </span>
                                            <div className="text-sm text-gray-500 mt-1">{returnItem.items[0]?.reason}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex space-x-1">
                                                <Button
                                                    onClick={() => handleEdit(returnItem, 'return')}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                                                >
                                                    <i className="ri-edit-line mr-1"></i>Edit
                                                </Button>
                                                <div className="relative group">
                                                    <Button className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs px-2 py-1">
                                                        <i className="ri-arrow-down-s-line"></i>Status
                                                    </Button>
                                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnItem?._id, 'Pending', 'return')}
                                                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Pending
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnItem?._id, 'Approved', 'return')}
                                                                className="block px-4 py-2 text-xs text-green-700 hover:bg-green-100 w-full text-left font-medium"
                                                            >
                                                                ✓ Approve & Add Stock
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnItem?._id, 'Rejected', 'return')}
                                                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Rejected
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(returnItem?._id, 'Completed', 'return')}
                                                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Completed
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <Button
                                                    onClick={() => handlePrint(returnItem, 'return')}
                                                    className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                                                >
                                                    <i className="ri-printer-line mr-1"></i>Print
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(returnItem?._id, 'return')}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                                                >
                                                    <i className="ri-delete-bin-line mr-1"></i>Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-4">
                {/* <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            /> */}

                {returnPage > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setReturnCurrantPage(prev => Math.max(prev - 1, 1))}
                                disabled={returnCurrantPage === 1}
                                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </Button>

                            {Array.from({ length: returnPage }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    onClick={() => setReturnCurrantPage(page)}
                                    className={`px-4 py-2 ${returnCurrantPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                onClick={() => setReturnCurrantPage(prev => Math.min(prev + 1, returnPage))}
                                disabled={returnCurrantPage === returnPage}
                                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </Card>
    )
}

export default ReturnsTable
