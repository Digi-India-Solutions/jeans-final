import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData, serverURL } from '../../services/FetchNodeServices';
import { Parser } from 'html-to-react';
import { formatDate } from '../../constant';

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all reviews
    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                const response = await getData("api/review/get-all-review");
                // console.log("SSSSSSXXXXXXXSSSSSSS:--", response);
                if (response.success === true) {
                    setReviews(response?.reviews || []);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                toast.error("Failed to fetch reviews!");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    console.log("SSSSSSXXXXXXXSSSSSSS:--", reviews);

    // Handle review deletion
    const handleDelete = async (reviewId) => {
        const id = reviewId;
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (confirm.isConfirmed) {
            try {
                const data = await getData(`api/review/delete-reviews/${id}`);
                if (data.success === true) {
                    setReviews(reviews.filter(review => review._id !== reviewId));
                    toast.success("Review deleted successfully!");
                }
            } catch (error) {
                console.error("Error deleting review:", error);
                toast.error("Failed to delete review!");
            }
        }
    };

    // Handle checkbox change to update review status
    const handleCheckboxChange = async (e, reviewId) => {
        const updatedStatus = e.target.checked;

        try {
            const response = await postData('api/review/change-review-status', { reviewId: reviewId, status: updatedStatus });

            if (response.success === true) {
                const updatedReviews = reviews.map(review => {
                    if (review._id === reviewId) {
                        return { ...review, status: updatedStatus }; // Correctly update the review object
                    }
                    return review;
                });

                setReviews(updatedReviews); // Set the updated reviews state
                toast.success('Review status updated successfully');
            }
        } catch (error) {
            toast.error("Error updating review status");
            console.error("Error updating review status:", error);
        }
    };

    // Filter reviews based on search query
    // const filteredReviews = reviews?.filter((review) =>
    //     review?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    // );

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Reviews List</h4>
                </div>
            </div>

            {/* <div className="filteration">
                <div className="search">
                    <label htmlFor="search">Search</label> &nbsp;
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div> */}

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>S No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Product Name</th>
                            <th>Profile Image</th>
                            <th>Description</th>
                            <th>Show on HomePage</th>
                            <th>Rating</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : reviews.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No Reviews found.
                                </td>
                            </tr>
                        ) : (
                            reviews?.map((review, index) => (
                                <tr key={review._id}>
                                    <td>{index + 1}</td>
                                    <td>{review?.userId?.name}</td>
                                    <td>{review?.userId?.email}</td>
                                    <td>{review.productId?.productName}</td>
                                    <td>

                                        {review.images?.slice(0, 4).map((img, i) => (
                                            <img
                                                key={i}
                                                src={`${ img } `}
                                                alt="Prod."
                                                style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "5px" }}
                                            />
                                        ))}
                                    </td>
                                    <td>{review?.reviewText}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={review?.status}
                                            onChange={(e) => handleCheckboxChange(e, review?._id)}
                                        />
                                    </td>
                                    <td>{review?.rating} Star(s)</td>
                                    <td>{formatDate(review?.createdAt)}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(review._id)}
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

export default AllReviews;
