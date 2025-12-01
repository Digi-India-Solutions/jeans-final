import React from 'react'
import Button from '../../../../components/base/Button';
import { postData } from '../../../../services/FetchNodeServices';

function ManagementRewordPoint({ fetchRewards, setShowCustomerModal, setCustomers, customers, setSelectedCustomer, selectedCustomer, setPointsForm, pointsForm }) {

    const handlePointsUpdate = async () => {
        if (!selectedCustomer || !pointsForm.points) return;

        const pointsChange = parseInt(pointsForm.points);
        try {
            const response = await postData(`api/reward/change-points-by-admin/${selectedCustomer?._id}`, pointsForm)
            // change-points-by-admin
        } catch (err) {
            console.log(err)
        }
        fetchRewards()
        setPointsForm({ points: '', reason: '', type: 'earned' });
        setShowCustomerModal(false);
        setSelectedCustomer(null);
    };

    console.log(pointsForm, selectedCustomer)
    return (
        <div>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-4">
                        Manage Points - {selectedCustomer?.userId?.name}
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Current Points</div>
                            <div className="text-2xl font-bold text-green-600">{selectedCustomer?.points}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="earned"
                                        checked={pointsForm.type === 'earned'}
                                        onChange={(e) => setPointsForm({ ...pointsForm, type: e.target.value })}
                                        className="mr-2"
                                    />
                                    Add Points
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="redeemed"
                                        checked={pointsForm.type === 'redeemed'}
                                        onChange={(e) => setPointsForm({ ...pointsForm, type: e.target.value })}
                                        className="mr-2"
                                    />
                                    Remove Points
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                            <input
                                type="number"
                                value={pointsForm.points}
                                onChange={(e) => setPointsForm({ ...pointsForm, points: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                value={pointsForm.reason}
                                onChange={(e) => setPointsForm({ ...pointsForm, reason: e.target.value })}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Reason for points adjustment..."
                                maxLength="200"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <Button
                            onClick={handlePointsUpdate}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Update Points
                        </Button>
                        <Button
                            onClick={() => {
                                setShowCustomerModal(false);
                                setSelectedCustomer(null);
                                setPointsForm({ points: '', reason: '', type: 'earned' });
                            }}
                            className="flex-1 bg-gray-900 hover:bg-gray-400 text-gray-700"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagementRewordPoint
