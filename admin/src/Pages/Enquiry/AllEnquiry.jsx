import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData } from '../../services/FetchNodeServices';

const AllEnquiry = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    // const itemsPerPage = 10;

    const fetchEnquiries = async () => {
        setIsLoading(true);
        try {
            // const response = await getData(`api/enquiry/get-all-enquiries?pageNumber=${pageNumber}`);
            const response = await getData(`api/enquiry/get_all_enquiry_list`);
            console.log('response:', response);

            if (response?.status === true) {
                setEnquiries(response.data || []);
                // setTotalPages(response.totalPages || 1);
            } 
        } catch (error) {
            toast.error('Error fetching enquiries');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [pageNumber]);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "This will delete the enquiry permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirm.isConfirmed) {
            try {
                const response = await getData(`api/enquiry/delete-enquiry/${id}`);
                if (response.success) {
                    setEnquiries(enquiries.filter(item => item._id !== id));
                    toast.success('Enquiry deleted');
                } else {
                    toast.error('Failed to delete enquiry');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Error deleting enquiry');
            }
        }
    };

    const handleNext = () => {
        if (pageNumber < totalPages) setPageNumber(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (pageNumber > 1) setPageNumber(prev => prev - 1);
    };

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Enquiries</h4>
                </div>
                <div className="links">
                    <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>

            {isLoading ? (
                <p>Loading enquiries...</p>
            ) : (
                <section className="main-table">
                    <table className="table table-bordered table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>User Name</th>
                                <th>Enquiry Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Location</th>
                                <th>Message</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enquiries.length > 0 ? (
                                enquiries.map((enquiry, index) => (
                                    <tr key={enquiry._id}>
                                        {/* <td>{(pageNumber - 1) * itemsPerPage + index + 1}</td> */}
                                        <td>{index + 1}</td>
                                        <td>{enquiry.userId?.name || 'N/A'}</td>
                                        <td>{enquiry.name}</td>
                                        <td>{enquiry.phone}</td>
                                        <td>{enquiry.email}</td>
                                        <td>{enquiry.p_location}</td>
                                        <td>{enquiry.message}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(enquiry?._id)}
                                            >
                                                Delete <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">No enquiries found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {/* <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%'}}>
                        <div className="pagination-controls mt-3 d-flex justify-content-between align-items-center" style={{ width: '30%' }} >
                            <button
                                onClick={handlePrevious}
                                disabled={pageNumber === 1}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                            <span>
                                Page {pageNumber} of {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={pageNumber === totalPages}
                                className="btn btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    </div> */}
                </section>
            )}
        </>
    );
};

export default AllEnquiry;
