// import { useState, useRef, useEffect } from "react";
// import AdminLayout from "../../../../components/feature/AdminLayout";
// import Card from "../../../../components/base/Card";
// import Button from "../../../../components/base/Button";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { postData, getData } from "../../../../services/FetchNodeServices";
// import Swal from 'sweetalert2';

// export default function CategoriesManagement() {
//   const [categories, setCategories] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
//   const [permiton, setPermiton] = useState('');
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     description: "",
//     image: null,
//     imagePreview: null,
//     status: true,
//   });

//   const fileInputRef = useRef(null);

//   /** Reset form state */
//   const resetForm = () => {
//     setFormData({
//       name: "",
//       slug: "",
//       description: "",
//       image: null,
//       imagePreview: null,
//       status: true,
//     });
//     setEditingCategory(null);
//   };

//   /** Fetch categories */
//   const fetchCategories = async () => {
//     try {
//       const response = await getData(
//         "api/mainCategory/get-all-main-categorys-with-pagination"
//       );
//       if (response?.success) {
//         setCategories(response?.data || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch categories");
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       toast.error("Error fetching categories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   /** Handle image upload */
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith("image/")) {
//       setFormData({
//         ...formData,
//         image: file,
//         imagePreview: URL.createObjectURL(file),
//       });
//     }
//   };

//   /** Handle submit (Add / Edit) */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData?.name?.trim()) {
//       toast.error("Category Name is required");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const uploadData = new FormData();
//       uploadData.append("mainCategoryName", formData.name.trim());
//       uploadData.append("slug", formData.slug);
//       uploadData.append("status", formData.status);

//       if (formData.description) {
//         uploadData.append("description", formData.description.trim());
//       }
//       if (editingCategory) {
//         uploadData.append("oldImages", editingCategory?.images);
//       }


//       // Only append new image if uploaded
//       if (formData.image instanceof File) {
//         uploadData.append("images", formData.image);
//       }

//       const url = editingCategory
//         ? `api/mainCategory/update-main-category/${editingCategory._id}`
//         : "api/mainCategory/create-main-category";

//       const response = await postData(url, uploadData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response?.success) {
//         toast.success(response?.message || "Category saved successfully");
//         resetForm();
//         setShowAddModal(false);
//         fetchCategories(); // Refresh list
//       } else {
//         toast.error(response?.message || "Error saving category");
//         fetchCategories()
//       }
//     } catch (error) {
//       console.error("Error saving category:", error);
//       toast.error(error?.response?.message || "Error saving category");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /** Handle edit */
//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     setFormData({
//       name: category.mainCategoryName,
//       slug: category.slug,
//       description: category.description,
//       image: category.images?.[0] || null,
//       imagePreview: category.images?.[0] || null,
//       status: category.status,
//     });
//     setShowAddModal(true);
//   };

//   /** Handle delete */
//   const handleDelete = async (id) => {
//     try {
//       const result = await Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!'
//       });

//       if (result?.isConfirmed) {
//         const response = await postData(
//           `api/mainCategory/delete-main-category/${id}`
//         );
//         if (response?.success) {
//           toast.success("Category deleted successfully");
//           fetchCategories();
//         } else {
//           toast.error(response?.message || "Error deleting category");
//         }
//       }
//     } catch (error) {
//       toast.error("Failed to delete the category");
//     }
//   };

//   /** Toggle status */
//   const toggleStatus = async (id, currentStatus) => {
//     try {
//       const response = await postData(`api/mainCategory/update-main-category/${id}`, { status: !currentStatus });
//       if (response?.success) {
//         toast.success("Status updated");
//         fetchCategories();
//       } else {
//         toast.error(response?.message || "Error updating status");
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Error updating status");
//     }
//   };


//   const fetchRoles = async () => {
//     try {
//       const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
//       console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
//       setPermiton(response?.data[0]?.permissions?.categories)
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   useEffect(() => {
//     fetchRoles()
//   }, [user?.role])

//   return (
//     <AdminLayout>
//       <ToastContainer />
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Categories Management
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Manage product categories with images
//             </p>
//           </div>
//           {permiton?.write && <Button
//             onClick={() => {
//               resetForm();
//               setShowAddModal(true);
//             }}
//             className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
//           >
//             <i className="ri-add-line"></i>
//             <span>Add Category</span>
//           </Button>}
//         </div>

//         {/* Category Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//           {categories.map((category) => (
//             <Card key={category._id} className="overflow-hidden">
//               {/* Image + Status */}
//               <div className="relative">
//                 <img src={category.images?.[0]} alt={category.mainCategoryName} className="w-full h-48 object-cover" />
//                 <div
//                   className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${category.status
//                     ? "bg-green-100 text-green-800"
//                     : "bg-red-100 text-red-800"
//                     }`}
//                 >
//                   {category.status ? "Active" : "Inactive"}
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="font-semibold text-gray-900">
//                     {category.mainCategoryName}
//                   </h3>
//                   <span className="text-sm text-gray-500">
//                     {category.productsCount || 0} products
//                   </span>
//                 </div>

//                 {/* <p className="text-sm text-gray-600 mb-4">
//                   {category?.description?.length > 180
//                     ? category?.description?.slice(0, 180) + "..."
//                     : category?.description}
//                 </p> */}

//                 {/* Actions */}
//                 <div className="flex space-x-2">
//                   {permiton?.update && <Button
//                     onClick={() => handleEdit(category)}
//                     className="flex-1 bg-blue-500 text-blue-600 hover:bg-blue-100 text-sm"
//                   >
//                     <i className="ri-edit-line mr-1"></i>
//                     Edit
//                   </Button>}
//                   {permiton.update && <Button
//                     onClick={() => toggleStatus(category._id, category.status)}
//                     className={`flex-1 text-sm ${category.status
//                       ? "bg-red-500 text-red-600 hover:bg-red-900"
//                       : "bg-green-500 text-green-600 hover:bg-green-100"
//                       }`}
//                   >
//                     {category.status ? "Deactivate" : "Activate"}
//                   </Button>}
//                   {permiton?.delete && <Button
//                     onClick={() => handleDelete(category._id)}
//                     className="bg-red-500 text-red-600 hover:bg-red-100 px-3"
//                   >
//                     <i className="ri-delete-bin-line"></i>
//                   </Button>}
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>

//         {/* Add/Edit Category Modal */}
//         {showAddModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6">
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold">
//                     {editingCategory ? "Edit Category" : "Add New Category"}
//                   </h2>
//                   <button
//                     onClick={() => {
//                       setShowAddModal(false);
//                       resetForm();
//                     }}
//                     className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
//                   >
//                     <i className="ri-close-line"></i>
//                   </button>
//                 </div>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {/* Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category Name
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData, name: e.target.value,
//                           slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>

//                   {/* Slug */}
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Slug
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.slug}
//                       onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div> */}

//                   {/* Description */}
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       value={formData?.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       rows="3"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                       maxLength="500"
//                     />
//                   </div> */}

//                   {/* Image */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category Image
//                     </label>
//                     <div className="space-y-3">
//                       <div className="flex items-center space-x-2">
//                         <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
//                         <Button
//                           type="button"
//                           onClick={() => fileInputRef.current?.click()}
//                           className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
//                         >
//                           <i className="ri-upload-2-line"></i>
//                           <span>Upload Image</span>
//                         </Button>
//                       </div>

//                       {formData?.imagePreview && (
//                         <div className="relative">
//                           <img
//                             src={formData.imagePreview}
//                             alt="Category preview"
//                             className="w-full h-32 object-cover rounded-lg border border-gray-200"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setFormData({ ...formData, image: null, imagePreview: null, })}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//                           >
//                             <i className="ri-close-line"></i>
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Status */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status
//                     </label>
//                     <div className="relative">
//                       <select
//                         value={formData.status ? "Active" : "Inactive"}
//                         onChange={(e) =>
//                           setFormData({ ...formData, status: e.target.value === "Active", })
//                         }
//                         className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                       >
//                         <option value="Active">Active</option>
//                         <option value="Inactive">Inactive</option>
//                       </select>
//                       <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex space-x-3 pt-4">
//                     <Button
//                       type="button"
//                       onClick={() => {
//                         setShowAddModal(false);
//                         resetForm();
//                       }}
//                       className="flex-1 bg-gray-500 text-gray-700 hover:bg-gray-900"
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//                     >
//                       {isLoading ? editingCategory ? "Updating..." : "Adding..." : editingCategory ? "Update Category" : "Add Category"}
//                     </Button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }


import { useState, useRef, useEffect, useCallback } from "react";
import AdminLayout from "../../../../components/feature/AdminLayout";
import Card from "../../../../components/base/Card";
import Button from "../../../../components/base/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postData, getData } from "../../../../services/FetchNodeServices";
import Swal from "sweetalert2";

const DEFAULT_FORM = {
  name: "",
  slug: "",
  description: "",
  image: null,
  imagePreview: null,
  status: true,
};

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x200?text=No+Image";

export default function CategoriesManagement() {
  const [categories,       setCategories]       = useState([]);
  const [showAddModal,     setShowAddModal]      = useState(false);
  const [editingCategory,  setEditingCategory]   = useState(null);
  const [isLoading,        setIsLoading]         = useState(false);   // form submit loading
  const [fetchingList,     setFetchingList]      = useState(false);   // ✅ separate list loading
  const [permiton,         setPermiton]          = useState({});      // ✅ FIX: default {} not ''
  const [formData,         setFormData]          = useState(DEFAULT_FORM);

  const fileInputRef = useRef(null);

  // ✅ Read user once safely
  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("JeansUser")); }
    catch { return null; }
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingCategory(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ─── Fetch categories ──────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setFetchingList(true);
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
      console.error("fetchCategories:", error);
      toast.error("Error fetching categories");
    } finally {
      setFetchingList(false);
    }
  }, []);

  // ─── Fetch roles ───────────────────────────────────────────────────────────

  const fetchRoles = useCallback(async () => {
    if (!user?.role) return;
    try {
      const response = await postData("api/adminRole/get-single-role-by-role", {
        role: user.role,
      });
      setPermiton(response?.data?.[0]?.permissions?.categories || {});
    } catch (error) {
      console.error("fetchRoles:", error);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ─── Image upload ──────────────────────────────────────────────────────────

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  }, []);

  // ─── Submit (Add / Edit) ───────────────────────────────────────────────────

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
      uploadData.append("slug",   formData.slug);
      uploadData.append("status", formData.status);

      if (formData.description) {
        uploadData.append("description", formData.description.trim());
      }
      if (editingCategory) {
        uploadData.append("oldImages", editingCategory?.images?.[0] || "");
      }
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
        toast.success(
          response?.message ||
            (editingCategory ? "Category updated successfully" : "Category added successfully")
        );
        resetForm();
        setShowAddModal(false);
        fetchCategories(); // ✅ refresh after add/edit
      } else {
        toast.error(response?.message || "Error saving category");
      }
    } catch (error) {
      console.error("handleSubmit:", error);
      toast.error(error?.response?.message || "Error saving category");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Edit ──────────────────────────────────────────────────────────────────

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setFormData({
      name:         category.mainCategoryName || "",
      slug:         category.slug             || "",
      description:  category.description      || "",
      image:        category.images?.[0]      || null,
      imagePreview: category.images?.[0]      || null,
      status:       category.status ?? true,
    });
    setShowAddModal(true);
  }, []);

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result?.isConfirmed) return;

    try {
      const response = await postData(
        `api/mainCategory/delete-main-category/${id}`
      );
      if (response?.success) {
        toast.success("Category deleted successfully");
        fetchCategories(); // ✅ refresh after delete
      } else {
        toast.error(response?.message || "Error deleting category");
      }
    } catch (error) {
      console.error("handleDelete:", error);
      toast.error("Failed to delete the category");
    }
  }, [fetchCategories]);

  // ─── Toggle status ─────────────────────────────────────────────────────────

  const toggleStatus = useCallback(async (id, currentStatus) => {
    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: !currentStatus } : c))
    );
    try {
      // ✅ Send as FormData to match multipart route
      const uploadData = new FormData();
      uploadData.append("status", !currentStatus);

      const response = await postData(
        `api/mainCategory/update-main-category/${id}`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response?.success) {
        toast.success(`Category ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchCategories(); // ✅ sync with server after toggle
      } else {
        // Revert optimistic update on failure
        setCategories((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: currentStatus } : c))
        );
        toast.error(response?.message || "Error updating status");
      }
    } catch (error) {
      // Revert optimistic update
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: currentStatus } : c))
      );
      console.error("toggleStatus:", error);
      toast.error("Error updating status");
    }
  }, [fetchCategories]);

  // ─── Close modal ───────────────────────────────────────────────────────────

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [resetForm]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-1">Manage product categories with images</p>
          </div>
          {permiton?.write && (
            <Button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <i className="ri-add-line"></i>
              <span>Add Category</span>
            </Button>
          )}
        </div>

        {/* ✅ Loading skeleton */}
        {fetchingList ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4" />
                  <div className="bg-gray-200 h-3 rounded w-1/3" />
                  <div className="flex gap-2 mt-4">
                    <div className="bg-gray-200 h-8 rounded flex-1" />
                    <div className="bg-gray-200 h-8 rounded flex-1" />
                    <div className="bg-gray-200 h-8 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          // ✅ Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <i className="ri-folder-3-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-500">No categories found</h3>
            <p className="text-gray-400 text-sm mt-1">Add your first category to get started.</p>
            {permiton?.write && (
              <Button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="mt-4 bg-blue-600 text-white"
              >
                <i className="ri-add-line mr-1"></i>Add Category
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">

                {/* Image + status badge */}
                <div className="relative">
                  <img
                    src={category.images?.[0] || PLACEHOLDER_IMG}
                    alt={category.mainCategoryName}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    category.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {category.status ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{category.mainCategoryName}</h3>
                    <span className="text-sm text-gray-500">
                      {category.productsCount || 0} products
                    </span>
                  </div>

                  {/* ✅ Actions — fixed button color classes */}
                  <div className="flex space-x-2 pt-2 border-t border-gray-100">
                    {permiton?.update && (
                      <Button
                        onClick={() => handleEdit(category)}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                      >
                        <i className="ri-edit-line mr-1"></i>Edit
                      </Button>
                    )}
                    {permiton?.update && (
                      <Button
                        onClick={() => toggleStatus(category._id, category.status)}
                        className={`flex-1 text-sm ${
                          category.status
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        <i className={`mr-1 ${category.status ? "ri-pause-circle-line" : "ri-play-circle-line"}`}></i>
                        {category.status ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                    {permiton?.delete && (
                      <Button
                        onClick={() => handleDelete(category._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">

              {/* Modal header */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
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
                    placeholder="e.g. Men's Jeans"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Auto-generated slug (read-only preview) */}
                {formData.slug && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Slug (auto)</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono">
                      {formData.slug}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <i className="ri-upload-2-line"></i>
                      <span>{formData.imagePreview ? "Change Image" : "Upload Image"}</span>
                    </Button>

                    {formData.imagePreview && (
                      <div className="relative">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-36 object-cover rounded-lg border border-gray-200"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              image: null,
                              imagePreview: null,
                            }))
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status ? "Active" : "Inactive"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value === "Active" })
                      }
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        {editingCategory ? "Updating..." : "Adding..."}
                      </>
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Add Category"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}