import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllFlavour = () => {
  const [flovers, setFlovers] = useState([]); // State to store flover data
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const fetchFlovers = async () => {
      try {
        const response = await axios.get(
          "https://api.manovaidya.com/api/get-flover"
        ); // Adjusted the URL to fetch flovers
        if (response.data && response.data.data) {
          setFlovers(response.data.data); // Set the fetched flovers
        } else {
          toast.error("No flovers found");
        }
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.message
            : "Error fetching flovers"
        );
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchFlovers(); // Call the fetch function
  }, []); // Empty dependency array to run once on mount

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await axios.delete(
          `https://api.manovaidya.com/api/delete-flover/${id}`
        ); // Adjusted the delete URL
        toast.success(response.data.message);
        setFlovers(flovers.filter((flover) => flover._id !== id)); // Remove deleted flover from state
      } catch (error) {
        toast.error(
          error.response ? error.response.data.message : "Error deleting flover"
        );
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>All Flovers</h4>
        </div>
        <div className="links">
          <Link to="/add-flover" className="add-new">
            Add New <i className="fa-solid fa-plus"></i>
          </Link>
        </div>
      </div>

      <div className="filteration">
        <div className="search">
          {/* <label htmlFor="search">Search </label> &nbsp;
          <input type="text" name="search" id="search" /> */}
        </div>
      </div>

      <section className="main-table">
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Sr.No.</th>
              <th scope="col">Flover Name</th>{" "}
              {/* Changed column title to Flover Name */}
              <th scope="col">Flover Status</th>{" "}
              {/* Changed column title to Flover Status */}
              <th scope="col">Edit</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : flovers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No flovers available
                </td>
              </tr>
            ) : (
              flovers.map((flover, index) => (
                <tr key={flover._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{flover.floverName}</td> {/* Display flover name */}
                  <td>{flover.floverStatus}</td> {/* Display flover status */}
                  <td>
                    <Link to={`/edit-flover/${flover._id}`} className="bt edit">
                      Edit <i className="fa-solid fa-pen-to-square"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(flover._id)}
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

export default AllFlavour;
