import { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import { getData, postData } from '../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

export default function CreateUserModels({ showUserModal, setShowUserModal, fetchCustomers }) {
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);
    // const [loading, setLoading] = useState(false);
    // const [orders, setOrders] = useState([]);
    // const [filters, setFilters] = useState({ status: '', verified: '', search: '' });
    // const [filterDays, setFilterDays] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', status: true, password: '', street: '', city: '', state: '', zipCode: '', country: '', shopname: ''
    });

    const [otpData, setOtpData] = useState({ email: '', otp: '', countdown: 0 });

    // Fetch all users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // setIsLoading(true);
        try {
            const response = await getData("api/user/get-all-user");
            if (response.success) {
                setAllUsers(response.data);
                setUsers(response.data);
                setFilteredUsers(response.data);
            } else {
                toast.error(response.message || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("Unable to fetch users");
            console.error("Fetch users error:", error);
        } finally {
            // setIsLoading(false);
        }
    };

    // Filter users
    // const applyFilters = useCallback(() => {
    //     let filtered = allUsers;

    //     if (filters.status) {
    //         const statusFilter = filters.status === 'Active';
    //         filtered = filtered.filter(user => user.isActive === statusFilter);
    //     }

    //     if (filters.verified !== '') {
    //         const isVerified = filters.verified === 'true';
    //         filtered = filtered.filter(user => user.isUser === isVerified);
    //     }

    //     if (filters.search) {
    //         filtered = filtered.filter(user =>
    //             user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    //             user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    //             (user.phone && user.phone.includes(filters.search))
    //         );
    //     }

    //     setFilteredUsers(filtered);
    // }, [filters, allUsers]);

    // useEffect(() => {
    //     applyFilters();
    // }, [applyFilters]);

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";

        if (!editingUser && !formData.password) errors.password = "Password is required";
        else if (!editingUser && formData.password.length < 6) errors.password = "Password must be at least 6 characters";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // const handleAdd = () => {
    //     setEditingUser(null);
    //     setFormData({
    //         name: '',
    //         email: '',
    //         phone: '',
    //         status: true,
    //         password: '',
    //         street: '',
    //         city: '',
    //         state: '',
    //         zipCode: '',
    //         country: '',
    //         shopname: ''
    //     });
    //     setFormErrors({});
    //     setShowUserModal(true);
    // };

    // const handleEdit = (user) => {
    //     setEditingUser(user);
    //     setFormData({
    //         name: user.name || '',
    //         email: user.email || '',
    //         phone: user.phone || '',
    //         status: user.isActive || true,
    //         password: '',
    //         street: user.address?.street || '',
    //         city: user.address?.city || '',
    //         state: user.address?.state || '',
    //         zipCode: user.address?.zipCode || '',
    //         country: user.address?.country || '',
    //         shopname: user.shopname || ''
    //     });
    //     setFormErrors({});
    //     setShowUserModal(true);
    // };

    const sendOTP = async () => {
        if (!validateForm()) return;

        try {
            if (editingUser) {
                const updateData = {
                    name: formData.name,
                    email: formData.email.toLowerCase(),
                    phone: formData.phone,
                    shopname: formData.shopname,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                    isActive: formData.status
                };

                // Choose the appropriate API endpoint based on whether we're updating a photo
                const endpoint = editingUser.photo ?
                    `api/user/update-user-with-photo/${editingUser._id}` :
                    `api/user/update-user/${editingUser._id}`;

                const response = await postData(endpoint, updateData);

                if (response?.status) {
                    toast.success("User updated successfully");
                    setShowUserModal(false);
                    fetchUsers();
                } else {
                    toast.error(response.message || "Failed to update user");
                }
            } else {
                const response = await postData("api/user/send-otp-for-user-signup", {
                    email: formData.email
                });

                if (response.success) {
                    setOtpData({
                        email: formData.email,
                        otp: '',
                        countdown: 60
                    });

                    // Start countdown
                    const timer = setInterval(() => {
                        setOtpData(prev => {
                            if (prev.countdown <= 1) {
                                clearInterval(timer);
                                return { ...prev, countdown: 0 };
                            }
                            return { ...prev, countdown: prev.countdown - 1 };
                        });
                    }, 1000);

                    setShowUserModal(false);
                    setShowOTPModal(true);
                    toast.success("OTP sent successfully");
                } else {
                    toast.error(response.message || "Failed to send OTP");
                }
            }

        } catch (error) {
            toast.error("Error sending OTP");
            console.error("Send OTP error:", error);
        }
    };

    const verifyOTP = async () => {
        if (!otpData.otp || otpData.otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        try {
            // For new user creation
            const userData = {
                fullName: formData.name,
                email: formData.email,
                mobile: formData.phone,
                otp: otpData.otp,
                password: formData.password,
                address: {
                    street: formData.password,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                }

            };

            const response = await postData("api/user/verify-otp-for-user-signup", userData);

            if (response?.status === true) {
                toast.success("User created successfully");
                setShowOTPModal(false);
                fetchUsers();
                fetchCustomers()
            } else {
                toast.error(response.message || "Failed to create user");
            }

        } catch (error) {
            toast.error("Error verifying OTP");
            console.error("Verify OTP error:", error);
        }
    };
    console.log("GGGGG:==>", formData)
    const resendOTP = async () => {
        if (otpData.countdown > 0) return;

        try {
            const response = await postData("api/user/send-otp-for-user-signup", {
                email: otpData.email
            });

            if (response.success) {
                setOtpData(prev => ({ ...prev, countdown: 60 }));
                toast.success("OTP resent successfully");
            } else {
                toast.error(response.message || "Failed to resend OTP");
            }
        } catch (error) {
            toast.error("Error resending OTP");
            console.error("Resend OTP error:", error);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="p-6">
                {/* Add/Edit User Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                        {editingUser ? 'Edit User' : 'Add New User'}
                                    </h2>
                                    <button
                                        onClick={() => setShowUserModal(false)}
                                        className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                        <input
                                            type="text"
                                            value={formData.shopname}
                                            onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* {!editingUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                placeholder="Enter password for new user"
                                            />
                                            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                                        </div>
                                    )} */}
                                    {!editingUser && (
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Password *
                                            </label>

                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, password: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                placeholder="Enter password for new user"
                                            />

                                            {/* Toggle Button */}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500"
                                            >
                                                {showPassword ? (
                                                    <i className="ri-eye-off-line text-xl"></i>
                                                ) : (
                                                    <i className="ri-eye-line text-xl"></i>
                                                )}
                                            </button>

                                            {formErrors.password && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                            >
                                                <option value={true}>Active</option>
                                                <option value={false}>Inactive</option>
                                            </select>
                                            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Address Information</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                        <input
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div> */}
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <Button
                                        onClick={() => setShowUserModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={sendOTP}
                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {editingUser ? 'Send OTP' : 'Create User'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTP Verification Modal */}
                {showOTPModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Email Verification</h2>
                                    <button
                                        onClick={() => setShowOTPModal(false)}
                                        className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="ri-mail-line text-2xl text-blue-600"></i>
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        We've sent a verification code to
                                    </p>
                                    <p className="font-medium text-gray-900">{otpData.email}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit OTP</label>
                                        <input
                                            type="text"
                                            value={otpData.otp}
                                            onChange={(e) => setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                                            maxLength="6"
                                            placeholder="000000"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="text-center">
                                        {otpData.countdown > 0 ? (
                                            <p className="text-sm text-gray-500">
                                                Resend OTP in {otpData.countdown} seconds
                                            </p>
                                        ) : (
                                            <button
                                                onClick={resendOTP}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <Button
                                        onClick={() => setShowOTPModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={verifyOTP}
                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={otpData.otp.length !== 6}
                                    >
                                        Verify & {editingUser ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}