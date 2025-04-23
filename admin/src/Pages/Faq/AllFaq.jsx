import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData } from '../../services/FetchNodeServices';
import Swal from 'sweetalert2';

const AllFaq = () => {
    const [faqs, setFaqs] = useState([]);
    const navigate = useNavigate();

    const fetchFaqs = async () => {
        try {
            const res = await getData('api/faq/get-al-faq');
            console.log("XCXCXCXCXCX:---", res);
            if (res.success) {
                setFaqs(res.faqs);
            }
        } catch (error) {
            toast.error("Failed to fetch FAQs");
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const toggleStatus = async (id, newStatus) => {
        console.log("68076baa44807102e5c2d9ca-", id, newStatus);
        try {
            const respons = await postData(`api/faq/faq-status/${id}`, { isActive: newStatus });
            if (respons.success) {
                toast.success(`Marked as ${newStatus ? 'Active' : 'Inactive'}`);
                fetchFaqs();
            }

        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deleteFaq = async (id) => {

        try {
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
                    const res = await getData(`api/faq/delete-faq/${id}`);
                    if (res.success) {
                        toast.success("FAQ deleted successfully");
                        fetchFaqs();
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    Swal.fire('Error!', 'Something went wrong.', 'error');
                }
            }

        } catch (error) {
            toast.error("Failed to delete FAQ");
        }


    };

    return (
        <>
            <div className="bread">
                <div className="head">
                    <h4>All FAQs</h4>
                </div>
                <div className="links">
                    <Link to="/add-faq" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div>
            </div>

            <section className="mt-2 main-table table-responsive">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Answer</th>
                            <th>Status</th>
                            <th>Mark Active</th>
                            <th>Mark Inactive</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.length > 0 ? (
                            faqs.map(faq => (
                                <tr key={faq._id}>
                                    <td>{faq.question}</td>
                                    <td>{faq.answer}</td>
                                    <td>
                                        <span className={`badge ${faq.isActive ? 'bg-success' : 'bg-danger'}`}>
                                            {faq.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => toggleStatus(faq._id, true)}
                                            disabled={faq.isActive}
                                        >
                                            Activate
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => toggleStatus(faq._id, false)}
                                            disabled={!faq.isActive}
                                        >
                                            Deactivate
                                        </button>
                                    </td>
                                    <td style={{gap:5}}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => navigate(`/edit-faq/${faq._id}`)}
                                        >
                                            Edit <i className="fa-solid fa-trash"></i>
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteFaq(faq._id)}
                                        >
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No FAQs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
};

export default AllFaq;
