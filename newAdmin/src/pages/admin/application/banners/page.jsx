import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/feature/AdminLayout";
import Card from "../../../../components/base/Card";
import Button from "../../../../components/base/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import { postData, getData } from "../../../../services/FetchNodeServices";

export default function BannersManagement() {
  const selectUrl = ["jeans", "shirts", "franchise", "allproducts"];

  const [banners, setBanners] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permiton, setPermiton] = useState('');
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const emptyForm = { title: "", image: "", status: "Active", startDate: "", endDate: "", position: "Home Hero", url: "", };

  const [formData, setFormData] = useState(emptyForm);
  console.log("USER==>", user)
  /** Reset Form */
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingBanner(null);
  };

  /** Fetch All Banners */
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await getData("api/banner");
      if (response?.success) {
        setBanners(response?.data);
      } else {
        toast.error(response?.message || "Failed to load banners");
      }
    } catch (error) {
      console.error("Fetch banners error:", error);
      toast.error("An error occurred while fetching banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();

  }, []);

  /** Submit Form (Add / Edit) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image && !editingBanner) {
      toast.error("Please select a banner image");
      return;
    }

    try {
      setIsLoading(true);
      const submitData = new FormData();
      submitData.append("name", formData.title);
      if (formData.image instanceof File) {
        submitData.append("images", formData.image);
      }
      submitData.append("url", formData.url);
      submitData.append("isActive", formData.status === "Active" ? true : false);
      submitData.append("position", formData.position);
      submitData.append("startDate", formData.startDate);
      submitData.append("endDate", formData.endDate);
      if (editingBanner) {
        submitData.append("oldImages", editingBanner?.images);
      }

      const apiUrl = editingBanner
        ? `api/banner/update/${editingBanner?._id}`
        : "api/banner/create";

      const response = await postData(apiUrl, submitData);
      if (response.status || response?.success === true) {
        toast.success(
          editingBanner ? "Banner updated successfully" : "Banner added successfully"
        );
        fetchBanners();
        resetForm();
        setShowAddModal(false);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong while saving banner");
    } finally {
      setIsLoading(false);
    }
  };

  /** Edit Banner */
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.name, image: banner.images, status: banner.isActive ? "Active" : "Inactive",
      startDate: banner.startDate, endDate: banner.endDate, position: banner.position, url: banner.url,
    });
    setShowAddModal(true);
  };

  /** Delete Banner (local only, you can add API call here) */
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

      // if (result?.isConfirmed) {
      //   const data = await getData(`api/banner/delete/${id}`);
      //   console.log("REASPONSE ALL BANNER", data)
      //   if (data?.success === true) {
      //     setBanners(banners.filter(banner => banner?._id !== id));
      //     toast.success("Banner deleted successfully");
      //   } else {
      //     toast.error("Banner deleted Failed");
      //   }

      // }
    } catch (error) {
      toast.error("Failed to delete the banner");
    }
  };

  /** Toggle Status */
  const toggleStatus = async (bannerId, banner) => {
    const updatedStatus = !banner.isActive

    try {
      const response = await postData('api/banner/change-status', {
        bannerId: bannerId,
        isActive: updatedStatus
      });

      if (response.success === true) {
        const updatedProducts = banners.map(banner => {
          if (banner._id === bannerId) {
            return { ...banner, isActive: updatedStatus };
          }
          return banner;
        });
        setBanners(updatedProducts);
        toast.success('Banner status updated successfully');
      }
    } catch (error) {
      toast.error("Error updating Banner status");
      console.error("Error updating Banner status:", error);
    }
  };
  const dateFormat = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("en-US", options);
    return formattedDate;
  }

  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
      setPermiton(response?.data[0]?.permissions?.banners)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [user?.role])
  console.log("hhhbanners:==>", banners)

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Banner Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage promotional banners and advertisements
            </p>
          </div>
          {permiton?.write && <Button
            onClick={() => {
              if (permiton?.write) {
                resetForm();
                setShowAddModal(true);
              } else {
                toast.error("You do not have permission to add banner");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Add Banner</span>
          </Button>}
        </div>

        {/* Banner Grid */}
        {banners.length === 0 ? (
          <p className="text-gray-500">No banners found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={typeof banner.image === "string" ? URL.createObjectURL(banner.images) : banner.images
                    }
                    alt={banner.title}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${banner.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {banner.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <span className="font-medium">{banner?.position || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shop URL:</span>
                      <span className="font-medium">{banner.url || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clicks:</span>
                      <span className="font-medium">{banner?.Clicks || 0}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">
                        {dateFormat(banner.startDate)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium">
                        {dateFormat(banner.endDate)}
                      </span>
                    </div>

                  </div>

                  <div className="flex space-x-2 mt-4">
                    {permiton.update && <Button
                      onClick={() => permiton.update ? handleEdit(banner) : alert("You don't have permission to edit this banner")}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                    >
                      <i className="ri-edit-line mr-1"></i>Edit
                    </Button>}
                    <Button
                      // onClick={() => toggleStatus(banner?._id, !banner?.isActive)}
                      onClick={() => toggleStatus(banner?._id, banner)}
                      className={`flex-1 text-sm ${banner?.isActive
                        ? "bg-red-600 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                    >
                      {banner?.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    {permiton.delete && <Button
                      onClick={() => permiton.delete ? handleDelete(banner?._id) : alert("You don't have permission to delete this banner")}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
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
                    {editingBanner ? "Edit Banner" : "Add New Banner"}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Image Upload + Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Upload
                    </label>
                    {formData.image && !(formData.image instanceof File) && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!editingBanner}
                    />
                  </div>

                  {/* Position & Shop URL */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Home Hero">Home Hero</option>
                        <option value="Category Top">Category Top</option>
                        <option value="Product Grid">Product Grid</option>
                        <option value="Footer">Footer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shop Banner (Page)
                      </label>
                      <select
                        value={formData.url}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            url: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">None</option>
                        {selectUrl.map((url) => (
                          <option key={url} value={url}>
                            {url}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isLoading
                        ? "Saving..."
                        : editingBanner
                          ? "Update Banner"
                          : "Add Banner"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout >
  );
}
