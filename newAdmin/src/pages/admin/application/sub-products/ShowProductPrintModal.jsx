import React from 'react'
import Button from '../../../../components/base/Button';

function ShowProductPrintModal({ selectedForPrint, setShowPrintModal, generateEAN13SVG,
    setSelectedForPrint, printQuantities, setPrintQuantities, handlePrint, updatePrintQuantity }) {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Print Barcode Labels</h2>
                        <button
                            onClick={() => setShowPrintModal(false)}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h3 className="font-medium text-blue-800 mb-2">Print Settings</h3>
                            <p className="text-sm text-blue-700">Label Size: 101.6mm × 25.2mm</p>
                            <p className="text-sm text-blue-700">Content: EAN-13 barcode + Single Pic Price</p>
                        </div>

                        <div className="space-y-4">
                            {selectedForPrint.map(item => (
                                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={item?.subProductImages && item.subProductImages?.length > 0 ? item.subProductImages[0] || item?.productId?.images[0] : item?.productId?.images[0] || ''}
                                                alt={item?.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div>
                                                <h4 className="font-medium">{item?.name}</h4>
                                                <p className="text-sm text-gray-500">{item?.barcode}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Copies:</span>
                                            <button
                                                onClick={() => updatePrintQuantity(item?._id, -1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                <i className="ri-subtract-line text-sm"></i>
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={printQuantities[item._id] || 1}
                                                onChange={(e) => {
                                                    const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                                                    setPrintQuantities(prev => ({ ...prev, [item._id]: value }));
                                                }}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                            />
                                            <button
                                                onClick={() => updatePrintQuantity(item._id, 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                <i className="ri-add-line text-sm"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Label Preview - Updated Clean Layout */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-2">Label Preview (101.6mm × 25.2mm):</div>
                                        <div
                                            className="border border-gray-300 bg-white flex flex-col items-center justify-center p-2"
                                            style={{
                                                width: '285px',
                                                height: '71px',
                                                transform: 'scale(0.8)',
                                                transformOrigin: 'left top'
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <img
                                                    src={generateEAN13SVG(item?.barcode)}
                                                    alt="Barcode"
                                                    className="h-8 w-auto mb-1"
                                                />
                                                <div className="font-bold text-black" style={{ fontSize: '10px' }}>
                                                    ₹{item?.singlePicPrice}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            Total Labels: {Object.values(printQuantities).reduce((sum, qty) => sum + qty, 0)}
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={() => setShowPrintModal(false)}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <i className="ri-printer-line mr-2"></i>
                                Print Labels
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowProductPrintModal
