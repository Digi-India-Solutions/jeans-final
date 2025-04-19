import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData, serverURL } from "../../services/FetchNodeServices";

const AllWishList = () => {
    const [wishList, setWishList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSizes = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await getData(`api/wishlist/get-all-size-with-pagination?pageNumber=${page}`);
            console.log("SSSSSSSS", response)
            if (response.success) {
                setWishList(response.data || []);
            } else {
                toast.error("No sizes found");
            }
        } catch (error) {
            toast.error(
                error.response ? error.response.data.message : "Error fetching sizes"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSizes();
    }, [currentPage]);

    const handleDelete = async (id) => {
        const confirmed = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmed.isConfirmed) {
            try {
                const response = await getData(`api/wishlist/delete-wishlist/${id}`);
                if (response?.success) {
                    toast.success(response.message);
                    setWishList((prev) => prev.filter((wishList) => wishList._id !== id));
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Error deleting size"
                );
            }
        }
    };

    // const handleStatusChange = async (e, wishListId) => {
    //     const updatedStatus = e.target.checked;

    //     try {
    //         const response = await postData("api/wishlist/change-status", {
    //             wishListId,
    //             status: updatedStatus,
    //         });

    //         if (response.success) {
    //             setWishList((prevWishList) =>
    //                 prevWishList.map((wishList) =>
    //                     wishList._id === wishListId ? { ...wishList, status: updatedStatus } : wishList
    //                 )
    //             );
    //             toast.success("wishList status updated");
    //         }
    //     } catch (error) {
    //         toast.error("Error updating status");
    //         console.error("Status error:", error);
    //     }
    // };
    console.log("XXXXXXXXXXX", wishList)

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Sizes</h4>
                </div>
                {/* <div className="links">
                    <Link to="/add-size" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div> */}
            </div>

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Sr.No.</th>
                            <th>Product Name</th>
                            <th>Product Image</th>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>Status</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : wishList.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No wishList available
                                </td>
                            </tr>
                        ) : (
                            wishList.map((wishList, index) => (
                                <tr key={wishList._id}>
                                    <td>{index + 1}</td>

                                    <td>{wishList?.productId?.productName}</td>
                                    <td>
                                        <img
                                            src={`${wishList?.productId?.images[0]}`}
                                            alt="Product"
                                            style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "5px" }}
                                        />
                                    </td>
                                    <td>{wishList?.userId?.name}</td>
                                    <td>{wishList?.userId?.email}</td>
                                    {/* <td>
                                        <input
                                            type="checkbox"
                                            checked={wishList?.status}
                                        // onChange={(e) => handleStatusChange(e, wishList._id)}
                                        />
                                    </td> */}
                                    <td>{wishList?.status === true ? "LIKE" : "UNLIKE"}</td>
                                    {/* <td>
                                        <Link to={`/edit-size/${wishList._id}`} className="bt edit">
                                            Edit <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>
                                    </td> */}
                                    <td>
                                        <button
                                            onClick={() => handleDelete(wishList._id)}
                                            className="bt delete"
                                        >
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllWishList;
