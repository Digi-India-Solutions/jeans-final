import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData } from '../../services/FetchNodeServices';

const AllRewardPoint = () => {
    const navigate = useNavigate()
    const [rewards, setRewards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await getData('api/reward/get-All-rewards');
                if (response?.success) {
                    setRewards(response.rewards.reverse());
                } else {
                    toast.error(response.message || 'Failed to fetch rewards');
                }
            } catch (error) {
                console.error('Error fetching rewards:', error);
                toast.error('Server error while fetching rewards');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRewards();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirmDelete.isConfirmed) {
            try {
                const response = await getData(`api/reward/delete-rewards/${id}`);
                if (response.success) {
                    setRewards((prev) => prev.filter((r) => r._id !== id));
                    Swal.fire('Deleted!', 'Reward has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', response.message || 'Failed to delete reward.', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error!', 'Something went wrong.', 'error');
            }
        }
    };

    const handleCheckboxChange = async (e, rewardId) => {
        const newStatus = e.target.checked;

        try {
            const response = await postData('api/reward/change-status', { rewardId, status: newStatus, });

            if (response.success) {
                setRewards((prev) =>
                    prev.map((reward) =>
                        reward._id === rewardId ? { ...reward, status: newStatus } : reward
                    )
                );
                toast.success('Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Server error while updating status');
        }
    };

    if (isLoading) {
        return <p>Loading Rewards...</p>;
    }

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Reward Points</h4>
                </div>
                {/* <div className="links">
                    <Link to="/add-reward" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div> */}
            </div>

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Sr.No.</th>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>Points</th>
                            <th>Status</th>
                            <th>View Details</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.length > 0 ? (
                            rewards.map((reward, index) => (
                                <tr key={reward._id}>
                                    <td>{index + 1}</td>
                                    <td>{reward?.userId.name}</td>
                                    <td>{reward?.userId.email}</td>
                                    <td>{reward?.points}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={reward?.status}
                                            onChange={(e) => handleCheckboxChange(e, reward._id)}
                                        />
                                    </td>
                                    <td>
                                        {/* <Link to={`/View Details/${reward._id}`} className="bt edit"> */}
                                        <div className="bt edit" onClick={() => navigate(`/View-Details`, { state: { rewardId: reward } })} style={{ width: '80%' }}>
                                            View Details <i className="fa-solid fa-eye"></i>
                                        </div>
                                        {/* </Link> */}
                                    </td>
                                    <td>
                                        <button className="bt delete" onClick={() => handleDelete(reward._id)}>
                                            Delete <i className="fa-solid fa-trash"></i>
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
        </>
    );
};

export default AllRewardPoint;
