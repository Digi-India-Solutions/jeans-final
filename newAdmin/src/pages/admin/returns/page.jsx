
import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import ChallansTable from './ChallansTable';
import ReturnsTable from './ReturnsTable';
import ReportsSection from './ReportsSection';
import CreateChallanModal from './CreateChallanModal';
import CreateReturnModal from './CreateReturnModal';
import PrintModal from './PrintModal';
import EditModal from './EditModal';
import AdvancedFilters from './AdvancedFilters';

export default function ReturnsAndChallan() {
  // Mock sub-products stock for returns processing
  const [subProductsStock, setSubProductsStock] = useState([
    { id: 1, name: 'Premium Skinny Jeans Set', stock: 750 }, // in pcs
    { id: 2, name: 'Formal Cotton Shirt Set', stock: 600 }, // in pcs
    { id: 3, name: 'Casual Denim Shirt Set', stock: 320 }, // in pcs
    { id: 4, name: 'Regular Fit Jeans Set', stock: 600 }, // in pcs
    { id: 5, name: 'Formal Dress Shirt Set', stock: 480 } // in pcs
  ]);

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
          { id: 1, name: 'Premium Skinny Jeans Set', size: '32', orderedQty: 5, dispatchedQty: 5, pendingQty: 0, price: 450, pcsInSet: 5 },
          { id: 2, name: 'Formal Cotton Shirt Set', size: 'L', orderedQty: 3, dispatchedQty: 3, pendingQty: 0, price: 320, pcsInSet: 3 }
        ],
        total: 18570,
        date: '2024-01-15'
      }
    ],
    2: [
      {
        id: 'ORD-2024-002',
        items: [
          { id: 4, name: 'Regular Fit Jeans Set', size: '30', orderedQty: 50, dispatchedQty: 30, pendingQty: 20, price: 367, pcsInSet: 6 },
          { id: 5, name: 'Formal Dress Shirt Set', size: 'L', orderedQty: 25, dispatchedQty: 20, pendingQty: 5, price: 383, pcsInSet: 6 }
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
        { name: 'Regular Fit Jeans Set', size: '30', dispatchedQty: 30, price: 367, pcsInSet: 6 }
      ],
      totalValue: 66060, // 30 sets * 6 pcs * 367 price
      date: '2024-01-13',
      status: 'Dispatched',
      vendor: 'BlueDart'
    },
    {
      id: 2,
      challanNumber: 'CHN-2024-002',
      customer: 'Rajesh Kumar',
      orderNumber: 'ORD-2024-001',
      items: [
        { name: 'Premium Skinny Jeans Set', size: '32', dispatchedQty: 5, price: 450, pcsInSet: 5 }
      ],
      totalValue: 11250, // 5 sets * 5 pcs * 450 price
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
        { name: 'Casual T-Shirt', size: 'S', returnQty: 1, reason: 'Size issue', refundAmount: 899, pcsInSet: 1 }
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
        { name: 'Formal Dress Shirt Set', size: 'XL', returnQty: 2, reason: 'Quality issue', refundAmount: 4596, pcsInSet: 6 }
      ],
      totalRefund: 4596,
      date: '2024-01-15',
      status: 'Pending'
    }
  ]);

  const incrementStock = (productName, returnedPcs) => {
    setSubProductsStock(prevStock =>
      prevStock.map(product => {
        if (product.name === productName) {
          const newStock = product.stock + returnedPcs;
          console.log(`Stock Increment: ${productName} - Returned: ${returnedPcs} pcs, New Stock: ${newStock} pcs`);
          return { ...product, stock: newStock };
        }
        return product;
      })
    );
  };

  const [activeTab, setActiveTab] = useState('challans');
  const [activeReportTab, setActiveReportTab] = useState('deliveries');
  const [showReports, setShowReports] = useState(false);

  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [printingItem, setPrintingItem] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({ client: '', status: '', dateFrom: '', dateTo: '', search: '' });

  // Form states
  const [challanForm, setChallanForm] = useState({ customerId: '', orderId: '', items: [], deliveryVendor: 'BlueDart', notes: '' });

  const [returnForm, setReturnForm] = useState({ customerId: '', orderId: '', items: [], reason: '', refundMethod: 'Original Payment Method' });

  const [editForm, setEditForm] = useState({ items: [], status: '', reason: '', notes: '' });

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

  // CRUD operations with stock management
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
    } else if (type === 'return') {
      // Handle return status change with stock adjustment
      const returnItem = returns.find(r => r.id === id);

      if (returnItem && newStatus === 'Approved' && returnItem.status !== 'Approved') {
        // Auto increment stock when return is approved
        returnItem.items.forEach(item => {
          const returnedPcs = item.returnQty * (item.pcsInSet || 1);
          incrementStock(item.name, returnedPcs);
        });

        alert(`Return approved! Stock has been automatically incremented for returned items.`);
      }

      setReturns(returns.map(returnItem =>
        returnItem.id === id ? { ...returnItem, status: newStatus } : returnItem
      ));
    }
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

  const updateReturnItem = (index, field, value) => {
    const updatedItems = returnForm.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'returnQty') {
          updatedItem.returnQty = Math.min(Math.max(0, value), item.dispatchedQty);
          updatedItem.refundAmount = updatedItem.returnQty * item.pcsInSet * item.price;
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



  // Reports data and state
  const [reportFilters, setReportFilters] = useState({
    period: 'monthly',
    dateFrom: '',
    dateTo: '',
    customDateFrom: '',
    customDateTo: ''
  });

  // Generate mock report data based on period
  const generateReportData = (type, period) => {
    const data = [];
    const labels = [];

    switch (period) {
      case 'daily':
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

          if (type === 'deliveries') {
            data.push(Math.floor(Math.random() * 50) + 10);
          } else {
            data.push(Math.floor(Math.random() * 15) + 2);
          }
        }
        break;

      case 'monthly':
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));

          if (type === 'deliveries') {
            data.push(Math.floor(Math.random() * 200) + 50);
          } else {
            data.push(Math.floor(Math.random() * 50) + 10);
          }
        }
        break;

      case 'yearly':
        for (let i = 4; i >= 0; i--) {
          const year = new Date().getFullYear() - i;
          labels.push(year.toString());

          if (type === 'deliveries') {
            data.push(Math.floor(Math.random() * 2000) + 500);
          } else {
            data.push(Math.floor(Math.random() * 500) + 100);
          }
        }
        break;

      default:
        labels.push('Custom Period');
        data.push(type === 'deliveries' ? 150 : 35);
    }

    return { labels, data };
  };

  const getReportSummary = (type, period) => {
    if (type === 'deliveries') {
      return {
        total: 1247,
        trend: '+12.5%',
        trendColor: 'text-green-600',
        totalValue: '₹2,847,650',
        avgPerDay: 41.6
      };
    } else {
      return {
        total: 189,
        trend: '-8.2%',
        trendColor: 'text-red-600',
        totalValue: '₹342,890',
        avgPerDay: 6.3
      };
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Returns &amp; Challan Management</h1>
            <p className="text-gray-600 mt-1">Complete management with auto stock adjustments in pcs</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowCreateChallanModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white"            >
              <i className="ri-truck-line mr-2"></i>
              Create Challan
            </Button>
            <Button onClick={() => setShowCreateReturnModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white"            >
              <i className="ri-arrow-go-back-line mr-2"></i>
              Create Return
            </Button>
          </div>
        </div>

        {/* Tabs with Reports */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => { setActiveTab('challans'); setShowReports(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'challans' && !showReports
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <i className="ri-truck-line mr-2"></i>
            Delivery Challans ({getFilteredChallans().length})
          </button>
          <button
            onClick={() => {
              setActiveTab('returns');
              setShowReports(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'returns' && !showReports
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <i className="ri-arrow-go-back-line mr-2"></i>
            Returns ({getFilteredReturns().length})
          </button>
          <button
            onClick={() => setShowReports(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showReports ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-bar-chart-line mr-2"></i>
            Reports
          </button>
        </div>

        {/* Reports Section */}
        {showReports && (
          <ReportsSection
            setActiveReportTab={setActiveReportTab}
            activeReportTab={activeReportTab}
            reportFilters={reportFilters}
            setReportFilters={setReportFilters}
            getReportSummary={getReportSummary}
            generateReportData={generateReportData}
          />)}

        {/* Advanced Filters */}
        <AdvancedFilters setFilters={setFilters} filters={filters} />

        {/* Challans Table View with Stock Info */}
        {activeTab === 'challans' && (
          <ChallansTable
            getFilteredChallans={getFilteredChallans}
            handleEdit={handleEdit}
            handleStatusUpdate={handleStatusUpdate}
            handlePrint={handlePrint}
            handleDelete={handleDelete} />
        )}

        {/* Returns Table View with Stock Info */}
        {activeTab === 'returns' && (
          <ReturnsTable
            getFilteredReturns={getFilteredReturns}
            handleEdit={handleEdit}
            handleStatusUpdate={handleStatusUpdate}
            handlePrint={handlePrint}
            handleDelete={handleDelete}
          />)}

        {/* Create Challan Modal */}
        {showCreateChallanModal && (
          <CreateChallanModal
            setShowCreateChallanModal={setShowCreateChallanModal}
            setChallanForm={setChallanForm}
            setSelectedCustomerOrders={setSelectedCustomerOrders}
            challanForm={challanForm}
            customers={customers}
            selectedCustomerOrders={selectedCustomerOrders}
            vendors={vendors}
            handleCustomerChange={handleCustomerChange}
            handleOrderChange={handleOrderChange}
            subProductsStock={subProductsStock}
            setSubProductsStock={setSubProductsStock}
            challans={challans}
            setChallans={setChallans}
          />
        )}

        {/* Create Return Modal */}
        {showCreateReturnModal && (
          <CreateReturnModal
            selectedCustomerOrders={selectedCustomerOrders}
            setShowCreateReturnModal={setShowCreateReturnModal}
            setReturnForm={setReturnForm}
            setSelectedCustomerOrders={setSelectedCustomerOrders}
            customers={customers}
            returnForm={returnForm}
            refundMethods={refundMethods}
            handleCustomerChange={handleCustomerChange}
            handleOrderChange={handleOrderChange}
            updateReturnItem={updateReturnItem}
            returns={returns}
            setReturns={setReturns}
          />)}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <EditModal
            setChallans={setChallans}
            challans={challans}
            editingItem={editingItem}
            setReturns={setReturns}
            returns={returns}
            setEditingItem={setEditingItem}
            setShowEditModal={setShowEditModal}
            editForm={editForm}
            setEditForm={setEditForm}
            handleEdit={handleEdit}
          />)}

        {/* Print Modal */}
        {showPrintModal && printingItem && (
          <PrintModal
            printingItem={printingItem}
            printDocument={printDocument}
            setShowPrintModal={setShowPrintModal}
            setPrintingItem={setPrintingItem}
          />)}
      </div>
    </AdminLayout>
  );
}
