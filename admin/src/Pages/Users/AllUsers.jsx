import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getData, postData } from "../../services/FetchNodeServices";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await getData("api/user/get-all-user");
      if (response.success) {
        setUsers(response.data);
      } else {
        console.error("Failed to fetch users:", response.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Delete user
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

  // Toggle user status
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOrderClick = async (users) => {
    setLoading(true);
    const orderData = users.map((user) => ({ _id: user?._id, name: user.name, email: user.email, phone: user.phone, address: user.address, status: user.status, createdAt: user.createdAt, }));
    // const jsonData = JSON.stringify(orderData);
    const blob = await postData("api/user/bulk-order-notification", orderData);
    // console.log("blob", blob);
    if (blob?.success) {
      setLoading(false);
      Swal.fire("Success!", blob?.message || "Order notification sent successfully!", "success");
    } else {
      setLoading(false);
      Swal.fire("Error!", "Failed to send order notification!", "error");
    }

  }


  return (
    <>
      <div className="bread" style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="header d-flex justify-content-between align-items-center" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <h4 className="mb-0 fw-bold" >All Users</h4>
          <button className="btn btn-primary" onClick={() => handleOrderClick(users)}  >{loading?"Sending...":"Send Order Notification"}</button>
        </div>
      </div>

      <section className="main-table">
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
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
                    <td>
                      {[
                        user?.address?.street,
                        user?.address?.city,
                        user?.address?.state,
                        user?.address?.zipCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                    <td>{user.role || "User"}</td>
                    <td>
                      <span
                        className={`badge px-3 py-2 text-white fw-bold ${user.isActive ? "bg-success" : "bg-danger"}`}
                        style={{ cursor: "pointer", fontSize: "0.9rem" }}
                        onClick={() => toggleStatus(user._id, user.isActive)}
                      >
                        <i className={`fa ${user.isActive ? "fa-toggle-on" : "fa-toggle-off"} me-1`}></i>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}{" "}
                      {new Date(user.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteUser(user._id)}
                      >
                        <i className="fa fa-trash me-1"></i> Delete
                      </button>
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
    </>
  );
};

export default AllUsers;
