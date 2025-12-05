import { useState, useRef, useEffect } from "react";
import AdminLayout from "../../../../components/feature/AdminLayout";
import Card from "../../../../components/base/Card";
import Button from "../../../../components/base/Button";
import { getData, postData } from "../../../../services/FetchNodeServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

export default function SubCategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [permiton, setPermiton] = useState('');

  const [formData, setFormData] = useState({
    name: "", slug: "", categoryId: "", description: "",
    image: null, imagePreview: null, banner: null, bannerPreview: null, status: true,
  });

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  /** Fetch categories + subcategories */
  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
      const [mainCatRes, subCatRes] = await Promise.all([
        getData("api/mainCategory/get-all-main-categorys-with-pagination"),
        getData("api/category/get-all-categorys-with-pagination"),
      ]);

      if (mainCatRes?.success) setCategories(mainCatRes.data || []);
      if (subCatRes?.success) setSubCategories(subCatRes.data || []);
    } catch (error) {
      toast.error("Error fetching categories data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  /** Handle image uploads */
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      [type]: file,
      [`${type}Preview`]: imageUrl,
    }));
  };

  /** Submit form */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Sub-Category Name is required");
    if (!formData.categoryId) return toast.error("Parent Category is required");

    setIsLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("name", formData.name.trim());
      uploadData.append("slug", formData.slug);
      uploadData.append("description", formData.description);
      uploadData.append("status", formData.status);
      uploadData.append("mainCategoryId", formData.categoryId);

      if (formData.image) uploadData.append("image", formData.image);
      if (formData.banner) uploadData.append("banner", formData.banner);

      if (editingSubCategory?.oldImage)
        uploadData.append("oldImage", editingSubCategory.oldImage);
      if (editingSubCategory?.oldBanner)
        uploadData.append("oldBanner", editingSubCategory.oldBanner);

      const url = editingSubCategory
        ? `api/category/update-category/${editingSubCategory._id}`
        : "api/category/create-category";

      const response = await postData(url, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.success) {
        toast.success(
          editingSubCategory
            ? "Sub-Category updated successfully"
            : "Sub-Category created successfully"
        );
        resetForm();
        fetchSubCategories();
      } else {
        toast.error(response?.message || "Error saving sub-category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  /** Edit SubCategory */
  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      slug: subCategory.slug,
      categoryId: subCategory?.mainCategoryId?._id,
      description: subCategory.description,
      image: null,
      imagePreview: subCategory.images?.[0] || null,
      banner: null,
      bannerPreview: subCategory.categoryBanner?.[0] || null,
      oldImage: subCategory.images?.[0] || null,
      oldBanner: subCategory.categoryBanner?.[0] || null,
      status: subCategory.status,
    });
    setShowAddModal(true);
  };

  /** Delete SubCategory */
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
      const data = await postData(`api/category/delete-category/${id}`);
      if (data.success) {
        setSubCategories((prev) => prev.filter((sc) => sc._id !== id));
        Swal.fire("Deleted!", "Sub-category has been deleted.", "success");
      } else {
        Swal.fire("Error!", data.message || "Failed to delete sub-category", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "There was an error deleting the sub-category.", "error");
      console.error("Error deleting sub-category:", error);
    }
  };

  /** Toggle Active/Inactive */
  const toggleStatus = async (id, current) => {
    const updatedStatus = !current.status;

    try {
      const response = await postData("api/category/change-status", {
        categoryId: id,
        status: updatedStatus,
      });

      if (response.success) {
        setSubCategories((prev) =>
          prev.map((sc) =>
            sc._id === id ? { ...sc, status: updatedStatus } : sc
          )
        );
        toast.success("Category status updated successfully");
      }
    } catch (error) {
      toast.error("Error updating category status");
      console.error("Error updating category status:", error);
    }
  };

  /** Reset form */
  const resetForm = () => {
    setFormData({ name: "", slug: "", categoryId: "", description: "", image: null, imagePreview: null, banner: null, bannerPreview: null, status: true, });
    setShowAddModal(false);
    setEditingSubCategory(null);
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
              Sub-Categories Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage product sub-categories with images
            </p>
          </div>
          {permiton.write && <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Add Sub-Category</span>
          </Button>}
        </div>

        {/* SubCategories Grid */}
        {isLoading ? (
          <p className="text-gray-600">Loading sub-categories...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {subCategories.map((subCategory) => (
              <Card key={subCategory._id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={subCategory.images?.[0] || subCategory.imagePreview}
                    alt={subCategory.name}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${subCategory.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {subCategory?.status ? "Active" : "Inactive"}
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                    {subCategory?.mainCategoryId?.mainCategoryName}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {subCategory.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {subCategory?.productsCount} products
                    </span>
                  </div>

                  {/* <p className="text-sm text-gray-600 mb-4">
                    {subCategory?.description?.length > 180
                      ? subCategory?.description?.slice(0, 180) + "..."
                      : subCategory?.description}
                  </p> */}

                  <div className="flex space-x-2">
                    {permiton.update && <Button
                      onClick={() => handleEdit(subCategory)}
                      className="flex-1 bg-blue-500 text-blue-600 hover:bg-blue-100 text-sm"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>}
                  {permiton.update && <Button
                      onClick={() => toggleStatus(subCategory?._id, subCategory)}
                      className={`flex-1 text-sm ${subCategory.status
                        ? "bg-red-500 text-red-600 hover:bg-red-900"
                        : "bg-green-500 text-green-600 hover:bg-green-100"
                        }`}
                    >
                      {subCategory.status
                        ? "Deactivate"
                        : "Activate"}
                    </Button>}  
                    {permiton.delete && <Button
                      onClick={() => handleDelete(subCategory._id)}
                      className="bg-red-500 text-red-600 hover:bg-red-100 px-3"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingSubCategory
                      ? "Edit Sub-Category"
                      : "Add New Sub-Category"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Parent Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: e.target.value })
                        }
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.mainCategoryName}
                          </option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  {/* Sub-Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Slug */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div> */}

                  {/* Description */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength="500"
                    />
                  </div> */}

                  {/* Sub-Category Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Category Image
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, "image")}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <i className="ri-upload-2-line"></i>
                          <span>Upload Image</span>
                        </Button>
                      </div>

                      {formData.imagePreview && (
                        <div className="relative">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                image: null,
                                imagePreview: null,
                              })
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image (Optional)
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          ref={bannerInputRef}
                          onChange={(e) => handleFileUpload(e, "banner")}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="bg-purple-600 text-white hover:bg-purple-700 flex items-center space-x-2"
                        >
                          <i className="ri-image-line"></i>
                          <span>Upload Banner</span>
                        </Button>
                      </div>

                      {formData.bannerPreview && (
                        <div className="relative">
                          <img
                            src={formData.bannerPreview}
                            alt="Banner Preview"
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, banner: null, bannerPreview: null })
                            }
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
                          setFormData({ ...formData, status: e.target.value === "Active" ? true : false })
                        }
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading
                        ? editingSubCategory
                          ? "Updating..."
                          : "Adding..."
                        : editingSubCategory
                          ? "Update Sub-Category"
                          : "Add Sub-Category"}
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
