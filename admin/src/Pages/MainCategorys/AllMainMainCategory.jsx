import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getData, postData } from "../../services/FetchNodeServices";

const MainCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await getData(
        "api/mainCategory/get-all-main-categorys-with-pagination"
      );
      if (response.success) {
        setCategories(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete Category
  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const data = await postData(`api/mainCategory/delete-main-category/${id}`);
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        Swal.fire("Deleted!", "Category deleted successfully.", "success");
      } else {
        Swal.fire("Error!", data.message || "Failed to delete category.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
      console.error("Error deleting category:", error);
    }
  };

  // Change Status
  const handleCheckboxChange = async (e, categoryId) => {
    const updatedStatus = e.target.checked;

    try {
      const response = await postData("api/mainCategory/change-status", {
        mainCategoryId: categoryId,
        status: updatedStatus,
      });

      if (response.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === categoryId ? { ...c, status: updatedStatus } : c
          )
        );
        toast.success("Category status updated successfully");
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating category status");
      console.error("Error updating category status:", error);
    }
  };

  if (isLoading) {
    return <p className="text-center">Loading categories...</p>;
  }

  return (
    <>
      <ToastContainer />
      <div className="bread">
        <div className="head">
          <h4>All Main Categories</h4>
        </div>
        <div className="links">
          <Link to="/add-main-category" className="add-new">
            Add New <i className="fa-solid fa-plus"></i>
          </Link>
        </div>
      </div>

      <section className="main-table">
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Sr.No.</th>
              <th scope="col">Name</th>
              <th scope="col">Image</th>
              <th scope="col">Show in Homepage</th>
              <th scope="col">Edit</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr key={category._id}>
                  <td>{index + 1}</td>
                  <td>{category.mainCategoryName}</td>
                  <td>
                    {category.images ? (
                      <img
                        src={category.images}
                        alt={category.mainCategoryName}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!category.status}
                      onChange={(e) => handleCheckboxChange(e, category._id)}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/edit-main-category/${category._id}`}
                      className="bt edit"
                    >
                      Edit <i className="fa-solid fa-pen-to-square"></i>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="bt delete"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default MainCategory;
