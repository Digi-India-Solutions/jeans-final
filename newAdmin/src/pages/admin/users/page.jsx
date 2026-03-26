// import { useState, useEffect, useCallback, useRef } from 'react';
// import AdminLayout from '../../../components/feature/AdminLayout';
// import Card from '../../../components/base/Card';
// import Button from '../../../components/base/Button';
// import { getData, postData } from '../../../services/FetchNodeServices';
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';

// export default function UsersManagement() {
//   const [users, setUsers] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [orders, setOrders] = useState([]);
//   const [filters, setFilters] = useState({ status: '', verified: '', search: '' });
//   const [filterDays, setFilterDays] = useState('');
//   const [formErrors, setFormErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [showExcelModal, setShowExcelModal] = useState(false);
//   const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: true, password: '', street: '', city: '', state: '', zipCode: '', country: '', shopname: '' });

//   const [otpData, setOtpData] = useState({ email: '', otp: '', countdown: 0 });

//   // Excel upload state
//   const [excelFile, setExcelFile] = useState(null);
//   const [excelPreview, setExcelPreview] = useState([]);
//   const [excelErrors, setExcelErrors] = useState([]);
//   const [isUploadingExcel, setIsUploadingExcel] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef(null);

//   // Fetch all users on mount
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     setIsLoading(true);
//     try {
//       const response = await getData("api/user/get-all-user");
//       if (response.success) {
//         setAllUsers(response.data);
//         setUsers(response.data);
//         setFilteredUsers(response.data);
//       } else {
//         toast.error(response.message || "Failed to fetch users");
//       }
//     } catch (error) {
//       toast.error("Unable to fetch users");
//       console.error("Fetch users error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Filter users
//   const applyFilters = useCallback(() => {
//     let filtered = allUsers;

//     if (filters.status) {
//       const statusFilter = filters.status === 'Active';
//       filtered = filtered.filter(user => user.isActive === statusFilter);
//     }

//     if (filters.verified !== '') {
//       const isVerified = filters.verified === 'true';
//       filtered = filtered.filter(user => user.isUser === isVerified);
//     }

//     if (filters.search) {
//       filtered = filtered.filter(user =>
//         user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
//         user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
//         (user.phone && user.phone.includes(filters.search))
//       );
//     }

//     setFilteredUsers(filtered);
//   }, [filters, allUsers]);

//   useEffect(() => {
//     applyFilters();
//   }, [applyFilters]);

//   const validateForm = () => {
//     const errors = {};

//     if (!formData.name.trim()) errors.name = "Name is required";
//     if (!formData.email.trim()) errors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";

