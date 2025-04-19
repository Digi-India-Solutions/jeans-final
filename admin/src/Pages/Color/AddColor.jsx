import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../../services/FetchNodeServices";

const AddColor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ colorName: "", color: "#000", colorStatus: false, });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value, }));
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({ ...prevData, colorStatus: !prevData.colorStatus, }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setIsLoading(true); // Set loading state

    try {
      // Send a POST request to add the color
      const response = await postData("api/color/create-color", formData);
      if(response?.success){
        toast.success(response.message);
        navigate("/all-color");
      }
     
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error adding color"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Add Color</h4>
        </div>
        <div className="links">
          <Link to="/all-color" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="colorName" className="form-label">
              Color Name
            </label>
            <input type="text" name="colorName" className="form-control" id="colorName" value={formData.colorName} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label htmlFor="color" className="form-label">
              Color
            </label>
            <input type="color" name="color" className="form-control" id="color" value={formData.color} onChange={handleChange} required />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="colorStatus" checked={formData.colorStatus} onChange={handleCheckboxChange} />
              <label className="form-check-label" htmlFor="colorStatus">
                Active
              </label>
            </div>
          </div>

          <div className="col-12 text-center">
            <button type="submit" disabled={isLoading} className={`${isLoading ? "not-allowed" : "allowed"}`}
            >
              {isLoading ? "Please Wait..." : "Add Color"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddColor;
