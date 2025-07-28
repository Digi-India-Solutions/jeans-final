import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";
import JoditEditor from "jodit-react";
import { Autocomplete, TextField } from "@mui/material";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    image: null,
    banner: null,
    status: false,
    subCategoryId: [],
    description: "",
    oldImage: null,
    oldBanner: null,
  });

  const [btnLoading, setBtnLoading] = useState(false);
  const [subCategoryList, setSubCategoryList] = useState([]);

  // Fetch category and subcategories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, subCatRes] = await Promise.all([
          getData(`api/category/get_category_by_id/${id}`),
          getData("api/subCategory/get-all-sub-categorys-with-pagination")
        ]);

        if (categoryRes.success) {
          const cat = categoryRes.data;
          setFormData((prev) => ({
            ...prev,
            name: cat.name || "",
            description: cat.description || "",
            subCategoryId: cat.subCategoryId?.map((p) => p._id) || [],
            status: cat.status || false,
            oldImage: cat.images || null,
            oldBanner: cat.categoryBanner || null,
          }));
        }

        if (subCatRes.success) {
          setSubCategoryList(subCatRes.data || []);
        }

      } catch (error) {
        toast.error("Error loading data");
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const handleJoditChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue }));
  };

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const uploadData = new FormData();
    uploadData.append("name", formData.name);
    uploadData.append("description", formData.description);
    uploadData.append("status", formData.status);
    if (formData.image) uploadData.append("image", formData.image);
    if (formData.banner) uploadData.append("banner", formData.banner);
    if (formData.oldImage) uploadData.append("oldImage", formData.oldImage);
    if (formData.oldBanner) uploadData.append("oldBanner", formData.oldBanner);
    formData.subCategoryId.forEach((id) => uploadData.append("subCategoryId", id));

    try {
      const response = await postData(`api/category/update-category/${id}`, uploadData);
      if (response.success) {
        toast.success(response.message || "Category updated successfully");
        navigate("/all-dieses");
      } else {
        toast.error(response.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error while updating category");
      console.error(error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>Edit Category</h4>
        </div>
        <div className="links">
          <Link to="/all-dieses" className="add-new">
            Back <i className="fa-regular fa-circle-left"></i>
          </Link>
        </div>
      </div>

      <div className="d-form">
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="form-label">Category Image</label>
            <input type="file" name="image" className="form-control" onChange={handleChange} />
            {formData.oldImage && (
              <img src={formData.oldImage} alt="Old" width="100" className="mt-2" />
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Category Name</label>
            <input type="text" name="name" className="form-control" value={formData?.name} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Select Main Categories</label>
            <Autocomplete
              multiple
              options={subCategoryList}
              getOptionLabel={(option) => option?.subCategoryName}
              value={subCategoryList.filter((item) =>
                formData.subCategoryId.includes(item._id)
              )}
              onChange={(e, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  subCategoryId: newValue.map((item) => item._id),
                }))
              }
              renderInput={(params) => <TextField {...params} placeholder="Choose main categories" />}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Category Banner</label>
            <input type="file" name="banner" className="form-control" accept="image/*" onChange={handleChange} />
            {formData.oldBanner && (
              <img src={formData.oldBanner} alt="Old Banner" width="100" className="mt-2" />
            )}
          </div>

          <div className="col-md-12">
            <label className="form-label">Description</label>
            <JoditEditor value={formData.description} onChange={handleJoditChange} />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="status"
                id="status"
                checked={formData.status}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="status">
                Active on Homepage
              </label>
            </div>
          </div>

          <div className="col-12 text-center">
            <button type="submit" className="btn btn-success" disabled={btnLoading}>
              {btnLoading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditCategory;
