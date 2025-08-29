import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const AllRewardPoint = () => {
    const [rewards, setRewards] = useState([]);
    const [signUpReward, setSignUpReward] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ points: "", status: true });

    useEffect(() => {
        fetchRewards();
        fetchSignUpReward();
    }, []);

    // 🔹 Fetch All User Rewards
    const fetchRewards = async () => {
        try {
            const response = await getData("api/reward/get-All-rewards");
            if (response?.success) {
                setRewards(response.rewards.reverse());
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
            toast.error("Server error while fetching rewards");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Fetch SignUp Reward (only one record usually)
    const fetchSignUpReward = async () => {
        try {
            const response = await getData("api/reward/get-fist-time-signup-reward");
            if (response?.success) {
                setSignUpReward(response.data?.[0] || null);
                setFormData(response.data?.[0] || null)
            }
        } catch (error) {
            console.error("Signup reward fetch error:", error);
        }
    };

    // 🔹 Delete Reward
    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmDelete.isConfirmed) {
            try {
                const response = await getData(`api/reward/delete-rewards/${id}`);
                if (response.success) {
                    setRewards((prev) => prev.filter((r) => r._id !== id));
                    Swal.fire("Deleted!", "Reward has been deleted.", "success");
                } else {
                    Swal.fire("Error!", response.message || "Failed to delete reward.", "error");
                }
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error!", "Something went wrong.", "error");
            }
        }
    };

    // 🔹 Update Reward Status
    const handleCheckboxChange = async (e, rewardId) => {
        const newStatus = e.target.checked;
        try {
            const response = await postData("api/reward/change-status", {
                rewardId,
                status: newStatus,
            });

            if (response.success) {
                setRewards((prev) =>
                    prev.map((reward) =>
                        reward._id === rewardId ? { ...reward, status: newStatus } : reward
                    )
                );
                toast.success("Status updated successfully");
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Server error while updating status");
        }
    };

    // 🔹 Add or Update SignUp Reward
    const handleAddReward = async (e) => {
        e.preventDefault();
        try {
            const response = await postData("api/reward/add-fist-time-signup-reward", formData);
            if (response.success) {
                toast.success("Signup reward saved successfully");
                setShowModal(false);
                setFormData({ points: "", status: true });
                fetchSignUpReward();
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
        const id = formData?._id
        try {
            const response = await postData(`api/reward/update-fist-time-signup-reward/${id}`, formData);
            if (response.success) {
                toast.success("Signup reward updated successfully");
                setShowModal(false);
                setFormData({ points: "", status: true });
                fetchSignUpReward();
            } else {
                toast.error(response.message || "Failed to update reward");
            }
        } catch (error) {
            console.error("Add reward error:", error);
            toast.error("Server error while adding reward");
        }
    };

    // 🔹 Pagination logic
    const totalPages = Math.ceil(rewards.length / pageSize);
    const paginatedRewards = rewards.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    if (isLoading) {
        return <p style={{ textAlign: "center", padding: "20px" }}>⏳ Loading Rewards...</p>;
    }

    return (
        <>
            <ToastContainer />
            <div className="bread d-flex justify-content-between align-items-center mb-3">
                <h4>🎁 All Reward Points</h4>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    {signUpReward ? "Edit Signup Reward" : "Add Signup Reward"}{" "}
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>

            {/* 🔹 Show Signup Reward Info */}
            {signUpReward && (
                <div className="alert alert-info">
                    <strong>Signup Reward:</strong> {signUpReward.points} points (
                    {signUpReward.status ? "Active" : "Inactive"})
                </div>
            )}

            {/* 🔹 Rewards Table */}
            <section className="main-table">
                <table className="table table-bordered table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Sr.No.</th>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>Points</th>
                            <th>Status</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRewards.length > 0 ? (
                            paginatedRewards.map((reward, index) => (
                                <tr key={reward?._id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{reward?.userId?.name || "N/A"}</td>
                                    <td>{reward?.userId?.email || "N/A"}</td>
                                    <td>{reward?.points}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={reward?.status}
                                            onChange={(e) => handleCheckboxChange(e, reward?._id)}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(reward?._id)}
                                        >
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No Rewards Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* 🔹 Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    <label>Rows per page: </label>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[5, 10, 20].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <button
                        className="btn btn-sm btn-secondary me-2"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        ◀ Prev
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-secondary ms-2"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next ▶
                    </button>
                </div>
            </div>

            {/* 🔹 Signup Reward Modal */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content p-3">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {signUpReward ? "Edit Signup Reward" : "Add Signup Reward"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={signUpReward ? handleUpdateReward : handleAddReward}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label>Points</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.points}
                                            onChange={(e) =>
                                                setFormData({ ...formData, points: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={formData.status}
                                            onChange={(e) =>
                                                setFormData({ ...formData, status: e.target.checked })
                                            }
                                        />
                                        <label className="form-check-label">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllRewardPoint;
