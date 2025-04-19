import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getData } from "../../services/FetchNodeServices";

const AllCart = () => {
  const [users, setUsers] = useState([]);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await getData('api/users/get-all-user')
      console.log("responseXXXXXXXXXXXXX", response);
      if (response.success) {
        setUsers(response?.users);
      } else {
        console.error("Failed to fetch users:", response.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Delete user by ID
  const deleteUser = async (userId) => {
    // SweetAlert2 confirmation
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await getData(`api/users/delete-user/${userId}`);
        if (response.success === true) {
          Swal.fire("Deleted!", "The user has been deleted.", "success");

          fetchUsers();
        } else {
          Swal.fire("Failed!", response.data.message, "error");
        }
      } catch (error) {
        console.log(error);
        Swal.fire("Error!", "Something went wrong!", "error");
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="bread">
        <div className="head">
          <h4>All Users</h4>
        </div>
      </div>

      <section className="main-table">
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">Sr.No.</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Created At</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role || "User"}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bt delete"
                      >
                        Delete <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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

export default AllCart;
