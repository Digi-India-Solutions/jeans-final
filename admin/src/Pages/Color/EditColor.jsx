import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditColor = () => {
  const { id } = useParams(); // Get the color ID from the URL
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [colorData, setColorData] = useState({ colorName: "", color: "", colorStatus: false, });
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await getData(`api/color/get_color_by_id/${id}`);
        console.log("response.data:----", response)
        if (response.success) {
          setColorData({
            ...response.data,
            colorStatus: response.data.colorStatus
          });
        }
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.message
            : "Error fetching color data"
        );
      }
    };

    fetchColor();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setColorData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? (checked) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true); // Set loading state to true

    try {
      const response = await postData(`api/color/update-color/${id}`, colorData);
      if (response?.success) {
        toast.success(response.message || 'Color Deleted Successfully');
        navigate("/all-color");
      }

    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error updating color"
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
          <h4>Edit Color</h4>
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
            <label htmlFor="title" className="form-label">
              Color Name
            </label>
            <input type="text" name="colorName" className="form-control" id="title" value={colorData.colorName} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label htmlFor="color" className="form-label">
              Color
            </label>
            <input type="color" name="color" className="form-control" id="color" value={colorData.color} onChange={handleChange} required />
          </div>
          <div className="col-md-2 " style={{ gap: 10, display: "flex", }}>
            <input type="checkbox" name="colorStatus" className="form-check-input" id="colorStatus" checked={colorData.colorStatus} onChange={handleChange} />
            <label htmlFor="colorStatus" className="form-label">
              Active
            </label>
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              disabled={btnLoading}
              className={`${btnLoading ? "not-allowed" : "allowed"}`}
            >
              {btnLoading ? "Please Wait..." : "Update Color"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditColor;
