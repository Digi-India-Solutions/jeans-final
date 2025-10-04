
import { useEffect, useState } from 'react';
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
import { getData, postData } from '../../../services/FetchNodeServices';

export default function ReturnsAndChallan() {
  // Mock sub-products stock for returns processing
  const [subProductsStock, setSubProductsStock] = useState([
    { id: 1, name: 'Premium Skinny Jeans Set', stock: 750 }, // in pcs
    { id: 2, name: 'Formal Cotton Shirt Set', stock: 600 }, // in pcs
    { id: 3, name: 'Casual Denim Shirt Set', stock: 320 }, // in pcs
    { id: 4, name: 'Regular Fit Jeans Set', stock: 600 }, // in pcs
    { id: 5, name: 'Formal Dress Shirt Set', stock: 480 } // in pcs
  ]);

  const [customerss] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', type: 'B2B' },
    { id: 2, name: 'Fashion Store Pvt Ltd', email: 'orders@fashionstore.com', type: 'B2B' },
    { id: 3, name: 'Priya Sharma', email: 'priya.sharma@email.com', type: 'Retail' },
    { id: 4, name: 'Amit Patel', email: 'amit.patel@email.com', type: 'Retail' }
  ]);

  // const [customerOrderss] = useState({
  //   1: [
  //     {
  //       id: 'ORD-2024-001',
  //       items: [
  //         { id: 1, name: 'Premium Skinny Jeans Set', size: '32', orderedQty: 5, dispatchedQty: 5, pendingQty: 0, price: 450, pcsInSet: 5 },
  //         { id: 2, name: 'Formal Cotton Shirt Set', size: 'L', orderedQty: 3, dispatchedQty: 3, pendingQty: 0, price: 320, pcsInSet: 3 }
  //       ],
  //       total: 18570,
  //       date: '2024-01-15'
  //     }
  //   ],
  //   2: [
  //     {
  //       id: 'ORD-2024-002',
  //       items: [
  //         { id: 4, name: 'Regular Fit Jeans Set', size: '30', orderedQty: 50, dispatchedQty: 30, pendingQty: 20, price: 367, pcsInSet: 6 },
  //         { id: 5, name: 'Formal Dress Shirt Set', size: 'L', orderedQty: 25, dispatchedQty: 20, pendingQty: 5, price: 383, pcsInSet: 6 }
  //       ],
  //       total: 154725,
  //       date: '2024-01-12'
  //     }
  //   ]
  // });

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

  const [returns, setReturns] = useState([]);

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
  const [customers, setCustomers] = useState([customerss])
  const [customerOrders, setCustomerOrders] = useState([])
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [printingItem, setPrintingItem] = useState(null);

  const [challanCurrantPage, setChallanCurrantPage] = useState(1)
  const [challanPage, setChallanPage] = useState(1)
  const [totalChallans, setTotalChallans] = useState(0)

  const [returnCurrantPage, setReturnCurrantPage] = useState(1)
  const [returnPage, setReturnPage] = useState(1)
  const [totalReturns, setTotalReturns] = useState(0)

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

    // if (filters.client) {
    //   filtered = filtered.filter(challan =>
    //     challan.customer.toLowerCase().includes(filters.client.toLowerCase())
    //   );
    // }

    // if (filters.status) {
    //   filtered = filtered.filter(challan => challan.status === filters.status);
    // }

    // if (filters.dateFrom) {
    //   filtered = filtered.filter(challan => challan.date >= filters.dateFrom);
    // }

    // if (filters.dateTo) {
    //   filtered = filtered.filter(challan => challan.date <= filters.dateTo);
    // }

    // if (filters.search) {
    //   filtered = filtered.filter(challan =>
    //     challan.challanNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
    //     challan.orderNumber.toLowerCase().includes(filters.search.toLowerCase())
    //   );
    // }

    return filtered;
  };

  const getFilteredReturns = () => {
    let filtered = returns;

    // if (filters.client) {
    //   filtered = filtered.filter(returnItem =>
    //     returnItem.customer.toLowerCase().includes(filters.client.toLowerCase())
    //   );
    // }

    // if (filters.status) {
    //   filtered = filtered.filter(returnItem => returnItem.status === filters.status);
    // }

    // if (filters.dateFrom) {
    //   filtered = filtered.filter(returnItem => returnItem.date >= filters.dateFrom);
    // }

    // if (filters.dateTo) {
    //   filtered = filtered.filter(returnItem => returnItem.date <= filters.dateTo);
    // }

    // if (filters.search) {
    //   filtered = filtered.filter(returnItem =>
    //     returnItem.returnNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
    //     returnItem.orderNumber.toLowerCase().includes(filters.search.toLowerCase())
    //   );
    // }

    return filtered;
  };

  // CRUD operations with stock management
  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditForm({ _id: item?._id, items: item.items, status: item.status, reason: item.items[0]?.reason || '', notes: item?.notes || '' });
    setShowEditModal(true);
  };

  const handleDelete = async (id, type) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'challan') {
        const response = await getData(`api/challan/delete-challan/${id}`)
        // console.log("SSSSSSSSS:=>", response)
        if (response?.success === true) {
          fetchChallan()
        }
      } else {
        const response = await getData(`api/return/delete-return/${id}`)
        if (response?.success === true) {
          fetchReturn()
        }
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus, type) => {
    if (type === 'challan') {
      const response = await postData(`api/challan/update-challan-status/${id}`, { newStatus })
      if (response.success === true) {
        fetchChallan()
      }
    } else if (type === 'return') {
      const response = await postData(`api/return/update-return-status/${id}`, { newStatus })
      console.log("response:::=>", response)
      if (response?.success === true) {
        fetchReturn()
        alert(`Return approved! Stock has been automatically incremented for returned items.`);
      }
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
    // const orders = customerOrders[customerId] || [];
    // console.log("SSSSSSSSSSSS:==>", customerOrders)
    // setSelectedCustomerOrders(customerOrders);

    if (formType === 'challan') {
      setChallanForm({ ...challanForm, customerId, orderId: '', items: [] });
    } else {
      setReturnForm({ ...returnForm, customerId, orderId: '', items: [] });
    }
  };

  const handleOrderChange = (orderId, formType) => {
    const order = selectedCustomerOrders.find(o => o._id === orderId);

    if (order) {
      if (formType === 'challan') {

        // console.log("ZZZZZZZZZ==>", order?.items)
        const challanItems = order?.items?.filter(item => item?.quantity > 0).map(item => ({ ...item, dispatchQty: 0 }));
        setChallanForm({ ...challanForm, orderId, orderNumber: order?.orderNumber, items: challanItems });

      } else {
        const returnItems = order?.items?.filter(item => item?.quantity > 0).map(item => ({ ...item, dispatchQty: 0 }));
        // console.log("ZZZZZXXXXZZXXXXX:==>", returnItems)
        setReturnForm({ ...returnForm, orderId, items: returnItems });
      }
    }
  };




  // Reports data and state
  const [reportFilters, setReportFilters] = useState({
    period: 'monthly',
    dateFrom: '',
    dateTo: '',
    customDateFrom: '',
    customDateTo: ''
  });


  /////////////////////////////////////////////////////////////////////////
  const fetchCustomers = async () => {
    try {
      const response = await getData("api/user/get-all-user");
      if (response?.success) {
        setCustomers(response?.data);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  }

  const fetchChallan = async () => {
    try {
      const response = await getData(`api/challan/get-all-challans-with-pagination?page=${challanCurrantPage}&limit=12&filter=${encodeURIComponent(JSON.stringify(filters))}`);
      // console.log("ZSSSXSSSSSfilters:=>ZSSSXSSSSSfilters:=>", response)
      if (response?.success === true) {
        setChallans(response?.challans);
        setChallanPage(response?.totalPages)
        setTotalChallans(response?.total)

      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  }

  const fetchReturn = async () => {
    try {
      const response = await getData(`api/return/get-all-return-with-pagination?page=${returnCurrantPage}&limit=12&filter=${encodeURIComponent(JSON.stringify(filters))}`);
      // console.log("ZSSSXSSSSS:=>", response)
      if (response?.success === true) {
        setReturns(response?.returns);
        setReturnPage(response?.totalPages)
        setTotalReturns(response?.total)

      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  }

  useEffect(() => {
    fetchChallan()
    fetchReturn()
  }, [filters?.client, filters?.status, filters?.dateFrom, filters?.dateTo, filters?.search, challanCurrantPage, returnCurrantPage])

  useEffect(() => {
    fetchCustomers();
  }, [])

  const fetchAllOrder = async () => {
    try {
      const response = await getData(`api/order/get-all-orders-by-user/${challanForm?.customerId || returnForm?.customerId}`);
      // console.log("XXXXXXXXXXX:=-=>yy", response)
      if (response.success === true) {
        setCustomerOrders(response?.orders || []);
        setSelectedCustomerOrders(response?.orders || []);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAllOrder()
  }, [challanForm?.customerId, returnForm?.customerId])

  /////////////////////////////////////////////////////////////////////////

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
            Delivery Challans ({totalChallans})
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
            Returns ({totalReturns})
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
            handleDelete={handleDelete}

            challanCurrantPage={challanCurrantPage}
            setChallanCurrantPage={setChallanCurrantPage}
            challanPage={challanPage}
            setChallanPage={setChallanPage}
          />
        )}

        {/* Returns Table View with Stock Info */}
        {activeTab === 'returns' && (
          <ReturnsTable
            getFilteredReturns={getFilteredReturns}
            handleEdit={handleEdit}
            handleStatusUpdate={handleStatusUpdate}
            handlePrint={handlePrint}
            handleDelete={handleDelete}

            returnCurrantPage={returnCurrantPage}
            setReturnCurrantPage={setReturnCurrantPage}
            returnPage={returnPage}
            setReturnPage={setReturnPage}
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
            fetchChallan={fetchChallan}
          />
        )}

        {/* Create Return Modal */}
        {showCreateReturnModal && (
          <CreateReturnModal
            fetchReturn={fetchReturn}
            selectedCustomerOrders={selectedCustomerOrders}
            setShowCreateReturnModal={setShowCreateReturnModal}
            setReturnForm={setReturnForm}
            setSelectedCustomerOrders={setSelectedCustomerOrders}
            customers={customers}
            returnForm={returnForm}
            refundMethods={refundMethods}
            handleCustomerChange={handleCustomerChange}
            handleOrderChange={handleOrderChange}
            // updateReturnItem={updateReturnItem}
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
            fetchChallan={fetchChallan}
            fetchReturn={fetchReturn}
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
