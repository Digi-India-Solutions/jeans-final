import React from 'react'
import Button from '../../../../components/base/Button';
import { postData } from '../../../../services/FetchNodeServices';
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageSingupReward({ setShowRewardModal, editingReward, showRewardModal, fetchSignUpReward, setRewardForm, rewardForm, setEditingReward, signUpReward, setSignUpReward }) {

    const handleAddReward = async (e) => {
        e.preventDefault();
        try {
            const response = await postData("api/reward/add-fist-time-signup-reward", signUpReward);
            if (response.success) {
                toast.success("Signup reward saved successfully");
                setShowRewardModal(false);
                fetchSignUpReward()
            } else {
                toast.error(response.message || "Failed to save reward");
            }
        } catch (error) {
            console.error("Add reward error:", error);
            toast.error("Server error while adding reward");
        }
    };

    const handleUpdateReward = async (e) => {
        e.preventDefault();
        const id = signUpReward?._id
        try {
            const response = await postData(`api/reward/update-fist-time-signup-reward/${id}`, signUpReward);
            if (response.success) {
                toast.success("Signup reward updated successfully");
                setShowRewardModal(false);
                fetchSignUpReward()
            } else {
                toast.error(response.message || "Failed to update reward");
            }
        } catch (error) {
            console.error("Add reward error:", error);
            toast.error("Server error while adding reward");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-lg font-semibold mb-4">
                    {editingReward ? 'Edit Signup Reward' : 'Edit Signup Reward'}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edit Point</label>
                        <input
                            type="text"
                            value={signUpReward?.points}
                            onChange={(e) => setSignUpReward({ ...signUpReward, points: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex space-x-3 mt-6">
                    <Button
                        onClick={signUpReward ? handleUpdateReward : handleAddReward}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {signUpReward ? 'Update' : 'Create'}
                    </Button>
                    <Button
                        onClick={() => {
                            setShowRewardModal(false);
                            setRewardForm({ name: '', pointsCost: '', type: 'Discount', value: '', description: '', validDays: '', status: 'Active' });
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ManageSingupReward
