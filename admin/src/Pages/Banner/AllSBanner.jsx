import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData, serverURL } from '../../services/FetchNodeServices';

const AllSBanner = () => {
    const [banners, setBanners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setIsLoading(true);
                const response = await getData('api/banner');
                console.log("REASPONSE ALL BANNER", response)
                if (response?.success === true) {
                    setBanners(response?.data);
                } else {
                    toast.error("Failed to load banners");
                }
            } catch (error) {
                console.log('error', error)
                toast.error("An error occurred while fetching banners:-", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const data = await getData(`api/banner/delete/${id}`);
                console.log("REASPONSE ALL BANNER", data)
                if (data?.success === true) {
                    setBanners(banners.filter(banner => banner?._id !== id));
                    toast.success("Banner deleted successfully");
                } else {
                    toast.error("Banner deleted Failed");
                }

            }
        } catch (error) {
            toast.error("Failed to delete the banner");
        }
    };


    const handleCheckboxChange = async (e, bannerId) => {
        const updatedStatus = e.target.checked;

        try {
            const response = await postData('api/banner/change-status', {
                bannerId: bannerId,
                isActive: updatedStatus
            });

            if (response.success === true) {
                const updatedProducts = banners.map(banner => {
                    if (banner._id === bannerId) {
                        return { ...banner, isActive: updatedStatus };
                    }
                    return banner;
                });
                setBanners(updatedProducts);
                toast.success('Banner status updated successfully');
            }
        } catch (error) {
            toast.error("Error updating Banner status");
            console.error("Error updating Banner status:", error);
        }
    };

    const filteredBanners = banners.filter((banner) =>
        banner.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Banners</h4>
                </div>
                <div className="links">
                    <Link to="/add-banner" className="add-new">
                        Add New <i className="fa-solid fa-plus"></i>
                    </Link>
                </div>
            </div>


            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Sr.No.</th>
                            <th scope="col">Name</th>
                            <th scope="col">Image</th>
                            <th scope="col">Show in home page</th>
                            <th scope="col">Edit</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center">Loading...</td>
                            </tr>
                        ) : filteredBanners?.length > 0 ? (
                            filteredBanners?.map((banner, index) => (
                                <tr key={banner?._id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{banner?.name}</td>
                                    <td>
                                        <img
                                            src={`${banner?.images}`}
                                            alt={banner?.bannerName}
                                            style={{ width: '100px', height: 'auto' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={banner?.isActive}
                                            onChange={(e) => handleCheckboxChange(e, banner?._id)}
                                        />
                                    </td>
                                    <td>
                                        <Link to={`/edit-banner/${banner?._id}`} className="bt edit">
                                            Edit <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(banner?._id)}
                                            className="bt delete"
                                        >
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No banners found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllSBanner;
