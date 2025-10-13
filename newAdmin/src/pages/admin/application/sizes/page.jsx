import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function SizesManagement() {
  const [sizes, setSizes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [formData, setFormData] = useState({ categoryId: '', size: '', status: true });

  const navigate = useNavigate();

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId?._id || item?.categoryId,
      size: item.size,
      status: item.status
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ categoryId: '', size: '', status: true });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (editingItem) {
        // Update existing size
        response = await postData(`api/size/update-size/${editingItem?._id}`, formData);
      } else {
        // Create new size
        response = await postData(`api/size/create-size`, formData);
      }

      if (response?.success) {
        toast.success(response.message);
        setShowModal(false);
        fetchSizes(currentPage); // Refresh the list
      } else {
        toast.error(response.message || "Error saving size!");
      }
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error saving size"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await getData(`api/size/delete-size/${id}`);
        if (response?.success) {
          toast.success(response.message);
          setSizes((prev) => prev.filter((size) => size._id !== id));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error deleting size"
        );
      }
    }
  };

  const toggleStatus = async (id) => {
    const size = sizes.find(s => s._id === id);
    if (!size) return;

    const updatedStatus = !size.status

    try {
      const response = await postData("api/size/change-status", {
        sizeId: id,
        status: updatedStatus,
      });

      if (response.success) {
        setSizes((prevSizes) =>
          prevSizes.map((size) =>
            size._id === id ? { ...size, status: updatedStatus } : size
          )
        );
        toast.success("Size status updated");
      }
    } catch (error) {
      toast.error("Error updating status");
      console.error("Status error:", error);
    }
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const fetchSizes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getData(`api/size/get-all-size-with-pagination?pageNumber=${page}`);
      console.log("SSSSSSSS", response)
      if (response.success) {
        setSizes(response.data || []);
      } else {
        toast.error("No sizes found");
      }
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error fetching sizes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await getData(
        "api/mainCategory/get-all-main-categorys-with-pagination"
      );
      if (response?.success) {
        setCategoriesList(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Group sizes by category for display
  const jeansSizes = sizes.filter(size =>
    size?.categoryId?.mainCategoryName === 'JEANS' ||
    size?.categoryId?.mainCategoryName?.toLowerCase().includes('JEANS')
  );

  const shirtSizes = sizes.filter(size =>
    size?.categoryId?.mainCategoryName === 'SHIRTS' ||
    size?.categoryId?.mainCategoryName?.toLowerCase().includes('SHIRTS')
  );

  // Other categories
  const otherSizes = sizes.filter(size => !jeansSizes.includes(size) && !shirtSizes.includes(size)
  );

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Size Management</h1>
            <p className="text-gray-600 mt-1">Manage available sizes for your products</p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <i className="ri-add-line mr-2"></i>
            {loading ? 'Loading...' : 'Add Size'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jeans Sizes */}
            {jeansSizes.length > 0 && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <i className="ri-scissors-line mr-2 text-blue-600"></i>
                    Jeans Sizes
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {jeansSizes.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{item.size}</div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            disabled={loading}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => toggleStatus(item._id)}
                            className={`text-sm ${item.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            disabled={loading}
                          >
                            <i className={`${item.status ? 'ri-pause-circle-line' : 'ri-play-circle-line'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                            disabled={loading}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Shirt Sizes */}
            {shirtSizes.length > 0 && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <i className="ri-shirt-line mr-2 text-green-600"></i>
                    Shirt Sizes
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {shirtSizes.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{item.size}</div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            disabled={loading}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => toggleStatus(item._id)}
                            className={`text-sm ${item.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            disabled={loading}
                          >
                            <i className={`${item.status ? 'ri-pause-circle-line' : 'ri-play-circle-line'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                            disabled={loading}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Other Sizes */}
            {otherSizes.length > 0 && (
              <Card className="lg:col-span-2">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <i className="ri-list-check mr-2 text-purple-600"></i>
                    Other Sizes
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {otherSizes.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-500 mb-1">{item?.categoryId?.mainCategoryName}</div>
                        <div className="text-lg font-bold text-gray-900">{item.size}</div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-center space-x-2">
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 text-sm" disabled={loading} >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button onClick={() => toggleStatus(item._id)} className={`text-sm ${item.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`} disabled={loading}                          >
                            <i className={`${item.status ? 'ri-pause-circle-line' : 'ri-play-circle-line'}`}></i>
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 text-sm" disabled={loading}                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Size' : 'Add Size'}
              </h2>
              <form onSubmit={handleSave}>
                <div className="space-y-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categoriesList.map((category) => (
                          <option key={category?._id} value={category?._id}>
                            {category?.mainCategoryName}
                          </option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter size" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}                  >
                    {isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                  </Button>
                  <Button onClick={() => setShowModal(false)} className="flex-1 bg-gray-900 hover:bg-gray-400 text-gray-800" disabled={isLoading}                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}