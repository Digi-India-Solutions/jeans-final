import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices";

const AddSize = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ size: "", status: true, });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value, }));
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({ ...prev, status: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setIsLoading(true); // Set loading state

    try {
      const response = await postData(`api/size/create-size`, formData);
      console.log(response);
      if (response?.success) {
        toast.success(response.message);
        navigate("/all-size");
      } else {
        toast.error(response.message || "Error adding size !");
      }

    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error adding size"
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
          <h4>Add Size</h4>
        </div>
        <div className="links">
          <Link to="/all-size" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="size" className="form-label">
              Size
            </label>
            <input type="text" name="size" className="form-control" id="size" value={formData.size} onChange={handleChange} required />
          </div>
          <div className="col-md-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="status" checked={formData.status} onChange={handleCheckboxChange} />
              <label className="form-check-label" htmlFor="status">
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
              {isLoading ? "Please Wait..." : "Add Size"}{" "}
              {/* Updated button text */}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddSize;
