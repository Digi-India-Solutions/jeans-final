
import { useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';

export default function RewardsManagement() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      type: 'B2B',
      points: 2450,
      totalEarned: 5670,
      totalRedeemed: 3220,
      tier: 'Gold',
      lastActivity: '2024-01-15',
      orders: 23
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      type: 'Retail',
      points: 890,
      totalEarned: 1340,
      totalRedeemed: 450,
      tier: 'Silver',
      lastActivity: '2024-01-14',
      orders: 8
    },
    {
      id: 3,
      name: 'Fashion Store Pvt Ltd',
      email: 'orders@fashionstore.com',
      type: 'B2B',
      points: 8920,
      totalEarned: 15640,
      totalRedeemed: 6720,
      tier: 'Platinum',
      lastActivity: '2024-01-16',
      orders: 67
    }
  ]);

  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: '10% Discount Coupon',
      pointsCost: 500,
      type: 'Discount',
      value: 10,
      description: 'Get 10% off on your next purchase',
      status: 'Active',
      validDays: 30,
      usage: 145
    },
    {
      id: 2,
      name: 'Free Shipping',
      pointsCost: 200,
      type: 'Shipping',
      value: 0,
      description: 'Free shipping on your next order',
      status: 'Active',
      validDays: 15,
      usage: 287
    },
    {
      id: 3,
      name: '₹100 Cash Voucher',
      pointsCost: 1000,
      type: 'Voucher',
      value: 100,
      description: 'Get ₹100 off on orders above ₹2000',
      status: 'Active',
      validDays: 45,
      usage: 89
    }
  ]);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [activeTab, setActiveTab] = useState('customers');

  const [pointsForm, setPointsForm] = useState({
    points: '',
    reason: '',
    type: 'add'
  });

  const [rewardForm, setRewardForm] = useState({
    name: '',
    pointsCost: '',
    type: 'Discount',
    value: '',
    description: '',
    validDays: '',
    status: 'Active'
  });

  const getTierColor = (tier) => {
    const colors = {
      'Bronze': 'bg-orange-100 text-orange-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Platinum': 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const handlePointsUpdate = () => {
    if (!selectedCustomer || !pointsForm.points) return;

    const pointsChange = parseInt(pointsForm.points);
    setCustomers(prev => prev.map(customer =>
      customer.id === selectedCustomer.id
        ? {
            ...customer,
            points: pointsForm.type === 'add' 
              ? customer.points + pointsChange 
              : Math.max(0, customer.points - pointsChange),
            totalEarned: pointsForm.type === 'add' 
              ? customer.totalEarned + pointsChange 
              : customer.totalEarned,
            totalRedeemed: pointsForm.type === 'remove' 
              ? customer.totalRedeemed + pointsChange 
              : customer.totalRedeemed
          }
        : customer
    ));

    setPointsForm({ points: '', reason: '', type: 'add' });
    setShowCustomerModal(false);
    setSelectedCustomer(null);
  };

  const handleRewardSave = () => {
    if (editingReward) {
      setRewards(prev => prev.map(reward =>
        reward.id === editingReward.id
          ? { ...reward, ...rewardForm, pointsCost: parseInt(rewardForm.pointsCost), value: parseFloat(rewardForm.value), validDays: parseInt(rewardForm.validDays) }
          : reward
      ));
    } else {
      setRewards(prev => [...prev, {
        ...rewardForm,
        id: Date.now(),
        pointsCost: parseInt(rewardForm.pointsCost),
        value: parseFloat(rewardForm.value),
        validDays: parseInt(rewardForm.validDays),
        usage: 0
      }]);
    }
    
    setRewardForm({
      name: '',
      pointsCost: '',
      type: 'Discount',
      value: '',
      description: '',
      validDays: '',
      status: 'Active'
    });
    setEditingReward(null);
    setShowRewardModal(false);
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      name: reward.name,
      pointsCost: reward.pointsCost.toString(),
      type: reward.type,
      value: reward.value.toString(),
      description: reward.description,
      validDays: reward.validDays.toString(),
      status: reward.status
    });
    setShowRewardModal(true);
  };

  const toggleRewardStatus = (id) => {
    setRewards(prev => prev.map(reward =>
      reward.id === id
        ? { ...reward, status: reward.status === 'Active' ? 'Inactive' : 'Active' }
        : reward
    ));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Rewards</h1>
            <p className="text-gray-600 mt-1">Manage customer points and reward options</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="md">
              <i className="ri-download-line mr-2"></i>
              Export Report
            </Button>
            {activeTab === 'rewards' && (
              <Button onClick={() => setShowRewardModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="ri-add-line mr-2"></i>
                Add Reward
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'customers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Customer Points
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'rewards'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reward Options
          </button>
        </div>

        {activeTab === 'customers' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <i className="ri-user-line text-xl text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <i className="ri-coin-line text-xl text-green-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <i className="ri-gift-line text-xl text-purple-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Points Redeemed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.reduce((sum, c) => sum + c.totalRedeemed, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <i className="ri-vip-crown-line text-xl text-yellow-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Gold+ Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Customer Points Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Redeemed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              customer.type === 'B2B' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {customer.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600">{customer.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.totalEarned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.totalRedeemed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.tier)}`}>
                            {customer.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerModal(true);
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-3 py-1"
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Manage Points
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            {/* Reward Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <Card key={reward.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reward.type === 'Discount' ? 'bg-blue-100 text-blue-800' :
                        reward.type === 'Shipping' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {reward.type}
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      reward.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {reward.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Points Cost:</span>
                      <span className="font-semibold text-orange-600">{reward.pointsCost} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-semibold">
                        {reward.type === 'Discount' ? `${reward.value}%` : 
                         reward.type === 'Voucher' ? `₹${reward.value}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valid Days:</span>
                      <span className="font-semibold">{reward.validDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Times Used:</span>
                      <span className="font-semibold text-blue-600">{reward.usage}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditReward(reward)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      onClick={() => toggleRewardStatus(reward.id)}
                      className={`px-3 text-sm ${
                        reward.status === 'Active' 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <i className={`${reward.status === 'Active' ? 'ri-pause-line' : 'ri-play-line'}`}></i>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Points Management Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Manage Points - {selectedCustomer.name}
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Current Points</div>
                  <div className="text-2xl font-bold text-green-600">{selectedCustomer.points}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="add"
                        checked={pointsForm.type === 'add'}
                        onChange={(e) => setPointsForm({...pointsForm, type: e.target.value})}
                        className="mr-2"
                      />
                      Add Points
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="remove"
                        checked={pointsForm.type === 'remove'}
                        onChange={(e) => setPointsForm({...pointsForm, type: e.target.value})}
                        className="mr-2"
                      />
                      Remove Points
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={pointsForm.points}
                    onChange={(e) => setPointsForm({...pointsForm, points: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={pointsForm.reason}
                    onChange={(e) => setPointsForm({...pointsForm, reason: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Reason for points adjustment..."
                    maxLength="200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handlePointsUpdate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Points
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                    setPointsForm({ points: '', reason: '', type: 'add' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reward Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="relative">
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="Discount">Discount</option>
                        <option value="Voucher">Voucher</option>
                        <option value="Shipping">Shipping</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
                    <input
                      type="number"
                      value={rewardForm.pointsCost}
                      onChange={(e) => setRewardForm({...rewardForm, pointsCost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="number"
                      value={rewardForm.value}
                      onChange={(e) => setRewardForm({...rewardForm, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Days</label>
                    <input
                      type="number"
                      value={rewardForm.validDays}
                      onChange={(e) => setRewardForm({...rewardForm, validDays: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength="200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleRewardSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingReward ? 'Update' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setShowRewardModal(false);
                    setEditingReward(null);
                    setRewardForm({
                      name: '',
                      pointsCost: '',
                      type: 'Discount',
                      value: '',
                      description: '',
                      validDays: '',
                      status: 'Active'
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
