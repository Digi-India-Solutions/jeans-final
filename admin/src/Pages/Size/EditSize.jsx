import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditSize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sizeData, setSizeData] = useState({ size: "", status: false });
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchSize = async () => {
      try {
        const response = await getData(`api/size/get_size_by_id/${id}`);
        // console.log('SSSSSSSSSSSSSSS', response);
        if (response?.status) {
          setSizeData({
            ...response.data,
            size: response.data.size,
            status: response.data.status,
          });
        }
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.message
            : "Error fetching size data"
        );
      }
    };

    fetchSize(); // Call the function to fetch size data
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSizeData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true); 

    const updatedData = { ...sizeData, status: sizeData.status };

    try {
      const response = await postData(`api/size/update-size/${id}`, updatedData);
      if (response?.success) {
        toast.success(response.massage);
        navigate("/all-size");
      }
      
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error updating size"
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
          <h4>Edit Size</h4>
        </div>
        <div className="links">
          <Link to="/all-size" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="sizeWeight" className="form-label">
              Size Weight
            </label>
            <input type="text" name="size" className="form-control" id="size" value={sizeData.size} onChange={handleChange} required />
          </div>
          <div className="col-md-12">
            <label htmlFor="sizeStatus" className="form-label">
              Active
            </label>
            <input type="checkbox" name="status" className="form-check-input" id="status" checked={sizeData.status} onChange={handleChange} />
          </div>

          <div className="col-12 text-center">
            <button
              type="submit"
              disabled={btnLoading}
              className={`${btnLoading ? "not-allowed" : "allowed"}`}
            >
              {btnLoading ? "Please Wait..." : "Update Size"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSize;
