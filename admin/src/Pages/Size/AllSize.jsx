import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const AllSize = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSizes = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await getData(`api/size/get-all-size-with-pagination?pageNumber=${page}`);
      if (response.success) {
        setSizes(response.data || []);
      } else {
        toast.error("No sizes found");
      }
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error fetching sizes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [currentPage]);

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await getData(`api/size/delete-size/${id}`);
        if (response?.success) {
          toast.success(response.message);
          setSizes((prev) => prev.filter((size) => size._id !== id));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error deleting size"
        );
      }
    }
  };

  const handleStatusChange = async (e, sizeId) => {
    const updatedStatus = e.target.checked;

    try {
      const response = await postData("api/size/change-status", {
        sizeId,
        status: updatedStatus,
      });

      if (response.success) {
        setSizes((prevSizes) =>
          prevSizes.map((size) =>
            size._id === sizeId ? { ...size, status: updatedStatus } : size
          )
        );
        toast.success("Size status updated");
      }
    } catch (error) {
      toast.error("Error updating status");
      console.error("Status error:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>All Sizes</h4>
        </div>
        <div className="links">
          <Link to="/add-size" className="add-new">
            Add New <i className="fa-solid fa-plus"></i>
          </Link>
        </div>
      </div>

      <section className="main-table">
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th>Sr.No.</th>
              <th>Size (Weight)</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : sizes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No sizes available
                </td>
              </tr>
            ) : (
              sizes.map((size, index) => (
                <tr key={size._id}>
                  <td>{index + 1}</td>
                  <td>{size.size}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={size?.status}
                      onChange={(e) => handleStatusChange(e, size._id)}
                    />
                  </td>
                  <td>
                    <Link to={`/edit-size/${size._id}`} className="bt edit">
                      Edit <i className="fa-solid fa-pen-to-square"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(size._id)}
                      className="bt delete"
                    >
                      Delete <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default AllSize;
