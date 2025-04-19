import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddFlover = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    floverName: "", // Updated to match the Flover model
    floverStatus: "False", // Default status
  });
  const navigate = useNavigate(); // To programmatically navigate after adding a flover

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the specific field in the formData object
    }));
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      floverStatus: prevData.floverStatus === "True" ? "False" : "True", // Toggle status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setIsLoading(true); // Set loading state

    try {
      // Send a POST request to add the flover
      const response = await axios.post(
        "https://api.manovaidya.com/api/create-flover",
        formData
      ); // Adjust the URL as needed
      toast.success(response.data.message);
      navigate("/all-flower"); // Redirect to the all flowers page
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error adding flover"
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Add Flover</h4>
        </div>
        <div className="links">
          <Link to="/all-flover" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="floverName" className="form-label">
              Flover Name
            </label>
            <input
              type="text"
              name="floverName" // Updated to match the Flover model
              className="form-control"
              id="floverName"
              value={formData.floverName}
              onChange={handleChange} // Use the handleChange method
              required // Mark as required
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="floverStatus"
                checked={formData.floverStatus === "True"} // Check the checkbox based on the floverStatus
                onChange={handleCheckboxChange} // Use the handleCheckboxChange method
              />
              <label className="form-check-label" htmlFor="floverStatus">
                Active
              </label>
            </div>
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`${isLoading ? "not-allowed" : "allowed"}`}
            >
              {isLoading ? "Please Wait..." : "Add Flover"}{" "}
              {/* Updated button text */}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddFlover;
