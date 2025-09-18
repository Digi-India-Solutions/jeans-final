
import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function ReturnsAndChallan() {
  const [customers] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', type: 'B2B' },
    { id: 2, name: 'Fashion Store Pvt Ltd', email: 'orders@fashionstore.com', type: 'B2B' },
    { id: 3, name: 'Priya Sharma', email: 'priya.sharma@email.com', type: 'Retail' },
    { id: 4, name: 'Amit Patel', email: 'amit.patel@email.com', type: 'Retail' }
  ]);

  const [customerOrders] = useState({
    1: [
      {
        id: 'ORD-2024-001',
        items: [
          { id: 1, name: 'Premium Skinny Jeans', size: '32', orderedQty: 5, dispatchedQty: 0, pendingQty: 5, price: 2499 },
          { id: 2, name: 'Formal Cotton Shirt', size: 'L', orderedQty: 3, dispatchedQty: 0, pendingQty: 3, price: 1899 }
        ],
        total: 18192,
        date: '2024-01-15'
      }
    ],
    2: [
      {
        id: 'ORD-2024-002',
        items: [
          { id: 4, name: 'Regular Fit Jeans', size: '30', orderedQty: 50, dispatchedQty: 30, pendingQty: 20, price: 2199 },
          { id: 5, name: 'Premium Polo Shirt', size: 'L', orderedQty: 25, dispatchedQty: 0, pendingQty: 25, price: 1799 }
        ],
        total: 154725,
        date: '2024-01-12'
      }
    ]
  });

  const [challans, setChallans] = useState([
    {
      id: 1,
      challanNumber: 'CHN-2024-001',
      customer: 'Fashion Store Pvt Ltd',
      orderNumber: 'ORD-2024-002',
      items: [
        { name: 'Regular Fit Jeans', size: '30', dispatchedQty: 30, price: 2199 }
      ],
      totalValue: 65970,
      date: '2024-01-13',
      status: 'Dispatched',
      vendor: 'BlueDart'
    },
    {
      id: 2,
      challanNumber: 'CHN-2024-002',
      customer: 'Rajesh Kumar',
      orderNumber: 'ORD-2024-003',
      items: [
        { name: 'Premium Skinny Jeans', size: '32', dispatchedQty: 5, price: 2499 }
      ],
      totalValue: 12495,
      date: '2024-01-14',
      status: 'Pending',
      vendor: 'Delhivery'
    }
  ]);

  const [returns, setReturns] = useState([
    {
      id: 1,
      returnNumber: 'RET-2024-001',
      customer: 'Priya Sharma',
      orderNumber: 'ORD-2024-003',
      items: [
        { name: 'Casual T-Shirt', size: 'S', returnQty: 1, reason: 'Size issue', refundAmount: 899 }
      ],
      totalRefund: 899,
      date: '2024-01-14',
      status: 'Approved'
    },
    {
      id: 2,
      returnNumber: 'RET-2024-002',
      customer: 'Amit Patel',
      orderNumber: 'ORD-2024-004',
      items: [
        { name: 'Formal Dress Shirt', size: 'XL', returnQty: 1, reason: 'Quality issue', refundAmount: 2299 }
      ],
      totalRefund: 2299,
      date: '2024-01-15',
      status: 'Pending'
    }
  ]);

  const [activeTab, setActiveTab] = useState('challans');
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [printingItem, setPrintingItem] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    client: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Form states
  const [challanForm, setChallanForm] = useState({
    customerId: '',
    orderId: '',
    items: [],
    deliveryVendor: 'BlueDart',
    notes: ''
  });

  const [returnForm, setReturnForm] = useState({
    customerId: '',
    orderId: '',
    items: [],
    reason: '',
    refundMethod: 'Original Payment Method'
  });

  const [editForm, setEditForm] = useState({
    items: [],
    status: '',
    reason: '',
    notes: ''
  });

  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState([]);

  const vendors = ['BlueDart', 'Delhivery', 'DTDC', 'India Post', 'FedEx'];
  const refundMethods = ['Original Payment Method', 'Bank Transfer', 'Cash', 'Store Credit'];

  // Filter functions
  const getFilteredChallans = () => {
    let filtered = challans;

    if (filters.client) {
      filtered = filtered.filter(challan => 
        challan.customer.toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(challan => challan.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(challan => challan.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(challan => challan.date <= filters.dateTo);
    }

    if (filters.search) {
      filtered = filtered.filter(challan => 
        challan.challanNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        challan.orderNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredReturns = () => {
    let filtered = returns;

    if (filters.client) {
      filtered = filtered.filter(returnItem => 
        returnItem.customer.toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(returnItem => returnItem.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(returnItem => returnItem.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(returnItem => returnItem.date <= filters.dateTo);
    }

    if (filters.search) {
      filtered = filtered.filter(returnItem => 
        returnItem.returnNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        returnItem.orderNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filtered;
  };

  // CRUD operations
  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditForm({
      items: item.items,
      status: item.status,
      reason: item.items[0]?.reason || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (id, type) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'challan') {
        setChallans(challans.filter(challan => challan.id !== id));
      } else {
        setReturns(returns.filter(returnItem => returnItem.id !== id));
      }
    }
  };

  const handleStatusUpdate = (id, newStatus, type) => {
    if (type === 'challan') {
      setChallans(challans.map(challan =>
        challan.id === id ? { ...challan, status: newStatus } : challan
      ));
    } else {
      setReturns(returns.map(returnItem =>
        returnItem.id === id ? { ...returnItem, status: newStatus } : returnItem
      ));
    }
  };

  const saveEdit = () => {
    if (editingItem.type === 'challan') {
      setChallans(challans.map(challan =>
        challan.id === editingItem.id
          ? { ...challan, ...editForm, items: editForm.items }
          : challan
      ));
    } else {
      setReturns(returns.map(returnItem =>
        returnItem.id === editingItem.id
          ? { ...returnItem, ...editForm, items: editForm.items }
          : returnItem
      ));
    }
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Print function
  const handlePrint = (item, type) => {
    setPrintingItem({ ...item, type });
    setShowPrintModal(true);
  };

  const printDocument = () => {
    const printContent = document.getElementById('print-content').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleCustomerChange = (customerId, formType) => {
    const orders = customerOrders[customerId] || [];
    setSelectedCustomerOrders(orders);
    
    if (formType === 'challan') {
      setChallanForm({
        ...challanForm,
        customerId,
        orderId: '',
        items: []
      });
    } else {
      setReturnForm({
        ...returnForm,
        customerId,
        orderId: '',
        items: []
      });
    }
  };

  const handleOrderChange = (orderId, formType) => {
    const order = selectedCustomerOrders.find(o => o.id === orderId);
    if (order) {
      if (formType === 'challan') {
        const challanItems = order.items
          .filter(item => item.pendingQty > 0)
          .map(item => ({
            ...item,
            dispatchQty: 0
          }));
        
        setChallanForm({
          ...challanForm,
          orderId,
          items: challanItems
        });
      } else {
        const returnItems = order.items
          .filter(item => item.dispatchedQty > 0)
          .map(item => ({
            ...item,
            returnQty: 0,
            reason: '',
            refundAmount: 0
          }));
        
        setReturnForm({
          ...returnForm,
          orderId,
          items: returnItems
        });
      }
    }
  };

  const createChallan = () => {
    const customer = customers.find(c => c.id === parseInt(challanForm.customerId));
    const itemsToDispatch = challanForm.items.filter(item => item.dispatchQty > 0);
    
    if (!customer || itemsToDispatch.length === 0) {
      alert('Please select customer, order and set dispatch quantities');
      return;
    }

    const totalValue = itemsToDispatch.reduce((sum, item) => sum + (item.dispatchQty * item.price), 0);
    const challanNumber = `CHN-2024-${String(challans.length + 1).padStart(3, '0')}`;

    const newChallan = {
      id: Date.now(),
      challanNumber,
      customer: customer.name,
      orderNumber: challanForm.orderId,
      items: itemsToDispatch.map(item => ({
        name: item.name,
        size: item.size,
        dispatchedQty: item.dispatchQty,
        price: item.price
      })),
      totalValue,
      date: new Date().toISOString().split('T')[0],
      status: 'Dispatched',
      vendor: challanForm.deliveryVendor,
      notes: challanForm.notes
    };

    setChallans([newChallan, ...challans]);
    resetChallanForm();
    setShowCreateChallanModal(false);
  };

  const createReturn = () => {
    const customer = customers.find(c => c.id === parseInt(returnForm.customerId));
    const itemsToReturn = returnForm.items.filter(item => item.returnQty > 0);
    
    if (!customer || itemsToReturn.length === 0) {
      alert('Please select customer, order and set return quantities');
      return;
    }

    const totalRefund = itemsToReturn.reduce((sum, item) => sum + item.refundAmount, 0);
    const returnNumber = `RET-2024-${String(returns.length + 1).padStart(3, '0')}`;

    const newReturn = {
      id: Date.now(),
      returnNumber,
      customer: customer.name,
      orderNumber: returnForm.orderId,
      items: itemsToReturn.map(item => ({
        name: item.name,
        size: item.size,
        returnQty: item.returnQty,
        reason: item.reason,
        refundAmount: item.refundAmount
      })),
      totalRefund,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      refundMethod: returnForm.refundMethod
    };

    setReturns([newReturn, ...returns]);
    resetReturnForm();
    setShowCreateReturnModal(false);
  };

  const resetChallanForm = () => {
    setChallanForm({
      customerId: '',
      orderId: '',
      items: [],
      deliveryVendor: 'BlueDart',
      notes: ''
    });
    setSelectedCustomerOrders([]);
  };

  const resetReturnForm = () => {
    setReturnForm({
      customerId: '',
      orderId: '',
      items: [],
      reason: '',
      refundMethod: 'Original Payment Method'
    });
    setSelectedCustomerOrders([]);
  };

  const updateChallanItemQuantity = (index, dispatchQty) => {
    const updatedItems = challanForm.items.map((item, i) =>
      i === index ? { ...item, dispatchQty: Math.min(Math.max(0, dispatchQty), item.pendingQty) } : item
    );
    
    setChallanForm({
      ...challanForm,
      items: updatedItems
    });
  };

  const updateReturnItem = (index, field, value) => {
    const updatedItems = returnForm.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'returnQty') {
          updatedItem.returnQty = Math.min(Math.max(0, value), item.dispatchedQty);
          updatedItem.refundAmount = updatedItem.returnQty * item.price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setReturnForm({
      ...returnForm,
      items: updatedItems
    });
  };

  const updateEditItemQuantity = (index, field, value) => {
    const updatedItems = editForm.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    
    setEditForm({
      ...editForm,
      items: updatedItems
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Returns & Challan Management</h1>
            <p className="text-gray-600 mt-1">Complete management console with editing, printing and filtering</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowCreateChallanModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <i className="ri-truck-line mr-2"></i>
              Create Challan
            </Button>
            <Button
              onClick={() => setShowCreateReturnModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <i className="ri-arrow-go-back-line mr-2"></i>
              Create Return
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('challans')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'challans'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-truck-line mr-2"></i>
            Delivery Challans ({getFilteredChallans().length})
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'returns'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-arrow-go-back-line mr-2"></i>
            Returns ({getFilteredReturns().length})
          </button>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Number, order..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  placeholder="Client name..."
                  value={filters.client}
                  onChange={(e) => setFilters({...filters, client: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({ client: '', status: '', dateFrom: '', dateTo: '', search: '' })}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Challans Table View */}
        {activeTab === 'challans' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client & Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value & Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredChallans().map((challan) => (
                    <tr key={challan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{challan.challanNumber}</div>
                          <div className="text-sm text-gray-500">{challan.date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{challan.customer}</div>
                          <div className="text-sm text-gray-500">Order: {challan.orderNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">₹{challan.totalValue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{challan.items.length} item{challan.items.length > 1 ? 's' : ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            challan.status === 'Dispatched' ? 'bg-green-100 text-green-800' :
                            challan.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {challan.status}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">{challan.vendor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handleEdit(challan, 'challan')}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                              <i className="ri-edit-line mr-1"></i>Edit
                            </Button>
                            <div className="relative group">
                              <Button className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs px-2 py-1">
                                <i className="ri-arrow-down-s-line"></i>Status
                              </Button>
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleStatusUpdate(challan.id, 'Pending', 'challan')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(challan.id, 'Dispatched', 'challan')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Dispatched
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(challan.id, 'Completed', 'challan')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Completed
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handlePrint(challan, 'challan')}
                              className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                            >
                              <i className="ri-printer-line mr-1"></i>Print
                            </Button>
                            <Button
                              onClick={() => handleDelete(challan.id, 'challan')}
                              className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                            >
                              <i className="ri-delete-bin-line mr-1"></i>Delete
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Returns Table View */}
        {activeTab === 'returns' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client & Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund & Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredReturns().map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{returnItem.returnNumber}</div>
                          <div className="text-sm text-gray-500">{returnItem.date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{returnItem.customer}</div>
                          <div className="text-sm text-gray-500">Order: {returnItem.orderNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">₹{returnItem.totalRefund.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{returnItem.items.length} item{returnItem.items.length > 1 ? 's' : ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            returnItem.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            returnItem.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            returnItem.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {returnItem.status}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">{returnItem.items[0]?.reason}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handleEdit(returnItem, 'return')}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                              <i className="ri-edit-line mr-1"></i>Edit
                            </Button>
                            <div className="relative group">
                              <Button className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs px-2 py-1">
                                <i className="ri-arrow-down-s-line"></i>Status
                              </Button>
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleStatusUpdate(returnItem.id, 'Pending', 'return')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(returnItem.id, 'Approved', 'return')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Approved
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(returnItem.id, 'Rejected', 'return')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Rejected
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(returnItem.id, 'Completed', 'return')}
                                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Completed
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => handlePrint(returnItem, 'return')}
                              className="bg-green-50 text-green-600 hover:bg-green-100 text-xs px-2 py-1"
                            >
                              <i className="ri-printer-line mr-1"></i>Print
                            </Button>
                            <Button
                              onClick={() => handleDelete(returnItem.id, 'return')}
                              className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                            >
                              <i className="ri-delete-bin-line mr-1"></i>Delete
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Challan Modal */}
        {showCreateChallanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create Delivery Challan</h2>
                  <button
                    onClick={() => {
                      setShowCreateChallanModal(false);
                      resetChallanForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer & Order Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                      <div className="relative">
                        <select
                          value={challanForm.customerId}
                          onChange={(e) => handleCustomerChange(e.target.value, 'challan')}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Choose Customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} ({customer.type})
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                      <div className="relative">
                        <select
                          value={challanForm.orderId}
                          onChange={(e) => handleOrderChange(e.target.value, 'challan')}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          disabled={!challanForm.customerId}
                        >
                          <option value="">Choose Order</option>
                          {selectedCustomerOrders.map(order => (
                            <option key={order.id} value={order.id}>
                              {order.id} - ₹{order.total.toLocaleString()} ({order.date})
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {challanForm.items.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Order Items - Set Dispatch Quantities</h3>
                      <div className="space-y-3">
                        {challanForm.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-5 gap-4 items-center">
                              <div className="col-span-2">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">Size: {item.size}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Ordered</div>
                                <div className="font-medium">{item.orderedQty}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Pending</div>
                                <div className="font-medium text-orange-600">{item.pendingQty}</div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Dispatch Qty</label>
                                <input
                                  type="number"
                                  value={item.dispatchQty}
                                  onChange={(e) => updateChallanItemQuantity(index, parseInt(e.target.value) || 0)}
                                  min="0"
                                  max={item.pendingQty}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                />
                              </div>
                            </div>
                            {item.dispatchQty > 0 && (
                              <div className="mt-2 text-right">
                                <span className="text-sm font-medium text-blue-600">
                                  Dispatch Value: ₹{(item.dispatchQty * item.price).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Dispatch Value:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ₹{challanForm.items
                              .reduce((sum, item) => sum + (item.dispatchQty * item.price), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Vendor</label>
                      <div className="relative">
                        <select
                          value={challanForm.deliveryVendor}
                          onChange={(e) => setChallanForm({...challanForm, deliveryVendor: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {vendors.map(vendor => (
                            <option key={vendor} value={vendor}>{vendor}</option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <input
                        type="text"
                        value={challanForm.notes}
                        onChange={(e) => setChallanForm({...challanForm, notes: e.target.value})}
                        placeholder="Special delivery instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowCreateChallanModal(false);
                        resetChallanForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createChallan}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!challanForm.customerId || !challanForm.orderId || challanForm.items.every(item => item.dispatchQty === 0)}
                    >
                      Create Challan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Return Modal */}
        {showCreateReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create Return</h2>
                  <button
                    onClick={() => {
                      setShowCreateReturnModal(false);
                      resetReturnForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer & Order Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                      <div className="relative">
                        <select
                          value={returnForm.customerId}
                          onChange={(e) => handleCustomerChange(e.target.value, 'return')}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Choose Customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} ({customer.type})
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                      <div className="relative">
                        <select
                          value={returnForm.orderId}
                          onChange={(e) => handleOrderChange(e.target.value, 'return')}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          disabled={!returnForm.customerId}
                        >
                          <option value="">Choose Order</option>
                          {selectedCustomerOrders.map(order => (
                            <option key={order.id} value={order.id}>
                              {order.id} - ₹{order.total.toLocaleString()} ({order.date})
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  {/* Return Items */}
                  {returnForm.items.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Return Items</h3>
                      <div className="space-y-3">
                        {returnForm.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="col-span-2">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">Size: {item.size}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Dispatched</div>
                                <div className="font-medium">{item.dispatchedQty}</div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Return Qty</label>
                                <input
                                  type="number"
                                  value={item.returnQty}
                                  onChange={(e) => updateReturnItem(index, 'returnQty', parseInt(e.target.value) || 0)}
                                  min="0"
                                  max={item.dispatchedQty}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Reason</label>
                                <input
                                  type="text"
                                  value={item.reason}
                                  onChange={(e) => updateReturnItem(index, 'reason', e.target.value)}
                                  placeholder="Return reason"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Refund</div>
                                <div className="font-medium text-orange-600">₹{item.refundAmount?.toLocaleString() || 0}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Refund Amount:</span>
                          <span className="text-xl font-bold text-orange-600">
                            ₹{returnForm.items
                              .reduce((sum, item) => sum + (item.refundAmount || 0), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                    <div className="relative">
                      <select
                        value={returnForm.refundMethod}
                        onChange={(e) => setReturnForm({...returnForm, refundMethod: e.target.value})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        {refundMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowCreateReturnModal(false);
                        resetReturnForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createReturn}
                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                      disabled={!returnForm.customerId || !returnForm.orderId || returnForm.items.every(item => item.returnQty === 0)}
                    >
                      Create Return
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Edit {editingItem.type === 'challan' ? 'Delivery Challan' : 'Return'} - {editingItem.type === 'challan' ? editingItem.challanNumber : editingItem.returnNumber}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                        <option value="Dispatched">Dispatched</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                    <div className="space-y-2">
                      {editForm.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">Size: {item.size}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Qty:</span>
                            <input
                              type="number"
                              value={editingItem.type === 'challan' ? item.dispatchedQty : item.returnQty}
                              onChange={(e) => updateEditItemQuantity(index, editingItem.type === 'challan' ? 'dispatchedQty' : 'returnQty', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {editingItem.type === 'return' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <input
                        type="text"
                        value={editForm.reason}
                        onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveEdit}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && printingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Print {printingItem.type === 'challan' ? 'Delivery Challan' : 'Return Slip'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowPrintModal(false);
                      setPrintingItem(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {/* Print Content */}
                <div id="print-content" className="bg-white p-8 border">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {printingItem.type === 'challan' ? 'DELIVERY CHALLAN' : 'RETURN SLIP'}
                    </h1>
                    <p className="text-gray-600 mt-2">Garments B2B & Offline Management Platform</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">Customer Details:</h3>
                      <p className="text-sm">
                        <strong>Name:</strong> {printingItem.customer}<br/>
                        <strong>Order Number:</strong> {printingItem.orderNumber}<br/>
                        <strong>Date:</strong> {printingItem.date}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        {printingItem.type === 'challan' ? 'Challan' : 'Return'} Details:
                      </h3>
                      <p className="text-sm">
                        <strong>Number:</strong> {printingItem.type === 'challan' ? printingItem.challanNumber : printingItem.returnNumber}<br/>
                        <strong>Status:</strong> {printingItem.status}<br/>
                        {printingItem.type === 'challan' && printingItem.vendor && (
                          <>
                            <strong>Vendor:</strong> {printingItem.vendor}<br/>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Items:</h3>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printingItem.items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.size}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {printingItem.type === 'challan' ? item.dispatchedQty : item.returnQty}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">₹{item.price}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              ₹{printingItem.type === 'challan' 
                                ? (item.dispatchedQty * item.price).toLocaleString()
                                : item.refundAmount?.toLocaleString() || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan="4" className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            Total {printingItem.type === 'challan' ? 'Value' : 'Refund'}:
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            ₹{printingItem.type === 'challan' 
                              ? printingItem.totalValue?.toLocaleString()
                              : printingItem.totalRefund?.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {printingItem.type === 'return' && printingItem.items[0]?.reason && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Return Reason:</h3>
                      <p className="text-sm">{printingItem.items[0].reason}</p>
                    </div>
                  )}

                  <div className="text-right text-sm text-gray-600">
                    <p>Generated on: {new Date().toLocaleDateString()}</p>
                    <p>Powered by Garments Management System</p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowPrintModal(false);
                      setPrintingItem(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={printDocument}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Print Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
