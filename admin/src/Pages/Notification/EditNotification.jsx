import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const EditNotification = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await getData(`api/notification/get-notification-by-id/${id}`);
        if (response?.success) {
          setFormData({
            title: response?.data?.title,
            body: response?.data?.body,
            image: null,
          });
          setPreview(response?.data?.image);
        }
      } catch (error) {
        toast.error("Error fetching notification data");
        console.error("Error fetching notification:", error);
      }
    };
    fetchNotification();
  }, [id]);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("body", formData.body);
      if (formData.image) {
        form.append("image", formData.image);
      }

      const response = await postData(`api/notification/update-notification/${id}`, form);

      if (response?.success) {
        toast.success(response.message || "Notification updated");
        navigate("/all-notification");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating notification");
      console.error("Error updating notification:", error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Notification</h4>
        </div>
        <div className="links">
          <Link to="/all-notification" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="body" className="form-label">
              Body
            </label>
            <input
              type="text"
              name="body"
              className="form-control"
              value={formData.body}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="image" className="form-label">
              Image
            </label>
            <input type="file" name="image" className="form-control" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-2"
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px" }}
              />
            )}
          </div>

          <div className="col-12 text-center">
            <button type="submit" disabled={btnLoading}>
              {btnLoading ? "Please Wait..." : "Update Notification"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditNotification;
