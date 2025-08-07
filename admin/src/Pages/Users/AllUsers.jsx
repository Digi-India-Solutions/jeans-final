// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";
// import { getData, postData } from "../../services/FetchNodeServices";
// import { Link, useNavigate } from "react-router-dom";

// const FILTER_OPTIONS = [
//   { label: "Last 30 Days", value: 30 },
//   { label: "Last 60 Days", value: 60 },
//   { label: "Last 90 Days", value: 90 },
//   { label: "Last 120 Days", value: 120 },
// ];

// const AllUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterDays, setFilterDays] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Fetch all users
//   const fetchUsers = async () => {
//     try {
//       const response = await getData("api/user/get-all-user");
//       if (response.success) {
//         setUsers(response.data);
//         setAllUsers(response.data);
//       } else {
//         console.error("Failed to fetch users:", response.message);
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   // Delete user
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
//           Swal.fire("Deleted!", "User has been deleted.", "success");
//           fetchUsers();
//         } else {
//           Swal.fire("Error", response.message, "error");
//         }
//       } catch (error) {
//         Swal.fire("Error!", "Something went wrong!", "error");
//       }
//     }
//   };

//   // Toggle user status
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
//           Swal.fire("Updated!", "User status updated.", "success");
//           fetchUsers();
//         } else {
//           Swal.fire("Error", response.message, "error");
//         }
//       } catch (error) {
//         Swal.fire("Error!", "Could not update status.", "error");
//       }
//     }
//   };

//   // Send bulk order notification
//   const handleOrderClick = async (usersList) => {
//     setLoading(true);
//     const orderData = usersList.map((user) => ({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
//       status: user.status,
//       createdAt: user.createdAt,
//     }));

//     const response = await postData("api/user/bulk-order-notification", orderData);
//     setLoading(false);
//     if (response?.success) {
//       Swal.fire("Success!", response.message || "Order notification sent!", "success");
//     } else {
//       Swal.fire("Error!", "Failed to send notification!", "error");
//     }
//   };

//   // Filter users with no orders
//   const handleFilterChange = async (days) => {
//     setFilterDays(days);
//     if (!days) {
//       setUsers(allUsers);
//       return;
//     }

//     const response = await getData(`api/user/get-users-without-orders/${days}`);
//     if (response?.status) {
//       setUsers(response?.data);
//     } else {
//       Swal.fire("Error!", response.message || "Could not fetch filtered users.", "error");
//     }
//   };

//   // Helper: format address
//   const formatAddress = (address) => {
//     return [
//       address?.street,
//       address?.city,
//       address?.state,
//       address?.zipCode,
//     ]
//       .filter(Boolean)
//       .join(", ") || "-";
//   };

//   const handleSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = allUsers.filter(user =>
//       user?.name?.toLowerCase().includes(query) ||
//       user?.email?.toLowerCase().includes(query) ||
//       user?.phone?.toLowerCase().includes(query)
//     );
//     setAllUsers(filtered);
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="bread d-flex justify-content-between align-items-center mb-3">
//         <h4 className="fw-bold">All Users</h4>
//         <div className="d-flex gap-2">
//           <select
//             className="form-select"
//             style={{ width: 200 }}
//             value={filterDays}
//             onChange={(e) => handleFilterChange(e.target.value)}
//           >
//             <option value="">-- Filter: No Orders In --</option>
//             {FILTER_OPTIONS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//           <button
//             className="btn btn-primary"
//             onClick={() => handleOrderClick(users)}
//             disabled={loading}
//           >
//             {loading ? "Sending..." : "Send Order Notification"}
//           </button>
//           <div className="search">
//             <label htmlFor="search">Search</label>&nbsp;
//             <input
//               type="text"
//               name="search"
//               id="search"
//               value={searchQuery}
//               onChange={handleSearch}
//             />
//           </div>
//         </div>



//       </div>

//       {/* User Table */}
//       <section className="main-table">
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover align-middle">
//             <thead className="table-dark text-center">
//               <tr>
//                 <th>Sr.No.</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Phone</th>
//                 <th>Address</th>
//                 <th>Role</th>
//                 <th>Status</th>
//                 <th>Created At</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.length > 0 ? (
//                 users.map((user, index) => (
//                   <tr key={user._id}>
//                     <td>{index + 1}</td>
//                     <td>{user.name || "-"}</td>
//                     <td>{user.email || "-"}</td>
//                     <td>{user.phone || "-"}</td>
//                     <td>{formatAddress(user.address)}</td>
//                     <td>{user.role || "User"}</td>
//                     <td className="text-center">
//                       <span
//                         className={`badge px-3 py-2 text-white fw-bold ${user.isActive ? "bg-success" : "bg-danger"}`}
//                         style={{ cursor: "pointer", fontSize: "0.9rem" }}
//                         onClick={() => toggleStatus(user._id, user.isActive)}
//                       >
//                         <i className={`fa ${user.isActive ? "fa-toggle-on" : "fa-toggle-off"} me-1`} />
//                         {user.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td>
//                       {new Date(user.createdAt).toLocaleDateString()}{" "}
//                       {new Date(user.createdAt).toLocaleTimeString()}
//                     </td>
//                     <td  >
//                       <div className="" style={{ display: 'flex', gap: 5 }} >
//                         <button
//                           className="btn btn-sm btn-outline-info"
//                           onClick={() => navigate(`/all-order-detail-by-user/${user?._id}`, { state: { user } })}

