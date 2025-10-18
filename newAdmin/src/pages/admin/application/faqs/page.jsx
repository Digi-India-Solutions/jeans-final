import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function FAQsManagement() {
  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    isActive: true
  });
  const [filters, setFilters] = useState({
    isActive: '',
    search: ''
  });

  const navigate = useNavigate();

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      isActive: faq.isActive || true
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.question || !formData.answer) {
      toast.error("Please fill all required fields");
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (editingFaq) {
        // Update existing FAQ
        response = await postData(`api/faq/update-faq/${editingFaq._id}`, formData);
      } else {
        // Create new FAQ
        response = await postData('api/faq/create-faq', formData);
      }

      if (response.success) {
        toast.success(editingFaq ? "FAQ updated successfully" : "FAQ created successfully");
        setShowModal(false);
        fetchFaqs(); // Refresh the list
      } else {
        toast.error(response.message || (editingFaq ? "Error updating FAQ" : "Error creating FAQ"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await getData('api/faq/get-al-faq');
      console.log("HHH:==>", res);
      if (res.success) {
        setFaqs(res.faqs || []);
      } else {
        toast.error(res.message || "Failed to fetch FAQs");
      }
    } catch (error) {
      toast.error("Failed to fetch FAQs");
      console.error("Fetch FAQs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    console.log("68076baa44807102e5c2d9ca-", id, currentStatus);
    const newStatus = !currentStatus;

    try {
      const response = await postData(`api/faq/faq-status/${id}`, {
        isActive: newStatus
      });

      if (response.success) {
        toast.success(`Marked as ${newStatus ? 'Active' : 'Inactive'}`);
        fetchFaqs(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Toggle status error:", error);
    }
  };

  const deleteFaq = async (id) => {
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
        const res = await getData(`api/faq/delete-faq/${id}`);
        if (res.success) {
          toast.success("FAQ deleted successfully");
          fetchFaqs(); // Refresh the list
        } else {
          toast.error(res.message || "Failed to delete FAQ");
        }
      } catch (error) {
        Swal.fire('Error!', 'Something went wrong.', 'error');
        console.error('Delete error:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    return status
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const filteredFaqs = faqs.filter(faq => {
    return (
      (!filters.isActive || faq.isActive === (filters.isActive === 'true')) &&
      (!filters.search ||
        faq.question.toLowerCase().includes(filters.search.toLowerCase()) ||
        (faq.answer && faq.answer.toLowerCase().includes(filters.search.toLowerCase()))
      )
    );
  });

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="ri-add-line mr-2"></i>
              Add FAQ
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <i className="ri-question-line text-xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total FAQs</p>
                <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <i className="ri-check-line text-xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faqs.filter(f => f?.isActive === true).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <i className="ri-close-line text-xl text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faqs.filter(f => !f.isActive === true).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters?.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value={true} >Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* FAQs List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={faq._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(faq.status)}`}>
                          {faq.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>Updated: {formatDate(faq.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => handleEdit(faq)}
                        className="bg-blue-900 text-blue-600 hover:bg-blue-500 px-2 py-1 text-xs"
                      >
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button
                        onClick={() => toggleStatus(faq._id, faq?.isActive)}
                        className={`px-2 py-1 text-xs ${faq.isActive
                          ? 'bg-yellow-500 text-white-600 hover:bg-yellow-900'
                          : 'bg-green-500 text-green-600 hover:bg-green-900'
                          }`}
                      >
                        <i className={faq.isActive ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </Button>
                      <Button
                        onClick={() => deleteFaq(faq._id)}
                        className="bg-red-500 text-red-600 hover:bg-red-900 px-2 py-1 text-xs"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredFaqs.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="ri-question-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No FAQs found matching your criteria</p>
              </div>
            )}
          </>
        )}

        {/* Add/Edit FAQ Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingFaq(null);
                    }}
                    className="text-gray-800 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                      <input
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the frequently asked question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                      <textarea
                        value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        rows="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Provide a detailed answer to the question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select
                          value={formData?.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingFaq(null);
                        }} className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"  >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}                      >
                        {isLoading ? 'Saving...' : (editingFaq ? 'Update FAQ' : 'Add FAQ')}
                      </Button>
                    </div>
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