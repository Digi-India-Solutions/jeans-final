import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function EditModal({ setChallans, fetchChallan, challans, editingItem, setReturns, returns, setEditingItem,
    setShowEditModal, editForm, setEditForm, handleEdit, fetchReturn }) {

    const saveEdit = async () => {
        if (editingItem?.type === 'challan') {
            const data = { ...editingItem, ...editForm, items: editForm.items };
            const respons = await postData(`api/challan/update-challan/${editForm?._id}`, { data })
            if (respons.success === true) {
                fetchChallan()
            }

        } else {

            const data = { ...editingItem, ...editForm, items: editForm.items, orderId: editingItem?.orderId?._id };
            console.log("data:::=>", data)
            const respons = await postData(`api/return/update-return/${editForm?._id}`, { data })
            if (respons.success === true) {
                fetchReturn()
            }
        }
        setShowEditModal(false);
        setEditingItem(null);
    };

    const updateEditItemQuantity = (index, field, value) => {
        const updatedItems = editForm.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );

        setEditForm({ ...editForm, items: updatedItems });
    };

    const handleChange = (index, field, value) => {
        const updatedItems = editForm?.items?.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );

        setEditForm({ ...editForm, items: updatedItems });
    };
    const changePrice = (index, value, Refund) => {
        console.log("GGGG:==>", value.singlePicPrice)
        const updatedItems = editForm?.items?.map((item, i) =>
            i === index ? { ...item, totalRefund: value.singlePicPrice * Refund } : item
        );
        setEditForm({ ...editForm, items: updatedItems });
    };

    console.log("editForm:::=>", editForm.items)
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
                                    <> <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <div className="font-medium">{item?.name}</div>
                                            <div className="text-sm text-gray-500">Size: {item?.availableSizes?.map((item, ind) => <>{item} {ind !== item?.availableSizes?.length - 1 && ", "}</>)}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">Qty:</span>
                                            {editingItem.type === 'return' ? <input
                                                type="number"
                                                disabled={item?.dispatchedQty >= item?.returnPcs}
                                                value={editingItem.type === 'challan' ? item.dispatchedQty : item.returnPcs}
                                                onChange={(e) => {
                                                    const newValue = parseInt(e.target.value) || 0;
                                                    const field =
                                                        editingItem.type === "challan" ? "dispatchedQty" : "returnPcs";

                                                    updateEditItemQuantity(index, field, newValue);
                                                    // changePrice(index, item, newValue);
                                                }}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                            /> : <input
                                                type="number"
                                                disabled={item?.dispatchedQty >= item?.returnQty}
                                                value={editingItem.type === 'challan' ? item.dispatchedQty : item.returnQty}
                                                onChange={(e) => updateEditItemQuantity(index, editingItem.type === 'challan' ? 'dispatchedQty' : 'returnPcs', parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                            />}

                                        </div>
                                    </div>
                                        {
                                            editingItem.type === 'return' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                                    <input
                                                        type="text"
                                                        value={item?.reason}
                                                        onChange={(e) => handleChange(index, 'reason', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )
                                        }
                                    </>))}
                            </div>
                        </div>



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
                                className="flex-1 bg-gray-700 text-white hover:bg-gray-900"
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
