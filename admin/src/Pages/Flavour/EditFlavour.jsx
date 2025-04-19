import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditFlavour = () => {
  const { id } = useParams(); // Get the flavour ID from the URL
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [flavourData, setFlavourData] = useState({
    floverName: "",
    floverStatus: false, // Use boolean for checkbox state
  });
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchFlavour = async () => {
      try {
        const response = await axios.get(
          `https://api.manovaidya.com/api/get-single-flover/${id}`
        );
        console.log(response);
        if (response.data && response.data.data) {
          setFlavourData({
            floverName: response.data.data.floverName || "", // Ensure it matches the API response
            floverStatus: response.data.data.floverStatus === "True", // Convert string to boolean
          });
        } else {
          toast.error("Flavour data not found");
        }
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.message
            : "Error fetching flavour data"
        );
      }
    };

    fetchFlavour(); // Call the function to fetch flavour data
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFlavourData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true); // Set loading state to true

    const updatedData = {
      floverName: flavourData.floverName,
      floverStatus: flavourData.floverStatus ? "True" : "False", // Convert boolean back to string
    };

    try {
      const response = await axios.put(
        `https://api.manovaidya.com/api/update-flover/${id}`,
        updatedData
      );
      toast.success(response.data.message); // Show success message
      navigate("/all-flower"); // Redirect to the all flavours page
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error updating flavour"
      );
    } finally {
      setBtnLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Flavour</h4>
        </div>
        <div className="links">
          <Link to="/all-flower" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="floverName" className="form-label">
              Flavour Name
            </label>
            <input
              type="text"
              name="floverName"
              className="form-control"
              id="floverName"
              value={flavourData.floverName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-12">
            <label htmlFor="floverStatus" className="form-label">
              Active
            </label>
            <input
              type="checkbox"
              name="floverStatus"
              className="form-check-input"
              id="floverStatus"
              checked={flavourData.floverStatus}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              disabled={btnLoading}
              className={`${btnLoading ? "not-allowed" : "allowed"}`}
            >
              {btnLoading ? "Please Wait..." : "Update Flavour"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditFlavour;
