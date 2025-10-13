import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function CreateNotesModel({ fetchAllOrder, setEditOrderNoteForm, setShowEditOrderNoteModal, editOrderNoteForm }) {
    const updateOrderNote = async () => {
        if (!editOrderNoteForm.orderId) return;
        const response = await postData(`api/order/update-order-notes-by-admin/${editOrderNoteForm?.orderId}`, { orderNote: editOrderNoteForm.orderNote })
        if (response.success === true) {
            fetchAllOrder()
            setShowEditOrderNoteModal(false);
            setEditOrderNoteForm({ orderId: null, orderNote: '' });
        }
    };

    return (
        <div>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Edit Order Note</h2>
                            <button
                                onClick={() => {
                                    setShowEditOrderNoteModal(false);
                                    setEditOrderNoteForm({ orderId: null, orderNote: '' });
                                }}
                                className="text-gray-900 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Note</label>
                                <textarea
                                    value={editOrderNoteForm.orderNote}
                                    onChange={(e) => setEditOrderNoteForm({ ...editOrderNoteForm, orderNote: e.target.value })}
                                    rows="4"
                                    placeholder="Enter special instructions or notes for this order..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    maxLength="500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {editOrderNoteForm.orderNote.length}/500 characters
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <Button
                                onClick={() => {
                                    setShowEditOrderNoteModal(false);
                                    setEditOrderNoteForm({ orderId: null, orderNote: '' });
                                }}
                                className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={updateOrderNote}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Update Note
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateNotesModel
