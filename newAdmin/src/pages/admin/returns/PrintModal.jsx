import React from 'react'
import Button from '../../../components/base/Button';

function PrintModal({ setShowPrintModal, setPrintingItem, printingItem, printDocument }) {
    console.log("item?.size::=>", printingItem?.items?.availableSizes)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Print {printingItem.type === 'challan' ? 'Delivery Challan' : 'Return Slip'}
                        </h2>
                        <button
                            onClick={() => {
                                setShowPrintModal(false);
                                setPrintingItem(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    {/* Print Content */}
                    <div id="print-content" className="bg-white p-8 border">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {printingItem.type === 'challan' ? 'DELIVERY CHALLAN' : 'RETURN SLIP'}
                            </h1>
                            <p className="text-gray-600 mt-2">Garments B2B &amp; Offline Management Platform</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <h3 className="font-semibold mb-2">Customer Details:</h3>
                                <p className="text-sm">
                                    <strong>Name:</strong> {printingItem.customer}<br />
                                    <strong>Order Number:</strong> {printingItem.orderNumber}<br />
                                    <strong>Date:</strong> {(printingItem.date).split('T')[0]}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">
                                    {printingItem.type === 'challan' ? 'Challan' : 'Return'} Details:
                                </h3>
                                <p className="text-sm">
                                    <strong>Number:</strong> {printingItem.type === 'challan' ? printingItem.challanNumber : printingItem.returnNumber}<br />
                                    <strong>Status:</strong> {printingItem.status}<br />
                                    {printingItem.type === 'challan' && printingItem.vendor && (
                                        <>
                                            <strong>Vendor:</strong> {printingItem.vendor}<br />
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Items:</h3>
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                                        <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printingItem.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                                            <td className="border border-gray-300 px-4 py-2">{item?.availableSizes.map((size) => size).join(', ')}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                {printingItem.type === 'challan' ? item.dispatchedQty : item.returnQty}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">₹{printingItem.type === 'challan' ? item?.price || 0 : item?.refundAmount || 0}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-right">
                                                ₹{printingItem.type === 'challan'
                                                    ? (item.dispatchedQty * item.price).toLocaleString()
                                                    : item.refundAmount?.toLocaleString() || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50">
                                        <td colSpan="4" className="border border-gray-300 px-4 py-2 text-right font-semibold">
                                            Total {printingItem.type === 'challan' ? 'Value' : 'Refund'}:
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                                            ₹{printingItem.type === 'challan'
                                                ? printingItem.totalValue?.toLocaleString()
                                                : printingItem.totalRefund?.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {printingItem.type === 'return' && printingItem.items[0]?.reason && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Return Reason:</h3>
                                <p className="text-sm">{printingItem.items.map((item) => <div>{item?.reason}</div>)}</p>
                            </div>
                        )}

                        <div className="text-right text-sm text-gray-600">
                            <p>Generated on: {new Date().toLocaleDateString()}</p>
                            <p>Powered by Garments Management System</p>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <button className="flex-1 bg-gray-700 text-white hover:bg-gray-900" onClick={() => setShowPrintModal(false)}>Close</button>
                        <button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" onClick={printDocument}>Print</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintModal
