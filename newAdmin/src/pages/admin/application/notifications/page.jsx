import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { getData, postData } from '../../../../services/FetchNodeServices';
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [firebaseSettings, setFirebaseSettings] = useState({ apiKey: '', projectId: '', messagingSenderId: '', appId: '', serverKey: '' });

  const [isEditingFirebase, setIsEditingFirebase] = useState(false);
  const [firebaseSaved, setFirebaseSaved] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(false)
  const [isResend, setIsResend] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    // type: 'Promotional',
    // targetAudience: 'All Users',
    // scheduledDate: '',
    // scheduledTime: '',
    image: ''
  });
  const [preview, setPreview] = useState('');
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'Promotional',
    subject: '',
    content: '',
    isActive: true
  });

  // Load Firebase settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('firebaseSettings');
    if (savedSettings) {
      setFirebaseSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveFirebase = () => {
    // Save to localStorage
    localStorage.setItem('firebaseSettings', JSON.stringify(firebaseSettings));
    setIsEditingFirebase(false);
    setFirebaseSaved(true);

    // Show success message temporarily
    setTimeout(() => {
      setFirebaseSaved(false);
    }, 3000);
  };

  const testFirebaseConnection = () => {
    // Mock connection test
    if (!firebaseSettings.projectId || !firebaseSettings.apiKey) {
      alert('Please configure Firebase settings first!');
      return;
    }
    alert('Testing Firebase connection...\n\nConnection Status: Success ✓\nProject ID: ' + firebaseSettings.projectId + '\nMessaging: Enabled');
  };

  const handleSendNotification = async () => {

    if (!notificationForm.title || !notificationForm.message) return alert('Please fill out all fields.');
    setIsLoading(true)
    let response = null;
    if (editingNotification) {
      const form = new FormData();
      form.append("title", notificationForm.title);
      form.append("body", notificationForm.message);
      if (notificationForm.image) {
        form.append("image", notificationForm.image);
      }
      response = await postData(`api/notification/update-notification/${editingNotification._id}`, form);

    } else {

      if (notificationForm?.image) {
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

      setIsLoading(true)
      console.log("data:==>", response);

    }
    fetchNotifications()
    setNotificationForm({
      title: '',
      message: '',
      image: ''
    });
    setEditingNotification(null);
    setShowNotificationModal(false);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(template =>
        template.id === editingTemplate.id
          ? { ...template, ...templateForm }
          : template
      ));
    } else {
      setTemplates(prev => [...prev, {
        ...templateForm,
        id: Date.now()
      }]);
    }

    setTemplateForm({
      name: '',
      type: 'Promotional',
      subject: '',
      content: '',
      isActive: true
    });
    setEditingTemplate(null);
    setShowTemplateModal(false);
  };

  const getRecipientCount = (audience) => {
    const counts = {
      'All Users': 2847,
      'Active Users': 1523,
      'B2B Clients': 156,
      'Retail Customers': 2691,
      'Specific Users': 1
    };
    return counts[audience] || 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Sent': 'bg-green-100 text-green-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Promotional': 'bg-purple-100 text-purple-800',
      'Transactional': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setPreview(notification.image);
    setNotificationForm({
      title: notification.title,
      message: notification.body,
      // type: notification.type,
      // targetAudience: notification.targetAudience,
      // scheduledDate: notification.scheduledDate,
      // scheduledTime: '10:00',
      image: '',
      preview: notification.image || ''
    });
    setShowNotificationModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowTemplateModal(true);
  };


  const deleteTemplate = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(template => template.id !== id));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setNotificationForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getData("api/notification/get-all-notification");
      console.log("SSSSSSXXXXXXXSSSSSSS:-->", response);
      if (response?.success) {
        setNotifications(response?.data || []);
      }
    } catch (error) {
      // toast.error("Error fetching notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResend = async (id) => {
    try {

      setIsResend(true)
      const response = await getData(`api/notification/resend-notification/${id}`);
      if (response?.success) {
        setIsResend(false)
        toast.success(response?.message || "Notification resent successfully");
      } else {
        setIsResend(false)
        toast.error(response?.message || "Failed to resend notification");
      }
      setIsResend(false)
    } catch (error) {
      toast.error("Error resending notification");
      setIsResend(false)
      console.error("Error resending notification:", error);
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

    if (confirmDelete.isConfirmed) {
      try {
        setIsDelete(true)
        const response = await getData(`api/notification/delete-notification/${id}`);
        if (response?.success) {
          setIsDelete(false)
          setNotifications((prev) => prev.filter((n) => n?._id !== id));
          Swal.fire("Deleted!", "Notification has been deleted.", "success");
        }
      } catch (error) {
        setIsDelete(false)
        Swal.fire("Error!", "There was an error deleting the notification.", "error");
        console.error("Error deleting notification:", error);
      } finally {
        // setDeleteActionLoading(null);
      }
      setIsDelete(false)
    }
  };

  console.log("DDDDDD:==>", notificationForm)
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
            <p className="text-gray-600 mt-1">Manage Firebase push notifications and templates</p>
          </div>
          <div className="flex space-x-3">
            {/* <Button
              onClick={() => setShowFirebaseModal(true)}
              variant="outline"
              size="md"
            >
              <i className="ri-settings-line mr-2"></i>
              Firebase Config
            </Button> */}
            {activeTab === 'notifications' ? (
              <Button onClick={() => setShowNotificationModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="ri-notification-line mr-2"></i>
                {/* Send Push Notification */}
                Add Template
              </Button>
            ) : (
              <Button onClick={() => setShowTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="ri-add-line mr-2"></i>
                Add Template
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'notifications'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-white '
              }`}
          >
            Push Notifications
          </button>
          {/* <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'templates'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-white hover:text-white'
              }`}
          >
            Message Templates
          </button> */}
        </div>

        {activeTab === 'notifications' && (
          <>
            {/* Summary Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <i className="ri-notification-line text-xl text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {notifications.filter(n => n.status === 'Sent').length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <i className="ri-eye-line text-xl text-green-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(notifications.reduce((sum, n) => sum + n.openRate, 0) / notifications.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <i className="ri-cursor-line text-xl text-purple-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg. Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(notifications.reduce((sum, n) => sum + n.clickRate, 0) / notifications.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <i className="ri-time-line text-xl text-orange-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {notifications.filter(n => n.status === 'Scheduled').length}
                    </p>
                  </div>
                </div>
              </Card>
            </div> */}

            {/* Notifications Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Body
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        image
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notifications.map(notification => (
                      <tr key={notification._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            {/* <div className="text-sm text-gray-500 max-w-xs truncate">{notification.message}</div> */}
                            {/* <div className="text-xs text-gray-400 mt-1">
                              Scheduled: {notification.scheduledDate}
                              {notification.sentDate && ` • Sent: ${notification.sentDate}`}
                            </div> */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {/* <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            <div className="text-sm text-gray-600 mt-1">{notification.targetAudience}</div> */}
                            <div className="text-xs text-gray-500">{notification.body}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900"><img src={notification?.image} alt="" style={{ width: 20, height: 20 }} /></div>
                            {/* <div className="text-sm text-gray-900">Open: {notification.openRate}%</div> */}
                            {/* <div className="text-sm text-gray-600">Click: {notification.clickRate}%</div> */}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleResend(notification?._id)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                              {isResend ? 'Resending...' : 'Resend'}
                            </Button>
                            <Button
                              onClick={() => handleEditNotification(notification)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(notification._id)}
                              className="bg-red-500 text-red-600 hover:bg-red-900 text-xs px-2 py-1"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                    </div>
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
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
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1 bg-blue-500 text-blue-600 hover:bg-blue-900 text-sm"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteTemplate(template.id)}
                      className="bg-red-500 text-red-600 hover:bg-red-900 px-3"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Firebase Configuration Modal */}
        {/* {showFirebaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Firebase Configuration</h2>
                  <button
                    onClick={() => setShowFirebaseModal(false)}
                    className="text-gray-900 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {firebaseSaved && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-check-circle-line text-green-600 mr-2"></i>
                      <span className="text-green-800">Firebase settings saved successfully!</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firebase API Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={isEditingFirebase ? 'text' : 'password'}
                      value={firebaseSettings.apiKey}
                      onChange={(e) => setFirebaseSettings({ ...firebaseSettings, apiKey: e.target.value })}
                      onFocus={() => setIsEditingFirebase(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AIzaSyBOti4mM-6x9WDnZIj..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firebaseSettings.projectId}
                      onChange={(e) => setFirebaseSettings({ ...firebaseSettings, projectId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="my-garments-app"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Messaging Sender ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firebaseSettings.messagingSenderId}
                      onChange={(e) => setFirebaseSettings({ ...firebaseSettings, messagingSenderId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firebaseSettings.appId}
                      onChange={(e) => setFirebaseSettings({ ...firebaseSettings, appId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1:123456789012:web:abcdef..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Server Key (FCM) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={isEditingFirebase ? 'text' : 'password'}
                      value={firebaseSettings.serverKey}
                      onChange={(e) => setFirebaseSettings({ ...firebaseSettings, serverKey: e.target.value })}
                      onFocus={() => setIsEditingFirebase(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AAAABBBBcccc:APA91bE..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setShowFirebaseModal(false)}
                      className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={testFirebaseConnection}
                      className="bg-green-900 text-white hover:bg-green-900"
                      disabled={!firebaseSettings.projectId || !firebaseSettings.apiKey}
                    >
                      <i className="ri-wifi-line mr-2"></i>
                      Test Connection
                    </Button>
                    <Button
                      onClick={handleSaveFirebase}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <i className="ri-save-line mr-2"></i>
                      Save Config
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingNotification ? 'Edit Push Notification' : 'Send Push Notification'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setEditingNotification(null);
                      setNotificationForm({
                        title: '',
                        message: '',
                        type: 'Promotional',
                        targetAudience: 'All Users',
                        scheduledDate: '',
                        scheduledTime: '',
                        image: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Notification title..."
                      maxLength="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={notificationForm?.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Your notification message..."
                      maxLength="200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {notificationForm?.message?.length}/200 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image (optional)
                    </label>

                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer p-2" />

                    {preview && (
                      <div className="mt-3">
                        <img src={preview} alt="Preview" className="w-28 h-28 rounded-lg object-cover border border-gray-300" />
                      </div>
                    )}
                  </div>
                  {/* {activeTab === 'notifications'}    <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="relative">
                        <select
                          value={notificationForm.type}
                          onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="Promotional">Promotional</option>
                          <option value="Transactional">Transactional</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                      <div className="relative">
                        <select
                          value={notificationForm.targetAudience}
                          onChange={(e) => setNotificationForm({...notificationForm, targetAudience: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="All Users">All Users ({getRecipientCount('All Users')})</option>
                          <option value="Active Users">Active Users ({getRecipientCount('Active Users')})</option>
                          <option value="B2B Clients">B2B Clients ({getRecipientCount('B2B Clients')})</option>
                          <option value="Retail Customers">Retail Customers ({getRecipientCount('Retail Customers')})</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div> */}

                  {/* <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
                      <input
                        type="date"
                        value={notificationForm.scheduledDate}
                        onChange={(e) => setNotificationForm({...notificationForm, scheduledDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
                      <input
                        type="time"
                        value={notificationForm.scheduledTime}
                        onChange={(e) => setNotificationForm({...notificationForm, scheduledTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                      type="url"
                      value={notificationForm.image}
                      onChange={(e) => setNotificationForm({...notificationForm, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div> */}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowNotificationModal(false);
                        setEditingNotification(null);
                        setNotificationForm({
                          title: '',
                          message: '',
                          type: 'Promotional',
                          targetAudience: 'All Users',
                          scheduledDate: '',
                          scheduledTime: '',
                          image: ''
                        });
                      }}
                      className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendNotification}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <i className="ri-send-plane-line mr-2"></i>
                      {editingNotification ? isLoading ? 'Updating...' : 'Update Notification' : isLoading ? 'Sending...' : 'Send Notification'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingTemplate ? 'Edit Template' : 'Add New Template'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      setEditingTemplate(null);
                      setTemplateForm({
                        name: '',
                        type: 'Promotional',
                        subject: '',
                        content: '',
                        isActive: true
                      });
                    }}
                    className="text-gray-900 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="relative">
                      <select
                        value={templateForm.type}
                        onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Promotional">Promotional</option>
                        <option value="Transactional">Transactional</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Use {{variable}} for dynamic content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Use {{variable}} for dynamic content"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={templateForm.isActive}
                      onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active template
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowTemplateModal(false);
                        setEditingTemplate(null);
                        setTemplateForm({
                          name: '',
                          type: 'Promotional',
                          subject: '',
                          content: '',
                          isActive: true
                        });
                      }}
                      className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"
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