//                         >
//                           {/* <Link to={`/all-order-detail-by-user/${user?._id}`} style={{ textDecoration: 'none' }}> */}
//                           <i className="fa fa-list me-1"></i> Order Details
//                           {/* </Link> */}
//                         </button>
//                         <button
//                           className="btn btn-sm btn-outline-warning"
//                           onClick={() => navigate(`/all-cart-detail-by-user/${user?._id}`, { state: { user } })}
//                         >
//                           <i className="fa fa-shopping-cart me-1"></i> Check Cart
//                         </button>
//                         <button
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => deleteUser(user?._id)}
//                         >
//                           <i className="fa fa-trash me-1"></i> Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="9" className="text-center py-4">
//                     No users found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default AllUsers;


import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getData, postData } from "../../services/FetchNodeServices";
import { useNavigate } from "react-router-dom";

const FILTER_OPTIONS = [
  { label: "Last 30 Days", value: 30 },
  { label: "Last 60 Days", value: 60 },
  { label: "Last 90 Days", value: 90 },
  { label: "Last 120 Days", value: 120 },
];

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDays, setFilterDays] = useState("");
  const navigate = useNavigate();

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getData("api/user/get-all-user");
      if (response.success) {
        setAllUsers(response.data);
        setUsers(response.data);
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to fetch users", "error");
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
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUsers();
        } else {
          Swal.fire("Error", response.message, "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong!", "error");
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
          Swal.fire("Updated!", "User status updated.", "success");
          fetchUsers();
        } else {
          Swal.fire("Error", response.message, "error");
        }
      } catch (error) {
        Swal.fire("Error!", "Could not update status.", "error");
      }
    }
  };

  const handleOrderClick = async (usersList) => {
    if (!usersList.length) {
      return Swal.fire("Warning!", "No users to notify.", "warning");
    }

    setLoading(true);
    const orderData = usersList.map((user) => ({
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
      Swal.fire(
        response.success ? "Success!" : "Error!",
        response.message || "Notification status unknown.",
        response.success ? "success" : "error"
      );
    } catch (error) {
      Swal.fire("Error!", "Failed to send notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (days) => {
    setFilterDays(days);
    if (!days) {
      setUsers(allUsers);
      return;
    }

    try {
      const response = await getData(`api/user/get-users-without-orders/${days}`);
      if (response.status) {
        setUsers(response.data);
      } else {
        Swal.fire("Error!", response.message || "Could not fetch users.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to apply filter.", "error");
    }
  };

  const formatAddress = (address) => {
    return [
      address?.street,
      address?.city,
      address?.state,
      address?.zipCode,
    ]
      .filter(Boolean)
      .join(", ") || "-";
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allUsers.filter((user) =>
      user?.name?.toLowerCase().includes(query) ||
      user?.email?.toLowerCase().includes(query) ||
      user?.phone?.toLowerCase().includes(query)
    );

    setUsers(filtered);
  };

  return (
    <div>
      {/* Header */}
      <div className="bread d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">All Users</h4>
        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select"
            style={{ width: 200 }}
            value={filterDays}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">-- Filter: No Orders In --</option>
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={() => handleOrderClick(users)}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Order Notification"}
          </button>

          <div className="search d-flex align-items-center">
            <input
              type="text"
              name="search"
              id="search"
              value={searchQuery}
              onChange={handleSearch}
              className="form-control"
              placeholder="Name, Email, Phone"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="main-table">
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark text-center">
              <tr>
                <th>Sr.No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.name || "-"}</td>
                    <td>{user.email || "-"}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{formatAddress(user.address)}</td>
                    <td>{user.role || "User"}</td>
                    <td className="text-center">
                      <span
                        className={`badge px-3 py-2 text-white fw-bold ${user.isActive ? "bg-success" : "bg-danger"}`}
                        style={{ cursor: "pointer", fontSize: "0.9rem" }}
                        onClick={() => toggleStatus(user._id, user.isActive)}
                        title="Click to toggle status"
                      >
                        <i className={`fa ${user.isActive ? "fa-toggle-on" : "fa-toggle-off"} me-1`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}{" "}
                      {new Date(user.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => navigate(`/all-order-detail-by-user/${user?._id}`, { state: { user } })}
                        >
                          <i className="fa fa-list me-1"></i> Order Details
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => navigate(`/all-cart-detail-by-user/${user?._id}`, { state: { user } })}
                        >
                          <i className="fa fa-shopping-cart me-1"></i> Check Cart
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteUser(user?._id)}
                        >
                          <i className="fa fa-trash me-1"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AllUsers;
