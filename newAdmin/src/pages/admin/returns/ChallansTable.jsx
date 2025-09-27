import React from 'react'
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

function ChallansTable({ getFilteredChallans, handleEdit, handleStatusUpdate, handlePrint, handleDelete }) {
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Challan Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client & Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value & Pieces
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status & Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredChallans().map((challan) => {
                            const totalPcs = challan.items.reduce((sum, item) => sum + (item.dispatchedQty * item.pcsInSet), 0);

                            return (
                                <tr key={challan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{challan.challanNumber}</div>
                                            <div className="text-sm text-gray-500">{challan.date}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{challan.customer}</div>
                                            <div className="text-sm text-gray-500">Order: {challan.orderNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">₹{challan.totalValue.toLocaleString()}</div>
                                            <div className="text-sm text-blue-600">{totalPcs} pcs dispatched</div>
                                            <div className="text-sm text-gray-500">{challan.items.length} item{challan.items.length > 1 ? 's' : ''}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${challan.status === 'Dispatched' ? 'bg-green-100 text-green-800' :
                                                challan.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {challan.status}
                                            </span>
                                            <div className="text-sm text-gray-500 mt-1">{challan.vendor}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex space-x-1">
                                                <Button
                                                    onClick={() => handleEdit(challan, 'challan')}
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
                                                                onClick={() => handleStatusUpdate(challan.id, 'Pending', 'challan')}
                                                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Pending
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(challan.id, 'Dispatched', 'challan')}
                                                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Dispatched
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(challan.id, 'Completed', 'challan')}
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
                                                    onClick={() => handlePrint(challan, 'challan')}
                                                    className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                                                >
                                                    <i className="ri-printer-line mr-1"></i>Print
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(challan.id, 'challan')}
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
        </Card>
    )
}

export default ChallansTable
