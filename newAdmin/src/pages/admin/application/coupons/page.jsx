import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: "", 
    discount: "", 
    couponTitle: "", 
    minCartAmount: "",
    status: true
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      couponCode: item.couponCode || "",
      discount: item.discount || "",
      couponTitle: item.couponTitle || "",
      minCartAmount: item.minCartAmount || "",
      status: item.status || true
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      couponCode: "", 
      discount: "", 
      couponTitle: "", 
      minCartAmount: "",
      status: true
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.couponCode || !formData.discount || !formData.couponTitle || !formData.minCartAmount) {
      toast.error("Please fill all required fields");
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (editingItem) {
        // Update existing coupon
        response = await postData(`api/coupon/update-coupon/${editingItem._id}`, formData);
      } else {
        // Create new coupon
        response = await postData("api/coupon/create-coupon", formData);
      }
      
      if (response?.success) {
        toast.success(response?.message || (editingItem ? "Coupon updated successfully" : "Coupon created successfully"));
        setShowModal(false);
        fetchCoupons(); // Refresh the list
      } else {
        toast.error(response?.message || (editingItem ? "Error updating coupon" : "Error creating coupon"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (editingItem ? "Error updating coupon" : "Error creating coupon"));
      console.error("Error saving coupon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await getData('api/coupon/get-All-coupons');
      if (response?.success) {
        setCoupons(response?.coupons || []);
      } else {
        toast.error(response?.message || "Failed to fetch coupons");
      }
    } catch (error) {
      toast.error('Error fetching coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle Delete Action
  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await getData(`api/coupon/delete-coupon/${id}`);
        if (response.success === true) {
          setCoupons(coupons.filter(coupon => coupon._id !== id));
          Swal.fire('Deleted!', 'Your coupon has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error!', 'There was an error deleting the coupon.', 'error');
        console.error('Error deleting coupon:', error);
      }
    }
  };

  // Handle status toggle
  const toggleStatus = async (id) => {
    const coupon = coupons.find(c => c._id === id);
    if (!coupon) return;
    
    const updatedStatus = !coupon.status;
    
    try {
      const response = await postData('api/coupon/change-status', {
        couponId: id,
        status: updatedStatus,
      });

      if (response.success) {
        // Update the status in the local state
        const updatedCoupons = coupons.map(coupon => {
          if (coupon._id === id) {
            return { ...coupon, status: updatedStatus };
          }
          return coupon;
        });
        setCoupons(updatedCoupons);
        toast.success('Coupon status updated successfully');
      }
    } catch (error) {
      toast.error("Error updating coupon status");
      console.error("Error updating coupon status:", error);
    }
  };

  const getStatusColor = (status) => {
    return status 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <i className="ri-add-line mr-2"></i>
            Create Coupon
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min. Cart Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.couponCode}</div>
                          <div className="text-sm text-gray-500">{item.couponTitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{item.discount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{item.minCartAmount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => toggleStatus(item._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <i className={item.status ? 'ri-pause-line' : 'ri-play-line'}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <form onSubmit={handleSave}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., WELCOME10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Title *</label>
                    <input
                      type="text"
                      value={formData.couponTitle}
                      onChange={(e) => setFormData({ ...formData, couponTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Welcome Discount"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (₹) *</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Cart Amount (₹) *</label>
                    <input
                      type="number"
                      value={formData.minCartAmount}
                      onChange={(e) => setFormData({ ...formData, minCartAmount: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                  </Button>
                  <Button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                    disabled={isLoading}
                  >
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