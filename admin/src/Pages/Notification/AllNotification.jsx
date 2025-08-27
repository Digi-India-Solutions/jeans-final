import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const AllNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteActionLoading, setDeleteActionLoading] = useState(null);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getData("api/notification/get-all-notification");
                console.log("SSSSSSXXXXXXXSSSSSSS:-->", response);
                if (response?.success) {
                    setNotifications(response?.data || []);
                }
            } catch (error) {
                toast.error("Error fetching notifications");
                console.error("Error fetching notifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Handle Delete
    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: "This notification will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmDelete.isConfirmed) {
            try {
                setDeleteActionLoading(id);
                const response = await getData(`api/notification/delete-notification/${id}`);
                if (response?.success) {
                    setNotifications((prev) => prev.filter((n) => n?._id !== id));
                    Swal.fire("Deleted!", "Notification has been deleted.", "success");
                }
            } catch (error) {
                Swal.fire("Error!", "There was an error deleting the notification.", "error");
                console.error("Error deleting notification:", error);
            } finally {
                setDeleteActionLoading(null);
            }
        }
    };

    // Handle Resend
    const handleResend = async (id) => {
        try {
            setActionLoading(id);
            const response = await getData(`api/notification/resend-notification/${id}`);
            if (response?.success) {
                toast.success(response?.message || "Notification resent successfully");
            } else {
                toast.error(response?.message || "Failed to resend notification");
            }
        } catch (error) {
            toast.error("Error resending notification");
            console.error("Error resending notification:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return <p>Loading Notifications...</p>;
    }

    return (
        <>
            <ToastContainer />
            <div className="bread d-flex justify-content-between align-items-center">
                <div className="head">
                    <h4>All Notifications</h4>
                </div>
                <div className="links">
                    <Link to="/add-notification" className="btn btn-primary">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div>
            </div>

            <section className="main-table mt-3">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Sr.No.</th>
                            <th>Title</th>
                            <th>Body</th>
                            <th>Image</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications?.length > 0 ? (
                            notifications.map((n, index) => (
                                <tr key={n._id}>
                                    <td>{index + 1}</td>
                                    <td>{n?.title}</td>
                                    <td>{n?.body}</td>
                                    <td>
                                        {n?.image && (
                                            <img src={n.image} alt="notification" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            disabled={actionLoading === n._id}
                                            onClick={() => handleResend(n._id)}
                                        >
                                            {actionLoading === n._id ? "Sending..." : "Resend"}
                                        </button>

                                        <Link to={`/edit-notification/${n?._id}`} className="btn btn-sm btn-info me-2">
                                            Edit <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>

                                        <button
                                            className="btn btn-sm btn-danger"
                                            disabled={deleteActionLoading === n._id}
                                            onClick={() => handleDelete(n?._id)}
                                        >
                                            {deleteActionLoading === n?._id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No Notifications Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllNotification;
