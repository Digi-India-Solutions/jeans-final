import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    verified: '',
    search: ''
  });
  const [filterDays, setFilterDays] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', status: true, password: '', street: '', city: '', state: '', zipCode: '', country: '', shopname: ''
  });

  const [otpData, setOtpData] = useState({    email: '',    otp: '',    countdown: 0  });

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Filter users
  const applyFilters = useCallback(() => {
    let filtered = allUsers;

    if (filters.status) {
      const statusFilter = filters.status === 'Active';
      filtered = filtered.filter(user => user.isActive === statusFilter);
    }

    if (filters.verified !== '') {
      const isVerified = filters.verified === 'true';
      filtered = filtered.filter(user => user.isUser === isVerified);
    }

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.phone && user.phone.includes(filters.search))
      );
    }

    setFilteredUsers(filtered);
  }, [filters, allUsers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: true,
      password: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      shopname: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.isActive || true,
      password: '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || '',
      shopname: user.shopname || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const sendOTP = async () => {
    if (!validateForm()) return;

    try {
      if (editingUser) {
        const updateData = {
          name: formData.name,
          email: formData.email,
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
          setShowModal(false);
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

          setShowModal(false);
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
      };

      const response = await postData("api/user/verify-otp-for-user-signup", userData);

      if (response?.status === true) {
        toast.success("User created successfully");
        setShowOTPModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }

    } catch (error) {
      toast.error("Error verifying OTP");
      console.error("Verify OTP error:", error);
    }
  };

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

  const deleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await getData(`api/user/delete-user/${userId}`);
        if (response.success) {
          toast.success("User deleted successfully");
          fetchUsers();
        } else {
          toast.error(response.message || "Failed to delete user");
        }
      } catch (error) {
        toast.error("Something went wrong!");
        console.error("Delete user error:", error);
      }
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const result = await Swal.fire({
      title: "Change Status?",
      text: `Mark user as ${currentStatus ? "Inactive" : "Active"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (result.isConfirmed) {
      try {
        const response = await getData(`api/user/toggle-status/${userId}`);
        if (response.success) {
          toast.success("User status updated");
          fetchUsers();
        } else {
          toast.error(response.message || "Failed to update status");
        }
      } catch (error) {
        toast.error("Could not update status");
        console.error("Toggle status error:", error);
      }
    }
  };

  const handleFilterChange = async (days) => {
    setFilterDays(days);
    if (!days) {
      setFilteredUsers(allUsers);
      return;
    }
    try {
      const response = await getData(`api/user/get-users-without-orders/${days}`);
      if (response.status === true) {
        setFilteredUsers(response?.data);
      } else {
        toast.error(response.message || "Could not fetch users");
      }
    } catch (error) {
      toast.error("Failed to apply filter");
      console.error("Filter users error:", error);
    }
  };

  const handleOrderClick = async () => {
    if (!filteredUsers.length) {
      return toast.warning("No users to notify.");
    }

    setLoading(true);
    const orderData = filteredUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      status: user.status,
      createdAt: user.createdAt,
    }));

    try {
      const response = await postData("api/user/bulk-order-notification", orderData);
      if (response.success) {
        toast.success(response.message || "Notifications sent successfully");
      } else {
        toast.error(response.message || "Failed to send notifications");
      }
    } catch (error) {
      toast.error("Failed to send notifications");
      console.error("Bulk notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    return `${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}`;
  };

  const fetchOrdersAndSpent = async () => {
    try {
      const response = await getData('api/order/get-all-orders');
      console.log('RESPONS:=>', response)
      if (response?.success === true) {
        setOrders(response?.orders);
        // setFilteredOrders(response?.orders);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Fetch users error:", error);
    }
  }
  useEffect(() => {
    fetchOrdersAndSpent();
  }, [])

  const OrdersAndSpent = (userId) => {
    // Filter orders by user
    const userOrders = orders.filter(order => order?.userId?._id === userId);

    // Count orders
    const orderCount = userOrders.length;

    // Calculate total spent (assuming order.totalPrice exists)
    const totalSpent = userOrders.reduce((sum, order) => sum + (order?.recivedAmount || 0), 0);

    // Return JSX for display
    return (

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="font-medium text-gray-900">{orderCount} orders</div>
        <div className="text-green-600 font-semibold">₹{totalSpent?.toLocaleString()}</div>
      </td>

      // <div className="flex flex-col space-y-1">
      //   <span className="text-xs font-semibold text-gray-800">
      //     Orders: {orderCount}
      //   </span>
      //   <span className="text-xs font-semibold text-green-600">
      //     Spent: ₹{totalSpent}
      //   </span>
      // </div>
    );
  };

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and profiles</p>
          </div>
          <div className='flex space-x-2'>
            <Button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <i className="ri-user-add-line"></i>
              <span>Add User</span>
            </Button>

            <Button
              onClick={handleOrderClick}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              disabled={loading || filteredUsers.length === 0}
            >
              <i className="ri-notification-line"></i>
              <span>{loading ? 'Sending...' : 'Send Notifications'}</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Orders</label>
                <div className="relative">
                  <select
                    value={filterDays}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Users</option>
                    <option value="30">No orders in 30 days</option>
                    <option value="60">No orders in 60 days</option>
                    <option value="90">No orders in 90 days</option>
                    <option value="120">No orders in 120 days</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total User</label>
                <input
                  type="text"
                  value={allUsers?.length || 0}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-100"
                />
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders & Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {user?.photo ? (
                                <img src={user?.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <i className="ri-user-line text-gray-500"></i>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {user.name}
                                {user.isUser && (
                                  <i className="ri-verified-badge-fill text-blue-500 ml-2"></i>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user?.uniqueUserId || user._id}</div>
                              {user.shopname && (
                                <div className="text-sm text-gray-500">Shop: {user?.shopname}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user?.email}</div>
                          <div className="text-sm text-gray-500">{user?.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {formatAddress(user?.address)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                              {OrdersAndSpent(user?._id)}
                            </span>
                          </div>
                        </td> */}
                        {OrdersAndSpent(user?._id)}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(user)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => toggleStatus(user._id, user.isActive)}
                              className={`text-xs px-2 py-1 ${user.isActive
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            )}
          </>
        )}

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
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

                  {!editingUser && (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => setShowModal(false)}
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
    </AdminLayout>
  );
}