//     if (!editingUser && !formData.password) errors.password = "Password is required";
//     else if (!editingUser && formData.password.length < 6) errors.password = "Password must be at least 6 characters";

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleAdd = () => {
//     setEditingUser(null);
//     setFormData({
//       name: '',
//       email: '',
//       phone: '',
//       status: true,
//       password: '',
//       street: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: '',
//       shopname: ''
//     });
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const handleEdit = (user) => {
//     setEditingUser(user);
//     setFormData({
//       name: user.name || '',
//       email: user.email || '',
//       phone: user.phone || '',
//       status: user.isActive || true,
//       password: '',
//       street: user.address?.street || '',
//       city: user.address?.city || '',
//       state: user.address?.state || '',
//       zipCode: user.address?.zipCode || '',
//       country: user.address?.country || '',
//       shopname: user.shopname || ''
//     });
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const sendOTP = async () => {
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       if (editingUser) {
//         const updateData = {
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           shopname: formData.shopname,
//           street: formData.street,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//           country: formData.country,
//           isActive: formData.status
//         };

//         // Choose the appropriate API endpoint based on whether we're updating a photo
//         const endpoint = editingUser.photo ?
//           `api/user/update-user-with-photo/${editingUser._id}` :
//           `api/user/update-user/${editingUser._id}`;

//         const response = await postData(endpoint, updateData);

//         if (response?.status) {
//           toast.success("User updated successfully");
//           setLoading(false);
//           setShowModal(false);
//           fetchUsers();
//         } else {
//           setLoading(false);
//           toast.error(response.message || "Failed to update user");
//         }
//       } else {
//         const response = await postData("api/user/send-otp-for-user-signup", {
//           email: formData.email
//         });

//         if (response.success) {
//           setOtpData({
//             email: formData.email,
//             otp: '',
//             countdown: 60
//           });
//           setLoading(false);
//           // Start countdown
//           const timer = setInterval(() => {
//             setOtpData(prev => {
//               if (prev.countdown <= 1) {
//                 clearInterval(timer);
//                 return { ...prev, countdown: 0 };
//               }
//               return { ...prev, countdown: prev.countdown - 1 };
//             });
//           }, 1000);

//           setShowModal(false);
//           setShowOTPModal(true);
//           toast.success("OTP sent successfully");
//           setLoading(false);
//         } else {
//           toast.error(response.message || "Failed to send OTP");
//           setLoading(false);
//         }
//       }
//       setLoading(false);
//     } catch (error) {
//       toast.error("Error sending OTP");
//       setLoading(false);
//       console.error("Send OTP error:", error);
//     }
//   };

//   const verifyOTP = async () => {
//     if (!otpData.otp || otpData.otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }
//     try {
//       // For new user creation
//       const userData = {
//         fullName: formData.name,
//         email: formData.email,
//         mobile: formData.phone,
//         otp: otpData.otp,
//         password: formData.password,
//         address: {
//           street: formData.password,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//           country: formData.country,
//         }
//       };

//       const response = await postData("api/user/verify-otp-for-user-signup", userData);

//       if (response?.status === true) {
//         toast.success("User created successfully");
//         setShowOTPModal(false);
//         fetchUsers();
//       } else {
//         toast.error(response.message || "Failed to create user");
//       }

//     } catch (error) {
//       toast.error("Error verifying OTP");
//       console.error("Verify OTP error:", error);
//     }
//   };

//   const resendOTP = async () => {
//     if (otpData.countdown > 0) return;

//     try {
//       const response = await postData("api/user/send-otp-for-user-signup", {
//         email: otpData.email
//       });

//       if (response.success) {
//         setOtpData(prev => ({ ...prev, countdown: 60 }));
//         toast.success("OTP resent successfully");
//       } else {
//         toast.error(response.message || "Failed to resend OTP");
//       }
//     } catch (error) {
//       toast.error("Error resending OTP");
//       console.error("Resend OTP error:", error);
//     }
//   };

//   const deleteUser = async (userId) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to recover this user!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await getData(`api/user/delete-user/${userId}`);
//         if (response.success) {
//           toast.success("User deleted successfully");
//           fetchUsers();
//         } else {
//           toast.error(response.message || "Failed to delete user");
//         }
//       } catch (error) {
//         toast.error("Something went wrong!");
//         console.error("Delete user error:", error);
//       }
//     }
//   };

//   const toggleStatus = async (userId, currentStatus) => {
//     const result = await Swal.fire({
//       title: "Change Status?",
//       text: `Mark user as ${currentStatus ? "Inactive" : "Active"}?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, change it",
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await getData(`api/user/toggle-status/${userId}`);
//         if (response.success) {
//           toast.success("User status updated");
//           fetchUsers();
//         } else {
//           toast.error(response.message || "Failed to update status");
//         }
//       } catch (error) {
//         toast.error("Could not update status");
//         console.error("Toggle status error:", error);
//       }
//     }
//   };

//   const handleFilterChange = async (days) => {
//     setFilterDays(days);
//     if (!days) {
//       setFilteredUsers(allUsers);
//       return;
//     }
//     try {
//       const response = await getData(`api/user/get-users-without-orders/${days}`);
//       if (response.status === true) {
//         setFilteredUsers(response?.data);
//       } else {
//         toast.error(response.message || "Could not fetch users");
//       }
//     } catch (error) {
//       toast.error("Failed to apply filter");
//       console.error("Filter users error:", error);
//     }
//   };

//   const handleOrderClick = async () => {
//     if (!filteredUsers.length) {
//       return toast.warning("No users to notify.");
//     }

//     setLoading(true);
//     const orderData = filteredUsers.map((user) => ({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
//       status: user.status,
//       createdAt: user.createdAt,
//     }));

//     try {
//       const response = await postData("api/user/bulk-order-notification", orderData);
//       if (response.success) {
//         toast.success(response.message || "Notifications sent successfully");
//       } else {
//         toast.error(response.message || "Failed to send notifications");
//       }
//     } catch (error) {
//       toast.error("Failed to send notifications");
//       console.error("Bulk notification error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     return status
//       ? 'bg-green-100 text-green-800'
//       : 'bg-red-100 text-red-800';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatAddress = (address) => {
//     if (!address) return 'No address';
//     return `${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}`;
//   };

//   const fetchOrdersAndSpent = async () => {
//     try {
//       const response = await getData('api/order/get-all-Admin-orders');
//       console.log('RESPONS:=>', response)
//       if (response?.success === true) {
//         setOrders(response?.orders);
//         // setFilteredOrders(response?.orders);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch users");
//       console.error("Fetch users error:", error);
//     }
//   }
//   useEffect(() => {
//     fetchOrdersAndSpent();
//   }, [])

//   const OrdersAndSpent = (userId) => {
//     // Filter orders by user
//     const userOrders = orders.filter(order => order?.customer?.userId?._id === userId);
//     // console.log('RESPONS:=>', userOrders)
//     // Count orders
//     const orderCount = userOrders.length;

//     // Calculate total spent (assuming order.totalPrice exists)
//     const totalSpent = userOrders.reduce((sum, order) => sum + (order?.total || 0), 0);

//     // Return JSX for display
//     return (

//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//         <div className="font-medium text-gray-900">{orderCount} orders</div>
//         <div className="text-green-600 font-semibold">₹{totalSpent?.toLocaleString()}</div>
//       </td>

//       // <div className="flex flex-col space-y-1">
//       //   <span className="text-xs font-semibold text-gray-800">
//       //     Orders: {orderCount}
//       //   </span>
//       //   <span className="text-xs font-semibold text-green-600">
//       //     Spent: ₹{totalSpent}
//       //   </span>
//       // </div>
//     );
//   };


//   const findColumnValue = (row, headers, fieldKeys) => {
//     for (const key of fieldKeys) {
//       const matchedHeader = headers.find(h => h.toLowerCase().trim() === key.toLowerCase());
//       if (matchedHeader && row[matchedHeader] !== undefined && row[matchedHeader] !== '') {
//         return String(row[matchedHeader]).trim();
//       }
//     }
//     return '';
//   };

//   const parseExcelData = (data, headers) => {
//     const parsed = [];
//     const errors = [];

//     data.forEach((row, index) => {
//       const rowNum = index + 2; // +2 because row 1 is header
//       const user = {
//         name: findColumnValue(row, headers, EXCEL_COLUMNS.name),
//         email: findColumnValue(row, headers, EXCEL_COLUMNS.email),
//         phone: findColumnValue(row, headers, EXCEL_COLUMNS.phone),
//         shopname: findColumnValue(row, headers, EXCEL_COLUMNS.shopname),
//         password: findColumnValue(row, headers, EXCEL_COLUMNS.password),
//         street: findColumnValue(row, headers, EXCEL_COLUMNS.street),
//         city: findColumnValue(row, headers, EXCEL_COLUMNS.city),
//         state: findColumnValue(row, headers, EXCEL_COLUMNS.state),
//         zipCode: findColumnValue(row, headers, EXCEL_COLUMNS.zipCode),
//         country: findColumnValue(row, headers, EXCEL_COLUMNS.country),
//         rowNum,
//         _status: 'pending', // pending | success | error
//         _error: '',
//       };

//       const rowErrors = [];
//       if (!user.name) rowErrors.push('Name is required');
//       if (!user.email) rowErrors.push('Email is required');
//       else if (!/\S+@\S+\.\S+/.test(user.email)) rowErrors.push('Email is invalid');
//       if (!user.password) rowErrors.push('Password is required');
//       else if (user.password.length < 6) rowErrors.push('Password must be at least 6 chars');

//       if (rowErrors.length > 0) {
//         user._status = 'error';
//         user._error = rowErrors.join(', ');
//         errors.push({ row: rowNum, errors: rowErrors });
//       }
//       parsed.push(user);
//     });

//     return { parsed, errors };
//   };


//   const handleExcelFileChange = (file) => {
//     if (!file) return;
//     const ext = file.name.split('.').pop().toLowerCase();
//     if (!['xlsx', 'xls', 'csv'].includes(ext)) {
//       toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
//       return;
//     }
//     setExcelFile(file);
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const workbook = XLSX.read(e.target.result, { type: 'binary' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
//         if (!rawData.length) { toast.error("Excel file is empty"); return; }
//         const headers = Object.keys(rawData[0]);
//         const { parsed, errors } = parseExcelData(rawData, headers);
//         setExcelPreview(parsed);
//         setExcelErrors(errors);
//         setUploadProgress({ current: 0, total: parsed.length, success: 0, failed: 0 });
//       } catch (err) {
//         toast.error("Failed to read Excel file. Please check the format.");
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     handleExcelFileChange(file);
//   };

//   const downloadSampleExcel = () => {
//     const sampleData = [
//       {
//         'Name': 'John Doe',
//         'Email': 'john@example.com',
//         'Phone': '9876543210',
//         'Password': 'pass123',
//         'Shop Name': 'John Store',
//         'Street': '123 Main St',
//         'City': 'Mumbai',
//         'State': 'Maharashtra',
//         'Zipcode': '400001',
//         'Country': 'India',
//       },
//       {
//         'Name': 'Jane Smith',
//         'Email': 'jane@example.com',
//         'Phone': '9876543211',
//         'Password': 'pass456',
//         'Shop Name': 'Jane Boutique',
//         'Street': '456 Park Ave',
//         'City': 'Delhi',
//         'State': 'Delhi',
//         'Zipcode': '110001',
//         'Country': 'India',
//       },
//     ];
//     const ws = XLSX.utils.json_to_sheet(sampleData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Users');
//     XLSX.writeFile(wb, 'sample_users_upload.xlsx');
//   };


//   const resetExcelModal = () => {
//     setExcelFile(null);
//     setExcelPreview([]);
//     setExcelErrors([]);
//     setUploadProgress({ current: 0, total: 0, success: 0, failed: 0 });
//     setIsUploadingExcel(false);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };


//   const handlesubmitExel = () => {
//     resetExcelModal();
//     setShowExcelModal(true);
//   };

//   return (
//     <AdminLayout>
//       <ToastContainer />
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
//             <p className="text-gray-600 mt-1">Manage customer accounts and profiles</p>
//           </div>
//           <div className='flex space-x-2'>

//             <Button
//               onClick={handlesubmitExel}
//               className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
//             >
//               <i className="ri-file-excel-line"></i>
//               <span>Bulk Upload (Excel)</span>
//             </Button>

//             <Button
//               onClick={handleAdd}
//               className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
//             >
//               <i className="ri-user-add-line"></i>
//               <span>Add User</span>
//             </Button>

//             <Button
//               onClick={handleOrderClick}
//               className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
//               disabled={loading || filteredUsers.length === 0}
//             >
//               <i className="ri-notification-line"></i>
//               <span>{loading ? 'Sending...' : 'Send Notifications'}</span>
//             </Button>
//           </div>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6">
//           <div className="p-4">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//                 <input
//                   type="text"
//                   placeholder="Name, email, phone..."
//                   value={filters.search}
//                   onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <div className="relative">
//                   <select
//                     value={filters.status}
//                     onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                     className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
//                   >
//                     <option value="">All Status</option>
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                   </select>
//                   <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Orders</label>
//                 <div className="relative">
//                   <select
//                     value={filterDays}
//                     onChange={(e) => handleFilterChange(e.target.value)}
//                     className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
//                   >
//                     <option value="">All Users</option>
//                     <option value="30">No orders in 30 days</option>
//                     <option value="60">No orders in 60 days</option>
//                     <option value="90">No orders in 90 days</option>
//                     <option value="120">No orders in 120 days</option>
//                   </select>
//                   <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Total User</label>
//                 <input
//                   type="text"
//                   value={allUsers?.length || 0}
//                   readOnly
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-100"
//                 />
//               </div>
//             </div>
//           </div>
//         </Card>

//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Users Table */}
//             <Card className="overflow-hidden">
//               <div className="overflow-x-auto">
//                 <div className="inline-block min-w-full">
//                   {/* vertical scroll area for tbody; thead will be sticky relative to this container */}
//                   <div className="max-h-[400px] overflow-y-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             User Details
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Contact
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Address
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Status
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Join Date
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Orders & Spent
//                           </th>
//                           <th className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {filteredUsers.map(user => (
//                           <tr key={user._id} className="hover:bg-gray-50">
//                             <td className="px-0 py-2 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
//                                   {user?.photo ? (
//                                     <img src={user?.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
//                                   ) : (
//                                     <i className="ri-user-line text-gray-500"></i>
//                                   )}
//                                 </div>
//                                 <div className="ml-3">
//                                   <div className="text-sm font-medium text-gray-900 flex items-center">
//                                     {user.name}
//                                     {user.isUser && (
//                                       <i className="ri-verified-badge-fill text-blue-500 ml-2"></i>
//                                     )}
//                                   </div>
//                                   <div className="text-sm text-gray-500">ID: {user?.uniqueUserId || user._id}</div>
//                                   {user.shopname && (
//                                     <div className="text-sm text-gray-500">Shop: {user?.shopname}</div>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-900">{user?.email}</div>
//                               <div className="text-sm text-gray-500">{user?.phone || 'No phone'}</div>
//                             </td>
//                             <td className="px-3 py-4">
//                               <div className="text-sm text-gray-500 max-w-xs truncate">
//                                 {formatAddress(user?.address)}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex flex-col space-y-1">
//                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
//                                   {user.isActive ? 'Active' : 'Inactive'}
//                                 </span>
//                               </div>
//                             </td>

//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatDate(user.createdAt)}
//                             </td>

//                             {OrdersAndSpent(user?._id)}
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                               <div className="flex space-x-2">
//                                 <Button
//                                   onClick={() => handleEdit(user)}
//                                   className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
//                                 >
//                                   Edit
//                                 </Button>
//                                 <Button
//                                   onClick={() => toggleStatus(user._id, user.isActive)}
//                                   className={`text-xs px-2 py-1 ${user.isActive
//                                     ? 'bg-red-50 text-red-600 hover:bg-red-100'
//                                     : 'bg-green-50 text-green-600 hover:bg-green-100'
//                                     }`}
//                                 >
//                                   {user.isActive ? 'Deactivate' : 'Activate'}
//                                 </Button>
//                                 <Button
//                                   onClick={() => deleteUser(user._id)}
//                                   className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
//                                 >
//                                   Delete
//                                 </Button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </Card>

//             {filteredUsers.length === 0 && !isLoading && (
//               <div className="text-center py-12">
//                 <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
//                 <p className="text-gray-500">No users found matching your criteria</p>
//               </div>
//             )}
//           </>
//         )}

//         {/* Add/Edit User Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold">
//                     {editingUser ? 'Edit User' : 'Add New User'}
//                   </h2>
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                   >
//                     <i className="ri-close-line"></i>
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                     {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                     {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                     <input
//                       type="tel"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
//                     <input
//                       type="text"
//                       value={formData.shopname}
//                       onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   {!editingUser && (
//                     <div className="relative">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Password *
//                       </label>

//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={formData.password}
//                         onChange={(e) =>
//                           setFormData({ ...formData, password: e.target.value })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         required
//                         placeholder="Enter password for new user"
//                       />

//                       {/* Toggle Button */}
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500"
//                       >
//                         {showPassword ? (
//                           <i className="ri-eye-off-line text-xl"></i>
//                         ) : (
//                           <i className="ri-eye-line text-xl"></i>
//                         )}
//                       </button>

//                       {formErrors.password && (
//                         <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
//                       )}
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                     <div className="relative">
//                       <select
//                         value={formData.status}
//                         onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
//                         className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                       >
//                         <option value={true}>Active</option>
//                         <option value={false}>Inactive</option>
//                       </select>
//                       <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                     </div>
//                   </div>

//                   <div className="md:col-span-2">
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">Address Information</h3>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
//                     <input
//                       type="text"
//                       value={formData.street}
//                       onChange={(e) => setFormData({ ...formData, street: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                     <input
//                       type="text"
//                       value={formData.city}
//                       onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                     <input
//                       type="text"
//                       value={formData.state}
//                       onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
//                     <input
//                       type="text"
//                       value={formData.zipCode}
//                       onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//                     <input
//                       type="text"
//                       value={formData.country}
//                       onChange={(e) => setFormData({ ...formData, country: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div> */}
//                 </div>

//                 <div className="flex space-x-3 mt-6">
//                   <Button
//                     onClick={() => setShowModal(false)}
//                     className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={sendOTP}
//                     className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//                   >
//                     {editingUser ? loading ? 'Updating...' : 'Update User' : loading ? 'Creating...' : 'Create User'}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* OTP Verification Modal */}
//         {showOTPModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-md w-full">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold">Email Verification</h2>
//                   <button
//                     onClick={() => setShowOTPModal(false)}
//                     className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                   >
//                     <i className="ri-close-line"></i>
//                   </button>
//                 </div>

//                 <div className="text-center mb-6">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <i className="ri-mail-line text-2xl text-blue-600"></i>
//                   </div>
//                   <p className="text-gray-600 mb-2">
//                     We've sent a verification code to
//                   </p>
//                   <p className="font-medium text-gray-900">{otpData.email}</p>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit OTP</label>
//                     <input
//                       type="text"
//                       value={otpData.otp}
//                       onChange={(e) => setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
//                       className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
//                       maxLength="6"
//                       placeholder="000000"
//                       autoComplete="off"
//                     />
//                   </div>

//                   <div className="text-center">
//                     {otpData.countdown > 0 ? (
//                       <p className="text-sm text-gray-500">
//                         Resend OTP in {otpData.countdown} seconds
//                       </p>
//                     ) : (
//                       <button
//                         onClick={resendOTP}
//                         className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         Resend OTP
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex space-x-3 mt-6">
//                   <Button
//                     onClick={() => setShowOTPModal(false)}
//                     className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={verifyOTP}
//                     className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//                     disabled={otpData.otp.length !== 6}
//                   >
//                     Verify & {editingUser ? loading ? 'Updating...' : 'Update' : loading ? 'Creating...' : 'Create'}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Excel Bulk Upload Modal ───────────────────────────────────────── */}
//         {showExcelModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
//               <div className="p-6">
//                 {/* Modal Header */}
//                 <div className="flex justify-between items-center mb-6">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Users</h2>
//                     <p className="text-gray-500 text-sm mt-1">Upload an Excel file to create multiple users at once</p>
//                   </div>
//                   <button onClick={() => { setShowExcelModal(false); resetExcelModal(); }}
//                     className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
//                     <i className="ri-close-line text-2xl"></i>
//                   </button>
//                 </div>

//                 {/* Download Sample & Instructions */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
//                   <div className="flex items-start justify-between flex-wrap gap-3">
//                     <div>
//                       <h3 className="font-semibold text-blue-800 mb-1">📋 Required Columns</h3>
//                       <p className="text-blue-700 text-sm">
//                         <strong>Required:</strong> Name, Email, Password &nbsp;|&nbsp;
//                         <strong>Optional:</strong> Phone, Shop Name, Street, City, State, Zipcode, Country
//                       </p>
//                       <p className="text-blue-600 text-xs mt-1">Column headers are case-insensitive. Download the sample to see the exact format.</p>
//                     </div>
//                     <button
//                       onClick={downloadSampleExcel}
//                       className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
//                     >
//                       <i className="ri-download-line"></i>
//                       <span>Download Sample</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Drag & Drop Upload Area */}
//                 {!excelPreview.length && (
//                   <div
//                     className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-5 ${isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
//                     onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
//                     onDragLeave={() => setIsDragging(false)}
//                     onDrop={handleDrop}
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <i className="ri-file-excel-line text-3xl text-emerald-600"></i>
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-700 mb-1">
//                       {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
//                     </h3>
//                     <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
//                     <span className="inline-block bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">
//                       Browse File
//                     </span>
//                     <p className="text-gray-400 text-xs mt-3">Supports .xlsx, .xls, .csv</p>
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept=".xlsx,.xls,.csv"
//                       className="hidden"
//                       onChange={(e) => handleExcelFileChange(e.target.files[0])}
//                     />
//                   </div>
//                 )}

//                 {/* File Selected Info */}
//                 {excelFile && excelPreview.length > 0 && (
//                   <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
//                     <div className="flex items-center space-x-3">
//                       <i className="ri-file-excel-line text-emerald-600 text-2xl"></i>
//                       <div>
//                         <p className="font-medium text-gray-800 text-sm">{excelFile.name}</p>
//                         <p className="text-gray-500 text-xs">{excelPreview.length} rows found</p>
//                       </div>
//                     </div>
//                     <button onClick={resetExcelModal} className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1">
//                       <i className="ri-delete-bin-line"></i>
//                       <span>Remove</span>
//                     </button>
//                   </div>
//                 )}

//                 {/* Summary Stats */}
//                 {excelPreview.length > 0 && (
//                   <div className="grid grid-cols-3 gap-3 mb-4">
//                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
//                       <div className="text-2xl font-bold text-blue-700">{excelPreview.length}</div>
//                       <div className="text-xs text-blue-600 font-medium">Total Rows</div>
//                     </div>
//                     <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
//                       <div className="text-2xl font-bold text-green-700">{validCount}</div>
//                       <div className="text-xs text-green-600 font-medium">Valid Users</div>
//                     </div>
//                     <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
//                       <div className="text-2xl font-bold text-red-700">{errorCount}</div>
//                       <div className="text-xs text-red-600 font-medium">Rows with Errors</div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Upload Progress */}
//                 {isUploadingExcel && (
//                   <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm font-medium text-gray-700">
//                         Uploading... {uploadProgress.current} / {uploadProgress.total}
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         ✅ {uploadProgress.success} &nbsp; ❌ {uploadProgress.failed}
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div
//                         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                         style={{ width: `${uploadProgress.total ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Preview Table */}
//                 {excelPreview.length > 0 && (
//                   <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
//                     <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
//                       <h3 className="font-semibold text-gray-700 text-sm">Preview ({excelPreview.length} users)</h3>
//                     </div>
//                     <div className="overflow-x-auto max-h-64 overflow-y-auto">
//                       <table className="min-w-full text-sm">
//                         <thead className="bg-gray-100 sticky top-0">
//                           <tr>
//                             {['#', 'Status', 'Name', 'Email', 'Phone', 'Shop', 'City', 'State', 'Error'].map(h => (
//                               <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                           {excelPreview.map((user, idx) => (
//                             <tr key={idx} className={`
//                               ${user._status === 'success' ? 'bg-green-50' : ''}
//                               ${user._status === 'error' ? 'bg-red-50' : ''}
//                               ${user._status === 'uploading' ? 'bg-blue-50' : ''}
//                             `}>
//                               <td className="px-3 py-2 text-gray-500">{user.rowNum}</td>
//                               <td className="px-3 py-2">{getRowStatusIcon(user._status)}</td>
//                               <td className="px-3 py-2 font-medium text-gray-800">{user.name || <span className="text-red-400 italic">missing</span>}</td>
//                               <td className="px-3 py-2 text-gray-600">{user.email || <span className="text-red-400 italic">missing</span>}</td>
//                               <td className="px-3 py-2 text-gray-500">{user.phone || '–'}</td>
//                               <td className="px-3 py-2 text-gray-500">{user.shopname || '–'}</td>
//                               <td className="px-3 py-2 text-gray-500">{user.city || '–'}</td>
//                               <td className="px-3 py-2 text-gray-500">{user.state || '–'}</td>
//                               <td className="px-3 py-2 text-red-500 text-xs max-w-xs">{user._error || ''}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex space-x-3">
//                   <Button
//                     onClick={() => { setShowExcelModal(false); resetExcelModal(); }}
//                     className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     disabled={isUploadingExcel}
//                   >
//                     Cancel
//                   </Button>
//                   {!excelPreview.length ? (
//                     <Button
//                       onClick={() => fileInputRef.current?.click()}
//                       className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
//                     >
//                       <i className="ri-upload-line mr-2"></i> Select File
//                     </Button>
//                   ) : (
//                     <Button
//                       onClick={handleExcelSubmit}
//                       className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
//                       disabled={isUploadingExcel || validCount === 0}
//                     >
//                       {isUploadingExcel
//                         ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
//                         : `Upload ${validCount} Valid Users`}
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </AdminLayout>
//   );
// }

import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import { getData, postData } from '../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


// ─── Pagination Component ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onLimitChange }) {
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && totalItems <= 10) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-gray-100 rounded-b-lg">
      {/* Left — count + per-page */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          Showing{' '}
          <span className="font-semibold text-gray-900">{from}–{to}</span>
          {' '}of{' '}
          <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span>
          {' '}users
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Right — page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="First">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Prev */}
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* First + ellipsis */}
        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100">1</button>
            {startPage > 2 && <span className="px-1 text-gray-400 text-sm select-none">…</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map(n => (
          <button key={n} onClick={() => onPageChange(n)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${n === currentPage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
            {n}
          </button>
        ))}

        {/* Ellipsis + last */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-gray-400 text-sm select-none">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100">{totalPages}</button>
          </>
        )}

        {/* Next */}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last */}
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Last">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        {/* Jump-to */}
        <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-gray-200">
          <span className="text-sm text-gray-500 whitespace-nowrap">Go to</span>
          <input
            type="number" min={1} max={totalPages}
            key={currentPage}
            defaultValue={currentPage}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const v = Math.max(1, Math.min(totalPages, Number(e.target.value)));
              if (v !== currentPage) onPageChange(v);
            }}
            className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}


export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', verified: '', search: '' });
  const [filterDays, setFilterDays] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', status: true, password: '',
    street: '', city: '', state: '', zipCode: '', country: '', shopname: ''
  });
  const [otpData, setOtpData] = useState({ email: '', otp: '', countdown: 0 });

  // Excel upload state
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreview, setExcelPreview] = useState([]);
  const [excelErrors, setExcelErrors] = useState([]);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Derived values — no extra state needed
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * itemsPerPage;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + itemsPerPage);

  // Required Excel columns mapping
  const EXCEL_COLUMNS = {
    name: ['name', 'full name', 'fullname', 'customer name', 'Customer Organization'],
    email: ['email', 'email address', 'emailaddress'],
    phone: ['phone', 'mobile', 'mobile number', 'phone number', 'contact', 'Contact Person'],
    shopname: ['shop', 'shopname', 'shop name', 'store name', ''],
    password: ['password', 'pass'],
    street: ['street', 'address', 'street address'],
    city: ['city'],
    state: ['state'],
    zipCode: ['zipcode', 'zip', 'pincode', 'pin code', 'postal code'],
    country: ['country'],
  };

  useEffect(() => { fetchUsers(); }, []);

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
    } finally {
      setIsLoading(false);
    }
  };
  // ─── Pagination handlers ───────────────────────────────────────────────────
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };
 const handleLimitChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };
  
  const applyFilters = useCallback(() => {
    let filtered = allUsers;
    if (filters.status) {
      filtered = filtered.filter(user => user.isActive === (filters.status === 'Active'));
    }
    if (filters.verified !== '') {
      filtered = filtered.filter(user => user.isUser === (filters.verified === 'true'));
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

  useEffect(() => { applyFilters(); }, [applyFilters]);

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
    setFormData({ name: '', email: '', phone: '', status: true, password: '', street: '', city: '', state: '', zipCode: '', country: '', shopname: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.isActive !== undefined ? user.isActive : true,
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
    setLoading(true);
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
        const endpoint = editingUser.photo
          ? `api/user/update-user-with-photo/${editingUser._id}`
          : `api/user/update-user/${editingUser._id}`;
        const response = await postData(endpoint, updateData);
        if (response?.status) {
          toast.success("User updated successfully");
          setShowModal(false);
          fetchUsers();
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        const response = await postData("api/user/send-otp-for-user-signup", { email: formData.email });
        if (response.success) {
          setOtpData({ email: formData.email, otp: '', countdown: 60 });
          const timer = setInterval(() => {
            setOtpData(prev => {
              if (prev.countdown <= 1) { clearInterval(timer); return { ...prev, countdown: 0 }; }
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
      toast.error("Error processing request");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpData.otp || otpData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const userData = {
        fullName: formData.name,
        email: formData.email,
        mobile: formData.phone,
        otp: otpData.otp,
        password: formData.password,
        address: {
          street: formData.street, // FIX: was formData.password (bug)
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
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  const resendOTP = async () => {
    if (otpData.countdown > 0) return;
    try {
      const response = await postData("api/user/send-otp-for-user-signup", { email: otpData.email });
      if (response.success) {
        setOtpData(prev => ({ ...prev, countdown: 60 }));
        const timer = setInterval(() => {
          setOtpData(prev => {
            if (prev.countdown <= 1) { clearInterval(timer); return { ...prev, countdown: 0 }; }
            return { ...prev, countdown: prev.countdown - 1 };
          });
        }, 1000);
        toast.success("OTP resent successfully");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Error resending OTP");
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
      }
    }
  };

  const handleFilterChange = async (days) => {
    setFilterDays(days);
    if (!days) { setFilteredUsers(allUsers); return; }
    try {
      const response = await getData(`api/user/get-users-without-orders/${days}`);
      if (response.status === true) {
        setFilteredUsers(response?.data);
      } else {
        toast.error(response.message || "Could not fetch users");
      }
    } catch (error) {
      toast.error("Failed to apply filter");
    }
  };

  const handleOrderClick = async () => {
    if (!filteredUsers.length) return toast.warning("No users to notify.");
    setLoading(true);
    const orderData = filteredUsers.map((user) => ({
      _id: user._id, name: user.name, email: user.email, phone: user.phone,
      address: user.address, status: user.status, createdAt: user.createdAt,
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
    } finally {
      setLoading(false);
    }
  };

  // ─── EXCEL UPLOAD FUNCTIONS ──────────────────────────────────────────────────

  // Find column value by multiple possible header names
  const findColumnValue = (row, headers, fieldKeys) => {
    for (const key of fieldKeys) {
      const matchedHeader = headers.find(h => h.toLowerCase().trim() === key.toLowerCase());
      if (matchedHeader && row[matchedHeader] !== undefined && row[matchedHeader] !== '') {
        return String(row[matchedHeader]).trim();
      }
    }
    return '';
  };

  const parseExcelData = (data, headers) => {
    const parsed = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because row 1 is header
      const user = {
        name: findColumnValue(row, headers, EXCEL_COLUMNS.name),
        email: findColumnValue(row, headers, EXCEL_COLUMNS.email),
        phone: findColumnValue(row, headers, EXCEL_COLUMNS.phone),
        shopname: findColumnValue(row, headers, EXCEL_COLUMNS.shopname),
        password: findColumnValue(row, headers, EXCEL_COLUMNS.password),
        street: findColumnValue(row, headers, EXCEL_COLUMNS.street),
        city: findColumnValue(row, headers, EXCEL_COLUMNS.city),
        state: findColumnValue(row, headers, EXCEL_COLUMNS.state),
        zipCode: findColumnValue(row, headers, EXCEL_COLUMNS.zipCode),
        country: findColumnValue(row, headers, EXCEL_COLUMNS.country),
        rowNum,
        _status: 'pending', // pending | success | error
        _error: '',
      };

      const rowErrors = [];
      if (!user.name) rowErrors.push('Name is required');
      if (!user.email) rowErrors.push('Email is required');
      else if (!/\S+@\S+\.\S+/.test(user.email)) rowErrors.push('Email is invalid');
      if (!user.password) rowErrors.push('Password is required');
      else if (user.password.length < 6) rowErrors.push('Password must be at least 6 chars');

      if (rowErrors.length > 0) {
        user._status = 'error';
        user._error = rowErrors.join(', ');
        errors.push({ row: rowNum, errors: rowErrors });
      }
      parsed.push(user);
    });

    return { parsed, errors };
  };

  const handleExcelFileChange = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      return;
    }
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (!rawData.length) { toast.error("Excel file is empty"); return; }
        const headers = Object.keys(rawData[0]);
        const { parsed, errors } = parseExcelData(rawData, headers);
        setExcelPreview(parsed);
        setExcelErrors(errors);
        setUploadProgress({ current: 0, total: parsed.length, success: 0, failed: 0 });
      } catch (err) {
        toast.error("Failed to read Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleExcelFileChange(file);
  };

  // const handleExcelSubmit = async () => {
  //   const validUsers = excelPreview.filter(u => u._status !== 'error');
  //   if (!validUsers.length) {
  //     toast.error("No valid users to upload");
  //     return;
  //   }
  //   setIsUploadingExcel(true);
  //   setUploadProgress({ current: 0, total: validUsers.length, success: 0, failed: 0 });

  //   let successCount = 0;
  //   let failedCount = 0;

  //   // Update preview to show processing
  //   setExcelPreview(prev => prev.map(u =>
  //     u._status !== 'error' ? { ...u, _status: 'uploading' } : u
  //   ));

  //   for (let i = 0; i < validUsers.length; i++) {
  //     const user = validUsers[i];
  //     try {
  //       // Step 1: Send OTP
  //       const otpRes = await postData("api/user/send-otp-for-user-signup", { email: user.email });

  //       if (!otpRes.success) {
  //         failedCount++;
  //         setExcelPreview(prev => prev.map(u =>
  //           u.rowNum === user.rowNum ? { ...u, _status: 'error', _error: otpRes.message || 'Failed to send OTP' } : u
  //         ));
  //       } else {
  //         // For bulk upload we use a different direct-create endpoint if available
  //         // Otherwise try bulk-create endpoint
  //         const createPayload = {
  //           fullName: user.name,
  //           email: user.email,
  //           mobile: user.phone,
  //           password: user.password,
  //           shopname: user.shopname,
  //           address: {
  //             street: user.street,
  //             city: user.city,
  //             state: user.state,
  //             zipCode: user.zipCode,
  //             country: user.country,
  //           }
  //         };

  //         // Try bulk/direct create endpoint first
  //         const createRes = await postData("api/user/admin-create-user", createPayload);

  //         if (createRes?.status === true || createRes?.success === true) {
  //           successCount++;
  //           setExcelPreview(prev => prev.map(u =>
  //             u.rowNum === user.rowNum ? { ...u, _status: 'success' } : u
  //           ));
  //         } else {
  //           failedCount++;
  //           setExcelPreview(prev => prev.map(u =>
  //             u.rowNum === user.rowNum ? { ...u, _status: 'error', _error: createRes?.message || 'Failed to create' } : u
  //           ));
  //         }
  //       }
  //     } catch (err) {
  //       failedCount++;
  //       setExcelPreview(prev => prev.map(u =>
  //         u.rowNum === user.rowNum ? { ...u, _status: 'error', _error: 'Network error' } : u
  //       ));
  //     }

  //     setUploadProgress(prev => ({
  //       ...prev,
  //       current: i + 1,
  //       success: successCount,
  //       failed: failedCount,
  //     }));

  //     // Small delay to avoid API rate limiting
  //     await new Promise(resolve => setTimeout(resolve, 300));
  //   }

  //   setIsUploadingExcel(false);
  //   if (successCount > 0) {
  //     toast.success(`✅ ${successCount} users created successfully!`);
  //     fetchUsers();
  //   }
  //   if (failedCount > 0) {
  //     toast.error(`❌ ${failedCount} users failed to create`);
  //   }
  // };


  const handleExcelSubmit = async () => {
    const validUsers = excelPreview.filter(u => u._status !== 'error');
    if (!validUsers.length) { toast.error("No valid users to upload"); return; }

    const CHUNK_SIZE = 500;           // match backend CHUNK_SIZE
    const totalChunks = Math.ceil(validUsers.length / CHUNK_SIZE);

    setIsUploadingExcel(true);
    setUploadProgress({ current: 0, total: validUsers.length, success: 0, failed: 0 });

    let totalSuccess = 0;
    let totalFailed = 0;

    for (let i = 0; i < validUsers.length; i += CHUNK_SIZE) {
      const chunk = validUsers.slice(i, i + CHUNK_SIZE);
      const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;

      try {
        const response = await postData("api/user/bulk-create-users", { users: chunk });

        const inserted = response?.totalInserted ?? 0;
        const failed = response?.totalFailed ?? 0;

        totalSuccess += inserted;
        totalFailed += failed;

        setUploadProgress(prev => ({
          current: Math.min(i + CHUNK_SIZE, validUsers.length),
          total: validUsers.length,
          success: totalSuccess,
          failed: totalFailed,
        }));

        // Mark rows in preview table
        if (response?.errors?.length) {
          const failedEmails = new Set(response.errors.map(e => e.email));
          setExcelPreview(prev => prev.map(u =>
            failedEmails.has(u.email)
              ? { ...u, _status: 'error', _error: response.errors.find(e => e.email === u.email)?.errors?.join(', ') }
              : u.rowNum >= (i + 2) && u.rowNum <= (i + CHUNK_SIZE + 1) && u._status !== 'error'
                ? { ...u, _status: 'success' }
                : u
          ));
        } else {
          // Whole chunk succeeded
          const rowStart = i + 2;
          const rowEnd = i + CHUNK_SIZE + 1;
          setExcelPreview(prev => prev.map(u =>
            u.rowNum >= rowStart && u.rowNum <= rowEnd && u._status !== 'error'
              ? { ...u, _status: 'success' }
              : u
          ));
        }

        toast.info(`Chunk ${chunkNum}/${totalChunks} done — ${inserted} inserted`);

      } catch (err) {
        totalFailed += chunk.length;
        toast.error(`Chunk ${chunkNum} failed: ${err.message}`);
      }
    }

    setIsUploadingExcel(false);

    if (totalSuccess > 0) toast.success(`✅ ${totalSuccess.toLocaleString()} users created`);
    if (totalFailed > 0) toast.error(`❌ ${totalFailed.toLocaleString()} failed`);
    if (totalSuccess > 0) fetchUsers();
  };


  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '9876543210',
        'Password': 'pass123',
        'Shop Name': 'John Store',
        'Street': '123 Main St',
        'City': 'Mumbai',
        'State': 'Maharashtra',
        'Zipcode': '400001',
        'Country': 'India',
      },
      {
        'Name': 'Jane Smith',
        'Email': 'jane@example.com',
        'Phone': '9876543211',
        'Password': 'pass456',
        'Shop Name': 'Jane Boutique',
        'Street': '456 Park Ave',
        'City': 'Delhi',
        'State': 'Delhi',
        'Zipcode': '110001',
        'Country': 'India',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'sample_users_upload.xlsx');
  };

  const resetExcelModal = () => {
    setExcelFile(null);
    setExcelPreview([]);
    setExcelErrors([]);
    setUploadProgress({ current: 0, total: 0, success: 0, failed: 0 });
    setIsUploadingExcel(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlesubmitExel = () => {
    resetExcelModal();
    setShowExcelModal(true);
  };

  // ─── ORDERS ──────────────────────────────────────────────────────────────────

  const fetchOrdersAndSpent = async () => {
    try {
      const response = await getData('api/order/get-all-Admin-orders');
      if (response?.success === true) setOrders(response?.orders);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => { fetchOrdersAndSpent(); }, []);

  const OrdersAndSpent = (userId) => {
    const userOrders = orders.filter(order => order?.customer?.userId?._id === userId);
    const orderCount = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order?.total || 0), 0);
    return (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="font-medium text-gray-900">{orderCount} orders</div>
        <div className="text-green-600 font-semibold">₹{totalSpent?.toLocaleString()}</div>
      </td>
    );
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  const getStatusColor = (status) => status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    return [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(', ');
  };

  const getRowStatusIcon = (status) => {
    if (status === 'success') return <span className="text-green-600 font-bold">✓</span>;
    if (status === 'error') return <span className="text-red-500 font-bold">✗</span>;
    if (status === 'uploading') return <span className="text-blue-500 animate-spin inline-block">⟳</span>;
    return <span className="text-gray-400">–</span>;
  };

  const validCount = excelPreview.filter(u => u._status !== 'error').length;
  const errorCount = excelPreview.filter(u => u._status === 'error').length;

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and profiles</p>
          </div>
          <div className="flex space-x-2 flex-wrap gap-y-2">
            <Button
              onClick={handlesubmitExel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
            >
              <i className="ri-file-excel-line"></i>
              <span>Bulk Upload (Excel)</span>
            </Button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Users</label>
                <input
                  type="text"
                  value={allUsers?.length || 0}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-default"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['User Details', 'Contact', 'Address', 'Status', 'Join Date', 'Orders & Spent', 'Actions'].map(h => (
                            <th key={h} className="sticky top-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pagedUsers.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-0 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  {user?.photo ? (
                                    <img src={user?.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    <i className="ri-user-line text-gray-500"></i>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 flex items-center">
                                    {user.name}
                                    {user.isUser && <i className="ri-verified-badge-fill text-blue-500 ml-2"></i>}
                                  </div>
                                  <div className="text-sm text-gray-500">ID: {user?.uniqueUserId || user._id}</div>
                                  {user.shopname && <div className="text-sm text-gray-500">Shop: {user?.shopname}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user?.email}</div>
                              <div className="text-sm text-gray-500">{user?.phone || 'No phone'}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">{formatAddress(user?.address)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            {OrdersAndSpent(user?._id)}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button onClick={() => handleEdit(user)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1">Edit</Button>
                                <Button
                                  onClick={() => toggleStatus(user._id, user.isActive)}
                                  className={`text-xs px-2 py-1 ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button onClick={() => deleteUser(user._id)} className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1">Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </Card>

            {pagedUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            )}
          </>
        )}

        {/* ── Add/Edit User Modal ───────────────────────────────────────────── */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input type="text" value={formData.shopname} onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  {!editingUser && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter password for new user"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-500">
                        <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-xl`}></i>
                      </button>
                      {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Address Information</h3>
                  </div>
                  {[
                    { label: 'Street', key: 'street' },
                    { label: 'City', key: 'city' },
                    { label: 'State', key: 'state' },
                    { label: 'Zip Code', key: 'zipCode' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type="text" value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Button>
                  <Button onClick={sendOTP} className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
                    {editingUser ? (loading ? 'Updating...' : 'Update User') : (loading ? 'Creating...' : 'Create User')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OTP Modal ────────────────────────────────────────────────────────── */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Email Verification</h2>
                  <button onClick={() => setShowOTPModal(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-mail-line text-2xl text-blue-600"></i>
                  </div>
                  <p className="text-gray-600 mb-2">We've sent a verification code to</p>
                  <p className="font-medium text-gray-900">{otpData.email}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      value={otpData.otp}
                      onChange={(e) => setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-widest"
                      maxLength="6"
                      placeholder="000000"
                      autoComplete="off"
                    />
                  </div>
                  <div className="text-center">
                    {otpData.countdown > 0 ? (
                      <p className="text-sm text-gray-500">Resend OTP in {otpData.countdown} seconds</p>
                    ) : (
                      <button onClick={resendOTP} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Resend OTP</button>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button onClick={() => setShowOTPModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Button>
                  <Button onClick={verifyOTP} className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={otpData.otp.length !== 6}>
                    Verify & Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Excel Bulk Upload Modal ───────────────────────────────────────── */}
        {showExcelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Users</h2>
                    <p className="text-gray-500 text-sm mt-1">Upload an Excel file to create multiple users at once</p>
                  </div>
                  <button onClick={() => { setShowExcelModal(false); resetExcelModal(); }}
                    className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                {/* Download Sample & Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">📋 Required Columns</h3>
                      <p className="text-blue-700 text-sm">
                        <strong>Required:</strong> Name, Email, Password &nbsp;|&nbsp;
                        <strong>Optional:</strong> Phone, Shop Name, Street, City, State, Zipcode, Country
                      </p>
                      <p className="text-blue-600 text-xs mt-1">Column headers are case-insensitive. Download the sample to see the exact format.</p>
                    </div>
                    <button
                      onClick={downloadSampleExcel}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                    >
                      <i className="ri-download-line"></i>
                      <span>Download Sample</span>
                    </button>
                  </div>
                </div>

                {/* Drag & Drop Upload Area */}
                {!excelPreview.length && (
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-5 ${isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-file-excel-line text-3xl text-emerald-600"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                    <span className="inline-block bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Browse File
                    </span>
                    <p className="text-gray-400 text-xs mt-3">Supports .xlsx, .xls, .csv</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => handleExcelFileChange(e.target.files[0])}
                    />
                  </div>
                )}

                {/* File Selected Info */}
                {excelFile && excelPreview.length > 0 && (
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <i className="ri-file-excel-line text-emerald-600 text-2xl"></i>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{excelFile.name}</p>
                        <p className="text-gray-500 text-xs">{excelPreview.length} rows found</p>
                      </div>
                    </div>
                    <button onClick={resetExcelModal} className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1">
                      <i className="ri-delete-bin-line"></i>
                      <span>Remove</span>
                    </button>
                  </div>
                )}

                {/* Summary Stats */}
                {excelPreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">{excelPreview.length}</div>
                      <div className="text-xs text-blue-600 font-medium">Total Rows</div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{validCount}</div>
                      <div className="text-xs text-green-600 font-medium">Valid Users</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-700">{errorCount}</div>
                      <div className="text-xs text-red-600 font-medium">Rows with Errors</div>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploadingExcel && (
                  <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Uploading... {uploadProgress.current} / {uploadProgress.total}
                      </span>
                      <span className="text-sm text-gray-500">
                        ✅ {uploadProgress.success} &nbsp; ❌ {uploadProgress.failed}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.total ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Preview Table */}
                {excelPreview.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-700 text-sm">Preview ({excelPreview.length} users)</h3>
                    </div>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {['#', 'Status', 'Name', 'Email', 'Phone', 'Shop', 'City', 'State', 'Error'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {excelPreview.map((user, idx) => (
                            <tr key={idx} className={`
                              ${user._status === 'success' ? 'bg-green-50' : ''}
                              ${user._status === 'error' ? 'bg-red-50' : ''}
                              ${user._status === 'uploading' ? 'bg-blue-50' : ''}
                            `}>
                              <td className="px-3 py-2 text-gray-500">{user.rowNum}</td>
                              <td className="px-3 py-2">{getRowStatusIcon(user._status)}</td>
                              <td className="px-3 py-2 font-medium text-gray-800">{user.name || <span className="text-red-400 italic">missing</span>}</td>
                              <td className="px-3 py-2 text-gray-600">{user.email || <span className="text-red-400 italic">missing</span>}</td>
                              <td className="px-3 py-2 text-gray-500">{user.phone || '–'}</td>
                              <td className="px-3 py-2 text-gray-500">{user.shopname || '–'}</td>
                              <td className="px-3 py-2 text-gray-500">{user.city || '–'}</td>
                              <td className="px-3 py-2 text-gray-500">{user.state || '–'}</td>
                              <td className="px-3 py-2 text-red-500 text-xs max-w-xs">{user._error || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => { setShowExcelModal(false); resetExcelModal(); }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={isUploadingExcel}
                  >
                    Cancel
                  </Button>
                  {!excelPreview.length ? (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <i className="ri-upload-line mr-2"></i> Select File
                    </Button>
                  ) : (
                    <Button
                      onClick={handleExcelSubmit}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={isUploadingExcel || validCount === 0}
                    >
                      {isUploadingExcel
                        ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                        : `Upload ${validCount} Valid Users`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}