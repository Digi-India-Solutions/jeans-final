import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData } from '../../services/FetchNodeServices';

const AllOrder = () => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filterOption, setFilterOption] = useState('');

    // Fetch orders
    const fetchOrders = async () => {
        try {
            const response = await getData('api/order/get-all-orders');
            console.log('RESPONS:', response)
            if (response?.success === true) {
                setOrders(response?.orders);
                setFilteredOrders(response?.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders.");
        }
    };

    // Delete order
    const deleteOrder = async (orderId) => {
        try {
            const confirmation = await Swal.fire({
                title: 'Are you sure?',
                text: 'This action cannot be undone!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            });

            if (confirmation.isConfirmed) {
                const body = { orderId: orderId }
                const response = await postData(`api/order/order-delete/${orderId}`, body);
                if (response?.status === true) {
                    setOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
                    setFilteredOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
                    toast.success("Order deleted successfully.");
                }

            }
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error("Failed to delete order.");
        }
    };

    // Search orders
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = orders.filter(order =>
            order._id.toLowerCase().includes(query) ||
            order.shippingAddress.fullName.toLowerCase().includes(query)
        );
        setFilteredOrders(filtered);
    };

    // Filter orders based on selected option
    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Handle filtering by date range or status
    useEffect(() => {
        let filtered = [...orders];

        if (filterOption === 'today') {
            const today = new Date();
            filtered = filtered.filter(order => new Date(order.createdAt).toDateString() === today.toDateString());
        } else if (filterOption === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            filtered = filtered.filter(order => new Date(order.createdAt).toDateString() === yesterday.toDateString());
        } else if (filterOption === 'thisWeek') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            filtered = filtered.filter(order => new Date(order.createdAt) >= startOfWeek);
        } else if (filterOption === 'thisMonth') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            filtered = filtered.filter(order => new Date(order.createdAt) >= startOfMonth);
        } else if (filterOption === 'thisYear') {
            const startOfYear = new Date();
            startOfYear.setMonth(0, 1);
            filtered = filtered.filter(order => new Date(order.createdAt) >= startOfYear);
        }

        setFilteredOrders(filtered);
    }, [filterOption, orders]);

    return (
        <>
            <ToastContainer />
            <div className="bread">
                <div className="head">
                    <h4>All Orders</h4>
                </div>
            </div>

            {/* <div className="filteration">
                <div className="selects">
                    <select onChange={handleFilterChange} value={filterOption}>
                        <option value="">All Orders</option>
                        <option value="today">Today's Orders</option>
                        <option value="yesterday">Yesterday's Orders</option>
                        <option value="thisWeek">This Week's Orders</option>
                        <option value="thisMonth">This Month's Orders</option>
                        <option value="thisYear">This Year's Orders</option>
                    </select>
                </div>
                <div className="search">
                    <label htmlFor="search">Search</label>&nbsp;
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div> */}

            <section className="main-table">
                <table className="table table-bordered table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Sr.No.</th>
                            <th scope="col">Order ID</th>
                            <th scope="col">Items</th>
                            <th scope="col">Final Price</th>
                            <th scope="col">Order Status</th>
                            <th scope="col">Payment Mode</th>
                            <th scope="col">Payment Status</th>
                            <th scope="col">Order Date</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <tr key={order._id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>
                                        <Link to={`/order-details/${order._id}`}>{order._id}</Link>
                                    </td>
                                    <td>{order.products?.length}</td>
                                    <td>{order.totalAmount}</td>
                                    <td>{order.orderStatus}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>{order.paymentStatus}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link
                                            to={`/order-details/${order?._id}`}
                                            className="bt edit"
                                        >
                                            Order Details <i className="fa-solid fa-pen-to-square"></i>
                                        </Link>
                                        &nbsp;

                                        <button
                                            className="bt delete"
                                            onClick={() => deleteOrder(order?._id)}
                                        >
                                            Delete <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default AllOrder;
