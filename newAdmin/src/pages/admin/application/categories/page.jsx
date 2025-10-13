import { useState, useRef, useEffect } from "react";
import AdminLayout from "../../../../components/feature/AdminLayout";
import Card from "../../../../components/base/Card";
import Button from "../../../../components/base/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData, getData } from "../../../../services/FetchNodeServices";
import Swal from 'sweetalert2';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [permiton, setPermiton] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    imagePreview: null,
    status: true,
  });

  const fileInputRef = useRef(null);

  /** Reset form state */
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      imagePreview: null,
      status: true,
    });
    setEditingCategory(null);
  };

  /** Fetch categories */
  const fetchCategories = async () => {
    try {
      const response = await getData(
        "api/mainCategory/get-all-main-categorys-with-pagination"
      );
      if (response?.success) {
        setCategories(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /** Handle image upload */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  /** Handle submit (Add / Edit) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?.name?.trim()) {
      toast.error("Category Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("mainCategoryName", formData.name.trim());
      uploadData.append("slug", formData.slug);
      uploadData.append("status", formData.status);

      if (formData.description) {
        uploadData.append("description", formData.description.trim());
      }
      if (editingCategory) {
        uploadData.append("oldImages", editingCategory?.images);
      }


      // Only append new image if uploaded
      if (formData.image instanceof File) {
        uploadData.append("images", formData.image);
      }

      const url = editingCategory
        ? `api/mainCategory/update-main-category/${editingCategory._id}`
        : "api/mainCategory/create-main-category";

      const response = await postData(url, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.success) {
        toast.success(response?.message || "Category saved successfully");
        resetForm();
        setShowAddModal(false);
        fetchCategories(); // Refresh list
      } else {
        toast.error(response?.message || "Error saving category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error?.response?.message || "Error saving category");
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle edit */
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.mainCategoryName,
      slug: category.slug,
      description: category.description,
      image: category.images?.[0] || null,
      imagePreview: category.images?.[0] || null,
      status: category.status,
    });
    setShowAddModal(true);
  };

  /** Handle delete */
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result?.isConfirmed) {
        const response = await postData(
          `api/mainCategory/delete-main-category/${id}`
        );
        if (response?.success) {
          toast.success("Category deleted successfully");
          fetchCategories();
        } else {
          toast.error(response?.message || "Error deleting category");
        }
      }
    } catch (error) {
      toast.error("Failed to delete the category");
    }
  };

  /** Toggle status */
  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await postData(`api/mainCategory/update-main-category/${id}`, { status: !currentStatus });
      if (response?.success) {
        toast.success("Status updated");
        fetchCategories();
      } else {
        toast.error(response?.message || "Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };


  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
      setPermiton(response?.data[0]?.permissions?.categories)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [user?.role])

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Categories Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage product categories with images
            </p>
          </div>
          {permiton?.write && <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Add Category</span>
          </Button>}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="overflow-hidden">
              {/* Image + Status */}
              <div className="relative">
                <img src={category.images?.[0]} alt={category.mainCategoryName} className="w-full h-48 object-cover" />
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${category.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {category.status ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {category.mainCategoryName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {category.productsCount || 0} products
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {category?.description?.length > 180
                    ? category?.description?.slice(0, 180) + "..."
                    : category?.description}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  {permiton?.update && <Button
                    onClick={() => handleEdit(category)}
                    className="flex-1 bg-blue-500 text-blue-600 hover:bg-blue-100 text-sm"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    Edit
                  </Button>}
                  {permiton.update && <Button
                    onClick={() => toggleStatus(category._id, category.status)}
                    className={`flex-1 text-sm ${category.status
                      ? "bg-red-500 text-red-600 hover:bg-red-900"
                      : "bg-green-500 text-green-600 hover:bg-green-100"
                      }`}
                  >
                    {category.status ? "Deactivate" : "Activate"}
                  </Button>}
                  {permiton?.delete && <Button
                    onClick={() => handleDelete(category._id)}
                    className="bg-red-500 text-red-600 hover:bg-red-100 px-3"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData, name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData?.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength="500"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <i className="ri-upload-2-line"></i>
                          <span>Upload Image</span>
                        </Button>
                      </div>

                      {formData?.imagePreview && (
                        <div className="relative">
                          <img
                            src={formData.imagePreview}
                            alt="Category preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: null, imagePreview: null, })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status ? "Active" : "Inactive"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value === "Active", })
                        }
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-500 text-gray-700 hover:bg-gray-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isLoading ? editingCategory ? "Updating..." : "Adding..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
