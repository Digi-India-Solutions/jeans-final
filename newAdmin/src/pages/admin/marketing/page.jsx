
import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function MarketingManagement() {
  const [activeTab, setActiveTab] = useState('notifications');
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Summer Collection Launch',
      message: 'Check out our latest premium jeans and shirts collection with 20% off!',
      type: 'Promotional',
      audience: 'All Users',
      status: 'Sent',
      sentDate: '2024-01-15',
      recipients: 1250,
      opened: 890,
      clicked: 234
    },
    {
      id: 2,
      title: 'B2B Special Discount',
      message: 'Exclusive wholesale pricing for bulk orders. Contact us for custom quotes.',
      type: 'B2B Offer',
      audience: 'B2B Customers',
      status: 'Scheduled',
      sentDate: '2024-01-20',
      recipients: 156,
      opened: 0,
      clicked: 0
    },
    {
      id: 3,
      title: 'Weekend Sale Alert',
      message: 'Flash sale this weekend! Up to 50% off on selected items.',
      type: 'Flash Sale',
      audience: 'Active Users',
      status: 'Draft',
      sentDate: '',
      recipients: 0,
      opened: 0,
      clicked: 0
    }
  ]);

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Inactive User Re-engagement',
      type: 'WhatsApp',
      target: 'Inactive 30 days',
      message: 'We miss you! Come back and get 15% off on your next purchase.',
      status: 'Active',
      startDate: '2024-01-10',
      endDate: '2024-01-25',
      sent: 340,
      responses: 89,
      conversions: 23
    },
    {
      id: 2,
      name: 'New Product Launch Email',
      type: 'Email',
      target: 'All Subscribers',
      message: 'Introducing our new denim collection with premium quality fabric.',
      status: 'Completed',
      startDate: '2024-01-05',
      endDate: '2024-01-12',
      sent: 2150,
      responses: 456,
      conversions: 78
    },
    {
      id: 3,
      name: 'B2B Customer Follow-up',
      type: 'SMS',
      target: 'B2B Inactive 60 days',
      message: 'Special wholesale rates available. Call us for bulk order discounts.',
      status: 'Scheduled',
      startDate: '2024-01-18',
      endDate: '2024-01-30',
      sent: 0,
      responses: 0,
      conversions: 0
    }
  ]);

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'SUMMER20',
      title: 'Summer Collection Discount',
      type: 'Percentage',
      value: 20,
      minOrder: 2000,
      maxDiscount: 1000,
      usageLimit: 500,
      usageCount: 234,
      status: 'Active',
      startDate: '2024-01-10',
      endDate: '2024-03-31',
      applicableProducts: 'All'
    },
    {
      id: 2,
      code: 'B2BSPECIAL',
      title: 'B2B Bulk Order Discount',
      type: 'Fixed',
      value: 500,
      minOrder: 10000,
      maxDiscount: 2000,
      usageLimit: 100,
      usageCount: 45,
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      applicableProducts: 'Jeans, Shirts'
    },
    {
      id: 3,
      code: 'FIRST15',
      title: 'First Time Buyer Discount',
      type: 'Percentage',
      value: 15,
      minOrder: 1500,
      maxDiscount: 500,
      usageLimit: 1000,
      usageCount: 89,
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      applicableProducts: 'All'
    }
  ]);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'Promotional',
    audience: 'All Users',
    scheduleDate: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'WhatsApp',
    target: 'All Users',
    message: '',
    startDate: '',
    endDate: ''
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    type: 'Percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    applicableProducts: 'All'
  });

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      id: editingItem ? editingItem.id : Date.now(),
      ...notificationForm,
      status: notificationForm.scheduleDate ? 'Scheduled' : 'Draft',
      sentDate: notificationForm.scheduleDate || '',
      recipients: 0,
      opened: 0,
      clicked: 0
    };

    if (editingItem) {
      setNotifications(notifications.map(n => n.id === editingItem.id ? newNotification : n));
    } else {
      setNotifications([newNotification, ...notifications]);
    }

    setNotificationForm({
      title: '',
      message: '',
      type: 'Promotional',
      audience: 'All Users',
      scheduleDate: ''
    });
    setShowNotificationModal(false);
    setEditingItem(null);
  };

  const handleCampaignSubmit = (e) => {
    e.preventDefault();
    const newCampaign = {
      id: editingItem ? editingItem.id : Date.now(),
      ...campaignForm,
      status: 'Scheduled',
      sent: 0,
      responses: 0,
      conversions: 0
    };

    if (editingItem) {
      setCampaigns(campaigns.map(c => c.id === editingItem.id ? newCampaign : c));
    } else {
      setCampaigns([newCampaign, ...campaigns]);
    }

    setCampaignForm({
      name: '',
      type: 'WhatsApp',
      target: 'All Users',
      message: '',
      startDate: '',
      endDate: ''
    });
    setShowCampaignModal(false);
    setEditingItem(null);
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const newCoupon = {
      id: editingItem ? editingItem.id : Date.now(),
      ...couponForm,
      value: parseFloat(couponForm.value),
      minOrder: parseFloat(couponForm.minOrder) || 0,
      maxDiscount: parseFloat(couponForm.maxDiscount) || 0,
      usageLimit: parseInt(couponForm.usageLimit) || 0,
      usageCount: editingItem ? editingItem.usageCount : 0,
      status: 'Active'
    };

    if (editingItem) {
      setCoupons(coupons.map(c => c.id === editingItem.id ? newCoupon : c));
    } else {
      setCoupons([newCoupon, ...coupons]);
    }

    setCouponForm({
      code: '',
      title: '',
      type: 'Percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      applicableProducts: 'All'
    });
    setShowCouponModal(false);
    setEditingItem(null);
  };

  const sendNotification = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id
        ? {
            ...n,
            status: 'Sent',
            sentDate: new Date().toISOString().split('T')[0],
            recipients: Math.floor(Math.random() * 1000) + 500,
            opened: Math.floor(Math.random() * 500) + 200,
            clicked: Math.floor(Math.random() * 200) + 50
          }
        : n
    ));
  };

  const toggleCouponStatus = (id) => {
    setCoupons(coupons.map(c =>
      c.id === id
        ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' }
        : c
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Sent': 'bg-green-100 text-green-800',
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing & Communication</h1>
            <p className="text-gray-600 mt-1">Manage campaigns, notifications, and promotional activities</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="ri-notification-line mr-2"></i>
            Push Notifications
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'campaigns'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="ri-mail-send-line mr-2"></i>
            SMS/Email Campaigns
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="ri-coupon-line mr-2"></i>
            Coupons & Offers
          </button>
        </div>

        {/* Push Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setShowNotificationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>Create Notification</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {notifications.map(notification => (
                <Card key={notification.id}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Type: {notification.type}</span>
                          <span>Audience: {notification.audience}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>

                    {notification.status === 'Sent' && (
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{notification.recipients}</div>
                          <div className="text-xs text-gray-500">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{notification.opened}</div>
                          <div className="text-xs text-gray-500">Opened</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{notification.clicked}</div>
                          <div className="text-xs text-gray-500">Clicked</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>
                        {notification.sentDate 
                          ? `${notification.status === 'Scheduled' ? 'Scheduled for' : 'Sent on'}: ${notification.sentDate}`
                          : 'Not scheduled'
                        }
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {notification.status === 'Draft' && (
                        <Button
                          onClick={() => sendNotification(notification.id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700 text-sm"
                        >
                          <i className="ri-send-plane-line mr-1"></i>
                          Send Now
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setEditingItem(notification);
                          setNotificationForm({
                            title: notification.title,
                            message: notification.message,
                            type: notification.type,
                            audience: notification.audience,
                            scheduleDate: notification.sentDate
                          });
                          setShowNotificationModal(true);
                        }}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setNotifications(notifications.filter(n => n.id !== notification.id));
                        }}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setShowCampaignModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>Create Campaign</span>
              </Button>
            </div>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Marketing Campaigns</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Target</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map(campaign => (
                        <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-600 max-w-xs truncate">{campaign.message}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.type === 'WhatsApp' 
                                ? 'bg-green-100 text-green-800' 
                                : campaign.type === 'Email'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {campaign.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{campaign.target}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              <div>{campaign.startDate}</div>
                              <div>to {campaign.endDate}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>Sent: <span className="font-medium">{campaign.sent}</span></div>
                              <div>Responses: <span className="font-medium text-green-600">{campaign.responses}</span></div>
                              <div>Conversions: <span className="font-medium text-blue-600">{campaign.conversions}</span></div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  setEditingItem(campaign);
                                  setCampaignForm({
                                    name: campaign.name,
                                    type: campaign.type,
                                    target: campaign.target,
                                    message: campaign.message,
                                    startDate: campaign.startDate,
                                    endDate: campaign.endDate
                                  });
                                  setShowCampaignModal(true);
                                }}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                                }}
                                className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
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
              </div>
            </Card>
          </>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setShowCouponModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>Create Coupon</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {coupons.map(coupon => (
                <Card key={coupon.id}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{coupon.code}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                            {coupon.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{coupon.title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Discount:</span>
                        <p className="font-semibold text-green-600">
                          {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Min Order:</span>
                        <p className="font-semibold">₹{coupon.minOrder.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Usage:</span>
                        <p className="font-semibold">{coupon.usageCount}/{coupon.usageLimit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Max Discount:</span>
                        <p className="font-semibold">₹{coupon.maxDiscount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Valid Period:</span>
                      <p className="text-sm text-gray-700">{coupon.startDate} to {coupon.endDate}</p>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Applicable Products:</span>
                      <p className="text-sm text-gray-700">{coupon.applicableProducts}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          setEditingItem(coupon);
                          setCouponForm({
                            code: coupon.code,
                            title: coupon.title,
                            type: coupon.type,
                            value: coupon.value.toString(),
                            minOrder: coupon.minOrder.toString(),
                            maxDiscount: coupon.maxDiscount.toString(),
                            usageLimit: coupon.usageLimit.toString(),
                            startDate: coupon.startDate,
                            endDate: coupon.endDate,
                            applicableProducts: coupon.applicableProducts
                          });
                          setShowCouponModal(true);
                        }}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        onClick={() => toggleCouponStatus(coupon.id)}
                        className={`flex-1 text-sm ${
                          coupon.status === 'Active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {coupon.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        onClick={() => {
                          setCoupons(coupons.filter(c => c.id !== coupon.id));
                        }}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingItem ? 'Edit Notification' : 'Create Push Notification'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setEditingItem(null);
                      setNotificationForm({
                        title: '',
                        message: '',
                        type: 'Promotional',
                        audience: 'All Users',
                        scheduleDate: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleNotificationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength="500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="relative">
                        <select
                          value={notificationForm.type}
                          onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="Promotional">Promotional</option>
                          <option value="B2B Offer">B2B Offer</option>
                          <option value="Flash Sale">Flash Sale</option>
                          <option value="News">News</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                      <div className="relative">
                        <select
                          value={notificationForm.audience}
                          onChange={(e) => setNotificationForm({...notificationForm, audience: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="All Users">All Users</option>
                          <option value="B2B Customers">B2B Customers</option>
                          <option value="Retail Customers">Retail Customers</option>
                          <option value="Active Users">Active Users</option>
                          <option value="Inactive Users">Inactive Users</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={notificationForm.scheduleDate}
                      onChange={(e) => setNotificationForm({...notificationForm, scheduleDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNotificationModal(false);
                        setEditingItem(null);
                        setNotificationForm({
                          title: '',
                          message: '',
                          type: 'Promotional',
                          audience: 'All Users',
                          scheduleDate: ''
                        });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'} Notification
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingItem ? 'Edit Campaign' : 'Create Marketing Campaign'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      setEditingItem(null);
                      setCampaignForm({
                        name: '',
                        type: 'WhatsApp',
                        target: 'All Users',
                        message: '',
                        startDate: '',
                        endDate: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleCampaignSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="relative">
                        <select
                          value={campaignForm.type}
                          onChange={(e) => setCampaignForm({...campaignForm, type: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                          <option value="SMS">SMS</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                      <div className="relative">
                        <select
                          value={campaignForm.target}
                          onChange={(e) => setCampaignForm({...campaignForm, target: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="All Users">All Users</option>
                          <option value="B2B Customers">B2B Customers</option>
                          <option value="Retail Customers">Retail Customers</option>
                          <option value="Inactive 30 days">Inactive 30 days</option>
                          <option value="Inactive 60 days">Inactive 60 days</option>
                          <option value="Inactive 90 days">Inactive 90 days</option>
                          <option value="Inactive 120 days">Inactive 120 days</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={campaignForm.message}
                      onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength="500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={campaignForm.startDate}
                        onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={campaignForm.endDate}
                        onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCampaignModal(false);
                        setEditingItem(null);
                        setCampaignForm({
                          name: '',
                          type: 'WhatsApp',
                          target: 'All Users',
                          message: '',
                          startDate: '',
                          endDate: ''
                        });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'} Campaign
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingItem ? 'Edit Coupon' : 'Create New Coupon'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCouponModal(false);
                      setEditingItem(null);
                      setCouponForm({
                        code: '',
                        title: '',
                        type: 'Percentage',
                        value: '',
                        minOrder: '',
                        maxDiscount: '',
                        usageLimit: '',
                        startDate: '',
                        endDate: '',
                        applicableProducts: 'All'
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <form onSubmit={handleCouponSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SUMMER20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                      <div className="relative">
                        <select
                          value={couponForm.type}
                          onChange={(e) => setCouponForm({...couponForm, type: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="Fixed">Fixed Amount</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Title</label>
                    <input
                      type="text"
                      value={couponForm.title}
                      onChange={(e) => setCouponForm({...couponForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Summer Collection Discount"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {couponForm.type === 'Percentage' ? 'Discount %' : 'Discount Amount'}
                      </label>
                      <input
                        type="number"
                        value={couponForm.value}
                        onChange={(e) => setCouponForm({...couponForm, value: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max={couponForm.type === 'Percentage' ? '100' : ''}
                        step={couponForm.type === 'Percentage' ? '1' : '0.01'}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                      <input
                        type="number"
                        value={couponForm.minOrder}
                        onChange={(e) => setCouponForm({...couponForm, minOrder: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                      <input
                        type="number"
                        value={couponForm.maxDiscount}
                        onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      value={couponForm.usageLimit}
                      onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={couponForm.startDate}
                        onChange={(e) => setCouponForm({...couponForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={couponForm.endDate}
                        onChange={(e) => setCouponForm({...couponForm, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Products</label>
                    <input
                      type="text"
                      value={couponForm.applicableProducts}
                      onChange={(e) => setCouponForm({...couponForm, applicableProducts: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="All, Jeans, Shirts, etc."
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCouponModal(false);
                        setEditingItem(null);
                        setCouponForm({
                          code: '',
                          title: '',
                          type: 'Percentage',
                          value: '',
                          minOrder: '',
                          maxDiscount: '',
                          usageLimit: '',
                          startDate: '',
                          endDate: '',
                          applicableProducts: 'All'
                        });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'} Coupon
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
