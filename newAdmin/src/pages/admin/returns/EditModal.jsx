import React from 'react'
import Button from '../../../components/base/Button';

function EditModal({ setChallans, challans, editingItem, setReturns, returns, setEditingItem,
    setShowEditModal, editForm, setEditForm, handleEdit }) {

    const saveEdit = () => {
        if (editingItem.type === 'challan') {
            setChallans(challans.map(challan =>
                challan.id === editingItem.id
                    ? { ...challan, ...editForm, items: editForm.items }
                    : challan
            ));
        } else {
            setReturns(returns.map(returnItem =>
                returnItem.id === editingItem.id
                    ? { ...returnItem, ...editForm, items: editForm.items }
                    : returnItem
            ));
        }
        setShowEditModal(false);
        setEditingItem(null);
    };

    const updateEditItemQuantity = (index, field, value) => {
        const updatedItems = editForm.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );

        setEditForm({
            ...editForm,
            items: updatedItems
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Edit {editingItem.type === 'challan' ? 'Delivery Challan' : 'Return'} - {editingItem.type === 'challan' ? editingItem.challanNumber : editingItem.returnNumber}
                        </h2>
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingItem(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="relative">
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Dispatched">Dispatched</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                            <div className="space-y-2">
                                {editForm.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">Size: {item.size}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">Qty:</span>
                                            <input
                                                type="number"
                                                value={editingItem.type === 'challan' ? item.dispatchedQty : item.returnQty}
                                                onChange={(e) => updateEditItemQuantity(index, editingItem.type === 'challan' ? 'dispatchedQty' : 'returnQty', parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {editingItem.type === 'return' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <input
                                    type="text"
                                    value={editForm.reason}
                                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingItem(null);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveEdit}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditModal
