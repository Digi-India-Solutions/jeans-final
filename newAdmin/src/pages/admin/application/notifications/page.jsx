import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Empty form helpers (avoids repeating the same object literal) ────────────
const EMPTY_NOTIFICATION_FORM = { title: '', message: '', image: '' };
const EMPTY_TEMPLATE_FORM = { name: '', type: 'Promotional', subject: '', content: '', isActive: true };

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('notifications');

  // ✅ FIX: separate, properly-scoped loading states
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // ✅ FIX: track resend/delete per notification ID, not a single boolean
  const [resendingId, setResendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [notificationForm, setNotificationForm] = useState(EMPTY_NOTIFICATION_FORM);
  const [preview, setPreview] = useState('');

  const [templateForm, setTemplateForm] = useState(EMPTY_TEMPLATE_FORM);

  // ─── Fetch ────────────────────────────────────────────────────────────────────

  const fetchNotifications = async () => {
    try {
      setIsFetching(true);
      const response = await getData("api/notification/get-all-notification");
      if (response?.success) {
        setNotifications(response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ─── Notification CRUD ────────────────────────────────────────────────────────

  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast.error('Please fill out title and message.');
      return;
    }

    setIsSaving(true);
    try {
      let response = null;

      if (editingNotification) {
        // UPDATE
        const form = new FormData();
        form.append("title", notificationForm.title);
        form.append("body", notificationForm.message);
        if (notificationForm.image instanceof File) {
          form.append("image", notificationForm.image);
        }
        response = await postData(
          `api/notification/update-notification/${editingNotification._id}`,
          form
        );
      } else {
        // CREATE
        if (notificationForm.image instanceof File) {
          const data = new FormData();
          data.append('title', notificationForm.title);
          data.append('body', notificationForm.message);
          data.append('image', notificationForm.image);
          response = await postData("api/notification/create-notification", data, true);
        } else {
          response = await postData("api/notification/create-notification-without-image", {
            title: notificationForm.title,
            body: notificationForm.message,
          });
        }
      }

      if (response?.success) {
        toast.success(
          editingNotification ? 'Notification updated!' : 'Notification sent!'
        );
        fetchNotifications();
        closeNotificationModal();
      } else {
        toast.error(response?.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResend = async (id) => {
    try {
      setResendingId(id);
      const response = await getData(`api/notification/resend-notification/${id}`);
      if (response?.success) {
        toast.success(response?.message || "Notification resent successfully");
      } else {
        toast.error(response?.message || "Failed to resend notification");
      }
    } catch (error) {
      toast.error("Error resending notification");
      console.error("Error resending notification:", error);
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This notification will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      setDeletingId(id);
      const response = await getData(`api/notification/delete-notification/${id}`);
      if (response?.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        Swal.fire("Deleted!", "Notification has been deleted.", "success");
      } else {
        Swal.fire("Error!", response?.message || "Failed to delete notification.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "There was an error deleting the notification.", "error");
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Template CRUD (local state) ─────────────────────────────────────────────

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (editingTemplate) {
      setTemplates(prev =>
        prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t)
      );
    } else {
      setTemplates(prev => [...prev, { ...templateForm, id: Date.now() }]);
    }
    closeTemplateModal();
  };

  const deleteTemplate = (id) => {
    Swal.fire({
      title: "Delete template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(result => {
      if (result.isConfirmed) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    });
  };

  // ─── Modal helpers ────────────────────────────────────────────────────────────

  const openEditNotification = (notification) => {
    setEditingNotification(notification);
    setPreview(notification.image || '');
    setNotificationForm({
      title: notification.title,
      message: notification.body,
      image: '',           // file input always starts empty; preview shows existing URL
    });
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setEditingNotification(null);
    setNotificationForm(EMPTY_NOTIFICATION_FORM);
    setPreview('');        // ✅ FIX: reset preview on close
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateForm(EMPTY_TEMPLATE_FORM);
  };

  // ─── File input ───────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }
    setNotificationForm(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  // ─── Utilities ────────────────────────────────────────────────────────────────

  const getTypeColor = (type) => {
    const colors = {
      'Promotional': 'bg-purple-100 text-purple-800',
      'Transactional': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
            <p className="text-gray-600 mt-1">Manage Firebase push notifications and templates</p>
          </div>
          <div className="flex space-x-3">
            {/* ✅ FIX: correct label and handler per active tab */}
            {/* {activeTab === 'notifications' ? ( */}
              <Button
                onClick={() => setShowNotificationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <i className="ri-notification-line mr-2"></i>
                Send Push Notification
              </Button>
            {/* ) : (
              <Button
                onClick={() => setShowTemplateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <i className="ri-add-line mr-2"></i>
                Add Template
              </Button>
            )} */}
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-6 w-fit">
          {['notifications',].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-white hover:text-gray-300'
                }`}
            >
              {tab === 'notifications' ? 'Push Notifications' : 'Templates'}
            </button>
          ))}
        </div>

        {/* ── Notifications Tab ───────────────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Body', 'Image', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isFetching ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>Loading…
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                        No notifications yet
                      </td>
                    </tr>
                  ) : (
                    notifications.map(notification => (
                      <tr key={notification._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 max-w-xs line-clamp-2">
                            {notification.body}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {notification?.image ? (
                            <img
                              src={notification.image}
                              alt="notification"
                              className="w-10 h-10 object-cover rounded border border-gray-200"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* ✅ FIX: per-row loading — only the clicked row shows spinner */}
                            <Button
                              onClick={() => handleResend(notification._id)}
                              disabled={resendingId === notification._id}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1 disabled:opacity-60"
                            >
                              {resendingId === notification._id ? (
                                <><i className="ri-loader-4-line animate-spin mr-1"></i>Resending…</>
                              ) : 'Resend'}
                            </Button>
                            <Button
                              onClick={() => openEditNotification(notification)}
                              className="bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs px-2 py-1"
                            >
                              Edit
                            </Button>
                            {/* ✅ FIX: correct text color on red background */}
                            <Button
                              onClick={() => handleDelete(notification._id)}
                              disabled={deletingId === notification._id}
                              className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1 disabled:opacity-60"
                            >
                              {deletingId === notification._id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : 'Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── Templates Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-3 text-center py-12">
                No templates yet — click "Add Template" to create one.
              </p>
            ) : templates.map(template => (
              <Card key={template.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-xs text-gray-500">Subject:</span>
                    <p className="text-sm font-medium text-gray-900 truncate">{template.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Content:</span>
                    <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditTemplate(template)}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                  >
                    <i className="ri-edit-line mr-1"></i>Edit
                  </Button>
                  {/* ✅ FIX: correct color — white text on red bg */}
                  <Button
                    onClick={() => deleteTemplate(template.id)}
                    className="bg-red-500 text-white hover:bg-red-600 px-3"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Notification Modal ──────────────────────────────────────────────── */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingNotification ? 'Edit Push Notification' : 'Send Push Notification'}
                  </h2>
                  <button
                    onClick={closeNotificationModal}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={e => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Notification title…"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {notificationForm.title.length}/50
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={notificationForm.message}
                      onChange={e => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Your notification message…"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {notificationForm.message.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image <span className="text-gray-400 font-normal">(optional, max 2 MB)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer p-2"
                    />
                    {preview && (
                      <div className="mt-3 relative inline-block">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-28 h-28 rounded-lg object-cover border border-gray-300"
                        />
                        {/* ✅ Allow clearing the selected image */}
                        <button
                          type="button"
                          onClick={() => { setPreview(''); setNotificationForm(prev => ({ ...prev, image: '' })); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={closeNotificationModal}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendNotification}
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      <i className="ri-send-plane-line mr-2"></i>
                      {isSaving
                        ? (editingNotification ? 'Updating…' : 'Sending…')
                        : (editingNotification ? 'Update Notification' : 'Send Notification')
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Template Modal ──────────────────────────────────────────────────── */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingTemplate ? 'Edit Template' : 'Add New Template'}
                  </h2>
                  <button
                    onClick={closeTemplateModal}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={e => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="relative">
                      <select
                        value={templateForm.type}
                        onChange={e => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Promotional">Promotional</option>
                        <option value="Transactional">Transactional</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={e => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Use {{variable}} for dynamic content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={templateForm.content}
                      onChange={e => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Use {{variable}} for dynamic content"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={templateForm.isActive}
                      onChange={e => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active template
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={closeTemplateModal}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveTemplate}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingTemplate ? 'Update Template' : 'Add Template'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}