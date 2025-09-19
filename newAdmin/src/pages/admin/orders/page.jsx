import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import CreateOrderModal from './CreateOrderModal';
import { getData, postData } from '../../../services/FetchNodeServices';
import ProductSelectionModal from './ProductSelectionModal';
import OrderTable from './OrderTable';
import { toast } from 'react-toastify';
import FilteredOrdersCom from './FilteredOrdersCom';

export default function OrdersManagement() {
  // const [categories] = useState([
  //   { id: 1, name: 'Jeans' },
  //   { id: 2, name: 'Shirts' },
  //   { id: 3, name: 'Accessories' }
  // ]);

  // const [subProducts] = useState([
  //   {
  //     id: 1,
  //     name: 'Premium Skinny Jeans Set',
  //     parentProduct: 'Premium Blue Jeans',
  //     singlePicPrice: 450,
  //     pcsInSet: 5,
  //     image: 'https://readdy.ai/api/search-image?query=premium%20skinny%20jeansset%20pieces%20modern%20fashion%20clean%20background%20professional%20product%20photography&width=300&height=300&seq=prod1&orientation=squarish',
  //     sizes: ['28', '30', '32', '34', '36'],
  //     stock: 750, // in pcs
  //     barcode: '1234567890123'
  //   },
  //   {
  //     id: 2,
  //     name: 'Formal Cotton Shirt Set',
  //     parentProduct: 'Cotton Casual Shirt',
  //     singlePicPrice: 320,
  //     pcsInSet: 3,
  //     image: 'https://readdy.ai/api/search-image?query=formal%20cotton%20shirt%20set%20pieces%20business%20professional%20clean%20background%20productphotography%20folded%20shirts&width=300&height=300&seq=prod2&orientation=squarish',
  //     sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  //     stock: 600, // in pcs
  //     barcode: '2345678901234'
  //   },
  //   {
  //     id: 3,
  //     name: 'Casual Denim Shirt Set',
  //     parentProduct: 'Casual Denim Shirt',
  //     singlePicPrice: 400,
  //     pcsInSet: 4,
  //     image: 'https://readdy.ai/api/search-image?query=casual%20denim%20shirt%20set%20pieces%20fashion%20clean%20background%20product%20photography&width=300&height=300&seq=prod3&orientation=squarish',
  //     sizes: ['S', 'M', 'L', 'XL'],
  //     stock: 320, // in pcs
  //     barcode: '3456789012345'
  //   },
  //   {
  //     id: 4,
  //     name: 'Regular Fit Jeans Set',
  //     parentProduct: 'Regular Fit Jeans',
  //     singlePicPrice: 367,
  //     pcsInSet: 6,
  //     image: 'https://readdy.ai/api/search-image?query=regular%20fit%20jeans%20set%20pieces%20classic%20style%20clean%20background%20product%20photography&width=300&height=300&seq=prod4&orientation=squarish',
  //     sizes: ['28', '30', '32', '34', '36'],
  //     stock: 600, // in pcs
  //     barcode: '4567890123456'
  //   }
  // ]);
  const [subProducts, setSubProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      customer: {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91 98765 43210',
        type: 'B2B',
        deliveryAddress: '123 Business Street, Mumbai, Maharashtra - 400001'
      },
      items: [
        { productId: 1, name: 'Premium Skinny Jeans Set', quantity: 2, singlePicPrice: 450, pcsInSet: 5 },
        { productId: 2, name: 'Formal Cotton Shirt Set', quantity: 1, singlePicPrice: 320, pcsInSet: 3 }
      ],
      total: 3570, // (2*5*450) + (1*3*320)
      status: 'Pending',
      paymentType: 'Partial Payment',
      paidAmount: 2000,
      balanceAmount: 1570,
      paymentMethod: 'UPI',
      orderType: 'Online',
      orderDate: '2024-01-15',
      trackingId: '',
      deliveryVendor: '',
      statusHistory: [
        { status: 'Pending', date: '2024-01-15', updatedBy: 'System' }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customer: {
        name: 'Fashion Store Pvt Ltd',
        email: 'orders@fashionstore.com',
        phone: '+91 87654 32109',
        type: 'B2B',
        deliveryAddress: '45 Fashion Hub, Delhi, India - 110001'
      },
      items: [
        { productId: 4, name: 'Regular Fit Jeans Set', quantity: 10, singlePicPrice: 367, pcsInSet: 6 },
        { productId: 3, name: 'Casual Denim Shirt Set', quantity: 5, singlePicPrice: 400, pcsInSet: 4 }
      ],
      total: 30020, // (10*6*367) + (5*4*400)
      status: 'Shipped',
      paymentType: 'Complete Payment',
      paidAmount: 30020,
      balanceAmount: 0,
      paymentMethod: 'Bank Transfer',
      orderType: 'Online',
      orderDate: '2024-01-14',
      trackingId: 'TRK123456789',
      deliveryVendor: 'BlueDart',
      statusHistory: [
        { status: 'Pending', date: '2024-01-14', updatedBy: 'System' },
        { status: 'Packed', date: '2024-01-15', updatedBy: 'Admin' },
        { status: 'Shipped', date: '2024-01-16', updatedBy: 'Admin' }
      ]
    }
  ]);

  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [filteredSubProducts, setFilteredSubProducts] = useState(subProducts);
  const [statusUpdateForm, setStatusUpdateForm] = useState({ newStatus: '', trackingId: '', deliveryVendor: '' });
  const [totalPagesSubProduct, setTotalPagesSubProduct] = useState(1)
  const [currentPageSubProduct, setCurrentPageSubProduct] = useState(1)
  const [paymentUpdateForm, setPaymentUpdateForm] = useState({ paidAmount: '', paymentMethod: '', notes: '' });

  const [filters, setFilters] = useState({ status: '', orderType: '', customerType: '', paymentType: '', search: '' });

  const [customers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      type: 'B2B',
      deliveryAddress: '123 Business Street, Mumbai, Maharashtra - 400001'
    },
    {
      id: 2,
      name: 'Fashion Store Pvt Ltd',
      email: 'orders@fashionstore.com',
      phone: '+91 87654 32109',
      type: 'B2B',
      deliveryAddress: '45 Fashion Hub, Delhi, India - 110001'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 76543 21098',
      type: 'Retail',
      deliveryAddress: '78 Residential Area, Pune, Maharashtra - 411001'
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 65432 10987',
      type: 'Retail',
      deliveryAddress: '12 Society Lane, Ahmedabad, Gujarat - 380001'
    },
    {
      id: 5,
      name: 'Meera Joshi',
      email: 'meera.joshi@email.com',
      phone: '+91 54321 09876',
      type: 'Retail',
      deliveryAddress: '34 Park Street, Bangalore, Karnataka - 560001'
    }
  ]);


  const [newOrderForm, setNewOrderForm] = useState({ customerId: '', customerName: '', customerEmail: '', customerPhone: '', customerType: 'Retail', deliveryAddress: '', orderType: 'Offline', payments: [{ method: 'Cash', amount: '' }], items: [], customerAvailablePoints: 0, redeemPoints: 0, pointsToEarn: 0 });



  const deliveryVendors = ['BlueDart', 'Delhivery', 'DTDC', 'FedEx', 'India Post', 'Aramex'];

  const [showPrintOrderModal, setShowPrintOrderModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);

  // QR Code Scanner Handler - Enhanced with auto-detection and audio feedback


  // Audio feedback function
  // const playBeepSound = (type) => {
  //   try {
  //     // Create audio context for beep sounds
  //     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //     const oscillator = audioContext.createOscillator();
  //     const gainNode = audioContext.createGain();

  //     oscillator.connect(gainNode);
  //     gainNode.connect(audioContext.destination);

  //     if (type === 'success') {
  //       // Success beep: Higher pitch, shorter duration
  //       oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  //       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  //       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  //       oscillator.start();
  //       oscillator.stop(audioContext.currentTime + 0.2);
  //     } else if (type === 'error') {
  //       // Error beep: Lower pitch, longer duration
  //       oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
  //       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  //       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  //       oscillator.start();
  //       oscillator.stop(audioContext.currentTime + 0.5);
  //     }
  //   } catch (error) {
  //     console.warn('Audio feedback not available:', error);
  //   }
  // };

  // // Category Filter Handler
  // const handleCategoryFilter = (categoryName) => {
  //   setSelectedCategory(categoryName);
  //   if (!categoryName) {
  //     setFilteredSubProducts(subProducts);
  //   } else {
  //     setFilteredSubProducts(subProducts.filter(p => p.category === categoryName));
  //   }
  // };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'Packed',
      'Packed': 'Shipped',
      'Shipped': 'Delivered'
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = (status) => {
    return ['Pending', 'Packed', 'Shipped'].includes(status);
  };

  const updateOrderStatus = async (orderId, newStatus, trackingId = '', deliveryVendor = '') => {

    const response = await postData(`api/order/change-status-by-admin/${orderId}`, { orderId, newStatus, trackingId, deliveryVendor });
    console.log("response==>", response);
    if (response.success) {
      toast.success(response.message);
      fetchAllOrder();
    } else {
      toast.error(response.message);
    }
    // setOrders(prevOrders => prevOrders.map(order => {
    //   if (order?._id === orderId) {
    //     const updatedOrder = {
    //       ...order,
    //       status: newStatus,
    //       statusHistory: [
    //         ...order.statusHistory,
    //         {
    //           status: newStatus,
    //           date: new Date().toISOString().split('T')[0],
    //           updatedBy: 'Admin'
    //         }
    //       ]
    //     };

    //     if (newStatus === 'Shipped') {
    //       updatedOrder.trackingId = trackingId;
    //       updatedOrder.deliveryVendor = deliveryVendor;
    //     }

    //     return updatedOrder;
    //   }
    //   return order;
    // }));

    // setFilteredOrders(prev => prev.map(order => {
    //   if (order.id === orderId) {
    //     const updatedOrder = {
    //       ...order,
    //       status: newStatus,
    //       statusHistory: [
    //         ...order.statusHistory,
    //         {
    //           status: newStatus,
    //           date: new Date().toISOString().split('T')[0],
    //           updatedBy: 'Admin'
    //         }
    //       ]
    //     };

    //     if (newStatus === 'Shipped') {
    //       updatedOrder.trackingId = trackingId;
    //       updatedOrder.deliveryVendor = deliveryVendor;
    //     }

    //     return updatedOrder;
    //   }
    //   return order;
    // }));
  };

  const updateOrderPayment = async (orderId, additionalPayment, paymentMethod, notes) => {
    // setOrders(prevOrders => prevOrders.map(order => {
    //   if (order?._id === orderId) {
    //     const newPaidAmount = order?.paidAmount + additionalPayment;
    //     const newBalanceAmount = Math.max(0, order.total - newPaidAmount);

    //     return {
    //       ...order,
    //       paidAmount: newPaidAmount,
    //       balanceAmount: newBalanceAmount,
    //       paymentType: newBalanceAmount === 0 ? 'Complete Payment' : 'Partial Payment',
    //       paymentMethod: paymentMethod || order.paymentMethod
    //     };
    //   }
    //   return order;
    // }));
    const response = await postData(`api/order/update-order-payment-by-admin/${orderId}`, { orderId, additionalPayment, paymentMethod, notes });
    console.log("response==>", response);
    if (response.success) {
      toast.success(response.message);
      fetchAllOrder();
    } else {
      toast.error(response.message);
    }
    // setFilteredOrders(prev => prev.map(order => {
    //   if (order.id === orderId) {
    //     const newPaidAmount = order.paidAmount + additionalPayment;
    //     const newBalanceAmount = Math.max(0, order.total - newPaidAmount);

    //     return {
    //       ...order,
    //       paidAmount: newPaidAmount,
    //       balanceAmount: newBalanceAmount,
    //       paymentType: newBalanceAmount === 0 ? 'Complete Payment' : 'Partial Payment',
    //       paymentMethod: paymentMethod || order.paymentMethod
    //     };
    //   }
    //   return order;
    // }));
  };

  const handleStatusUpdate = () => {
    const { newStatus, trackingId, deliveryVendor } = statusUpdateForm;

    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    if (newStatus === 'Shipped' && (!trackingId || !deliveryVendor)) {
      alert('Tracking ID and Delivery Vendor are required for shipped orders');
      return;
    }

    updateOrderStatus(selectedOrder?._id, newStatus, trackingId, deliveryVendor);

    setSelectedOrder({
      ...selectedOrder,
      status: newStatus,
      trackingId: newStatus === 'Shipped' ? trackingId : selectedOrder.trackingId,
      deliveryVendor: newStatus === 'Shipped' ? deliveryVendor : selectedOrder.deliveryVendor
    });

    setShowStatusUpdateModal(false);
    setStatusUpdateForm({ newStatus: '', trackingId: '', deliveryVendor: '' });
  };

  const handlePaymentUpdate = () => {
    const additionalPayment = parseFloat(paymentUpdateForm.paidAmount) || 0;

    if (additionalPayment <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (additionalPayment > selectedOrder.balanceAmount) {
      alert('Payment amount cannot exceed balance amount');
      return;
    }

    updateOrderPayment(selectedOrder?._id, additionalPayment, paymentUpdateForm.paymentMethod, paymentUpdateForm.notes);

    const newPaidAmount = selectedOrder.paidAmount + additionalPayment;
    const newBalanceAmount = Math.max(0, selectedOrder.total - newPaidAmount);

    setSelectedOrder({
      ...selectedOrder,
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      paymentType: newBalanceAmount === 0 ? 'Complete Payment' : 'Partial Payment'
    });

    setShowPaymentUpdateModal(false);
    setPaymentUpdateForm({ paidAmount: '', paymentMethod: '', notes: '' });
  };

  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setStatusUpdateForm({
      newStatus: getNextStatus(order.status) || '',
      trackingId: order.trackingId || '',
      deliveryVendor: order.deliveryVendor || 'BlueDart'
    });
    setShowStatusUpdateModal(true);
  };

  const openPaymentUpdate = (order) => {
    setSelectedOrder(order);
    setPaymentUpdateForm({
      paidAmount: '',
      paymentMethod: order.paymentMethod,
      notes: ''
    });
    setShowPaymentUpdateModal(true);
  };


  // const removeItemFromOrder = (index) => {
  //   setNewOrderForm({
  //     ...newOrderForm,
  //     items: newOrderForm.items.filter((_, i) => i !== index)
  //   });
  // };

  // const updateItemQuantity = (index, newQuantity) => {
  //   if (newQuantity <= 0) return;

  //   setNewOrderForm({
  //     ...newOrderForm,
  //     items: newOrderForm.items.map((item, i) =>
  //       i === index ? { ...item, quantity: newQuantity } : item
  //     )
  //   });
  // };




  // const getTotalQuantity = () => {
  //   return newOrderForm.items.reduce((sum, item) => sum + item.quantity, 0);
  // };



  // const getTotalValue = () => {
  //   return newOrderForm.items.reduce((sum, item) => sum + (item.quantity * item.pcsInSet * item.singlePicPrice), 0);
  // };

  const getTotalPaidAmount = () => {
    return newOrderForm.payments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0);
  };




  // Points calculation functions - Updated with new rules
  const calculatePointsToEarn = (finalAmount) => {
    // Points Earn Rule: 1 pt = ₹0.50, Earned = 40% of Final Amount / 0.50 (rounded down)
    const earnableAmount = finalAmount * 0.4; // 40% of final amount
    return Math.floor(earnableAmount / 0.5); // 1 point = ₹0.50, rounded down
  };

  const calculatePointsValue = (points) => {
    // 1 point = ₹0.50
    return points * 0.5;
  };

  const calculateMaxRedeemablePoints = (cartValue) => {
    // Max 30% of cart value can be redeemed
    const maxValue = cartValue * 0.3;
    return Math.floor(maxValue / 0.5); // Convert to points (1 point = ₹0.50)
  };



  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Packed': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentTypeColor = (paymentType) => {
    const colors = {
      'Complete Payment': 'bg-green-100 text-green-800',
      'Partial Payment': 'bg-yellow-100 text-yellow-800'
    };
    return colors[paymentType] || 'bg-gray-100 text-gray-800';
  };

  // const handleCustomerSelect = (customerId) => {
  //   const customer = customers.find(c => c.id === parseInt(customerId));
  //   if (customer) {
  //     // Mock available points for selected customer
  //     const availablePoints = customer.id === 1 ? 2450 : customer.id === 2 ? 890 : customer.id === 3 ? 8920 : 0;

  //     setNewOrderForm({
  //       ...newOrderForm,
  //       customerId,
  //       customerName: customer.name,
  //       customerEmail: customer.email,
  //       customerPhone: customer.phone,
  //       customerType: customer.type,
  //       deliveryAddress: customer.deliveryAddress,
  //       customerAvailablePoints: availablePoints,
  //       redeemPoints: 0
  //     });
  //   } else {
  //     setNewOrderForm({ ...newOrderForm, customerId, customerName: '', customerEmail: '', customerPhone: '', customerType: 'Retail', deliveryAddress: '', customerAvailablePoints: 0, redeemPoints: 0 });
  //   }
  // };





  // const getFilteredProductsForSelection = () => {
  //   if (!productSearchQuery.trim()) {
  //     return filteredSubProducts;
  //   }

  //   const query = productSearchQuery.toLowerCase();
  //   return filteredSubProducts.filter(product =>
  //     product.name.toLowerCase().includes(query) ||
  //     product.parentProduct.toLowerCase().includes(query) ||
  //     product.singlePicPrice.toString().includes(query)
  //   );
  // };

  // Print order invoice
  const normalizeSizes = (sizes) => {
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === "string") {
      try {
        const parsed = JSON.parse(sizes);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return sizes.split(",").map((s) => s.trim());
      }
    }
    return [];
  };


  const handlePrintOrder = () => {
    if (!orderToPrint) return;

    let printContent = `
      <html>
        <head>
          <title>Order Invoice - ${orderToPrint.orderNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10mm; }
              .no-print { display: none; }
              * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 10mm;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .invoice-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 5px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .item-image {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 4px;
            }
            .sizes-list {
              font-size: 12px;
              color: #666;
            }
            .totals-section {
              border-top: 2px solid #000;
              padding-top: 10px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .total-row.final {
              font-size: 16px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .payment-section {
              margin-top: 20px;
            }
            .payment-method {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Your Company Name</div>
            <div>Fashion & Apparel Store</div>
            <div class="invoice-title">ORDER INVOICE</div>
          </div>

          <div class="info-grid">
            <div>
              <div class="section-title">Order Information</div>
              <div class="info-item"><span class="label">Order Number:</span> ${orderToPrint.orderNumber}</div>
              <div class="info-item"><span class="label">Order Date:</span> ${orderToPrint.orderDate}</div>
              <div class="info-item"><span class="label">Order Type:</span> ${orderToPrint.orderType}</div>
              <div class="info-item"><span class="label">Status:</span> ${orderToPrint.status}</div>
            </div>
            <div>
              <div class="section-title">Customer Information</div>
              <div class="info-item"><span class="label">Name:</span> ${orderToPrint.customer.name}</div>
              <div class="info-item"><span class="label">Email:</span> ${orderToPrint.customer.email}</div>
              <div class="info-item"><span class="label">Phone:</span> ${orderToPrint.customer.phone}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Delivery Address</div>
            <div>${orderToPrint.customer.deliveryAddress}</div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Set</th>
                  <th>Qty</th>
                  <th>Pcs/Set</th>
                  <th>Total Pcs</th>
                  <th>Price/Pc</th>
                  <th>Available Sizes</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
    `;

    orderToPrint.items.forEach(item => {
      const product = subProducts?.find(p => p?._id === item.productId._id);
      const totalPcs = item.quantity * item.pcsInSet;
      const lineTotal = item.quantity * item.pcsInSet * item.singlePicPrice;
      console.log("GGGG:=>", product)
      printContent += `
        <tr>
          <td>
            <img src="${product?.subProductImages?.[0] || item?.productId?.subProductImages?.[0] || ''}" alt="${item.name}" class="item-image" />
          </td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.pcsInSet}</td>
          <td>${totalPcs}</td>
          <td>₹${item.singlePicPrice}</td>
          <td class="sizes-list">${normalizeSizes(product?.sizes) || normalizeSizes(item?.availableSizes) || 'N/A'}</td>
          <td>₹${lineTotal.toLocaleString()}</td>
        </tr>
      `;
    });

    printContent += `
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${(orderToPrint.subtotal || orderToPrint.total + (orderToPrint.pointsRedemptionValue || 0)).toLocaleString()}</span>
            </div>
    `;

    if (orderToPrint.pointsRedeemed > 0) {
      printContent += `
            <div class="total-row">
              <span>Points Redeemed (${orderToPrint.pointsRedeemed.toLocaleString()} pts):</span>
              <span>-₹${orderToPrint.pointsRedemptionValue.toLocaleString()}</span>
            </div>
      `;
    }

    printContent += `
            <div class="total-row final">
              <span>Final Payable:</span>
              <span>₹${orderToPrint.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="payment-section">
            <div class="section-title">Payment Information</div>
    `;

    if (orderToPrint.payments && orderToPrint.payments.length > 0) {
      orderToPrint.payments.forEach(payment => {
        if (parseFloat(payment.amount) > 0) {
          printContent += `
            <div class="payment-method">
              <span>${payment.method}:</span>
              <span>₹${parseFloat(payment.amount).toLocaleString()}</span>
            </div>
          `;
        }
      });
    }

    printContent += `
            <div class="payment-method">
              <span><strong>Total Paid:</strong></span>
              <span><strong>₹${orderToPrint.paidAmount.toLocaleString()}</strong></span>
            </div>
    `;

    if (orderToPrint.balanceAmount > 0) {
      printContent += `
            <div class="payment-method">
              <span><strong>Balance Due:</strong></span>
              <span><strong>₹${orderToPrint.balanceAmount.toLocaleString()}</strong></span>
            </div>
      `;
    }

    if (orderToPrint.pointsEarned > 0) {
      printContent += `
            <div class="payment-method">
              <span><strong>Points to Earn:</strong></span>
              <span><strong>${orderToPrint.pointsEarned.toLocaleString()} pts (₹${(orderToPrint.pointsEarnedValue || calculatePointsValue(orderToPrint.pointsEarned)).toLocaleString()})</strong></span>
            </div>
            <div class="payment-method">
              <span style="font-size: 11px; color: #666;">Points expire in 90 days from credit date</span>
            </div>
      `;
    }

    printContent += `
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Order generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    // Wait for content to load then print
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    };
  };



  const fetchProductsWithPagination = async () => {
    try {
      const response = await getData(`api/subProduct/get-all-sub-products-with-pagination?page=${currentPageSubProduct}&limit=12&search=${productSearchQuery}`);
      console.log("XXXXXXXXXXX:=-=>", response)
      if (response.success) {
        setSubProducts(response.data || []);
        setTotalPagesSubProduct(response?.pagination?.totalPages || 1);
        setFilteredSubProducts(response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  const fetchAllOrder = async () => {
    try {
      const response = await getData(`api/order/get-all-orders-by-admin-with-pagination?page=${currentPage}&limit=12&search=${filters?.search}`);

      if (response.success === true) {
        console.log("XXXXXXXXXXX:=-=>yy", response)
        setOrders(response.orders || []);
        setTotalPages(response?.pagination?.totalPages || 1);
        setFilteredOrders(response.orders || []);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAllOrder()
  }, [currentPage, filters.search])

  useEffect(() => {
    fetchProductsWithPagination()
  }, [productSearchQuery, currentPageSubProduct])

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage online and offline orders with payment tracking</p>
          </div>
          <Button
            onClick={() => setShowCreateOrderModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Create Order</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <FilteredOrdersCom
            filters={filters}
            setFilters={setFilters}
            setFilteredOrders={setFilteredOrders}
            orders={orders}
            setOrders={setOrders}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            totalPages={totalPages}
            setTotalPages={setTotalPages}
          />
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <OrderTable
            filteredOrders={filteredOrders}
            getStatusColor={getStatusColor}
            getPaymentTypeColor={getPaymentTypeColor}
            setSelectedOrder={setSelectedOrder}
            setShowOrderModal={setShowOrderModal}
            canUpdateStatus={canUpdateStatus}
            openStatusUpdate={openStatusUpdate}
            openPaymentUpdate={openPaymentUpdate}
            updateOrderStatus={updateOrderStatus}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setTotalPages={setTotalPages}
          />
        </Card>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-shopping-cart-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No orders found matching your criteria</p>
          </div>
        )}

        {/* Create Order Modal */}
        {showCreateOrderModal && (
          <CreateOrderModal
            subProducts={subProducts}
            getTotalPaidAmount={getTotalPaidAmount}
            calculatePointsValue={calculatePointsValue}
            calculatePointsToEarn={calculatePointsToEarn}
            setNewOrderForm={setNewOrderForm}
            newOrderForm={newOrderForm}
            setShowProductSelectionModal={setShowProductSelectionModal}
            setShowCreateOrderModal={setShowCreateOrderModal}
            setShowPrintOrderModal={setShowPrintOrderModal}
            orders={orders} setOrders={setOrders}
            setFilteredOrders={setFilteredOrders}
            filteredOrders={filteredOrders}
            setOrderToPrint={setOrderToPrint}
          />
        )}

        {/* Product Selection Modal with Search Bar */}
        {showProductSelectionModal && (
          <ProductSelectionModal
            filteredSubProducts={filteredSubProducts}
            setFilteredSubProducts={setFilteredSubProducts}
            productSearchQuery={productSearchQuery}
            setProductSearchQuery={setProductSearchQuery}
            subProducts={subProducts}
            setNewOrderForm={setNewOrderForm}
            newOrderForm={newOrderForm}
            setShowProductSelectionModal={setShowProductSelectionModal}
            setTotalPagesSubProduct={setTotalPagesSubProduct}
            totalPagesSubProduct={totalPagesSubProduct}
            setCurrentPageSubProduct={setCurrentPageSubProduct}
            currentPageSubProduct={currentPageSubProduct}
          />
        )}

        {/* Payment Update Modal */}
        {showPaymentUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Update Payment</h2>
                  <button
                    onClick={() => {
                      setShowPaymentUpdateModal(false);
                      setPaymentUpdateForm({ paidAmount: '', paymentMethod: '', notes: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Order: {selectedOrder?.orderNumber}</div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{selectedOrder?.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Already Paid:</span>
                        <span className="font-medium text-green-600">₹{selectedOrder.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance Due:</span>
                        <span className="font-medium text-red-600">₹{selectedOrder?.balanceAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Payment Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentUpdateForm?.paidAmount}
                      onChange={(e) => setPaymentUpdateForm({ ...paymentUpdateForm, paidAmount: e.target.value })}
                      placeholder="Enter payment amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max={selectedOrder?.balanceAmount}
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <div className="relative">
                      <select
                        value={paymentUpdateForm?.paymentMethod}
                        onChange={(e) => setPaymentUpdateForm({ ...paymentUpdateForm, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      value={paymentUpdateForm.notes}
                      onChange={(e) => setPaymentUpdateForm({ ...paymentUpdateForm, notes: e.target.value })}
                      rows="2"
                      placeholder="Payment notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowPaymentUpdateModal(false);
                      setPaymentUpdateForm({ paidAmount: '', paymentMethod: '', notes: '' });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePaymentUpdate}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    Update Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Update Order Status</h2>
                  <button
                    onClick={() => {
                      setShowStatusUpdateModal(false);
                      setStatusUpdateForm({ newStatus: '', trackingId: '', deliveryVendor: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Order: {selectedOrder.orderNumber}</div>
                    <div className="text-sm text-gray-600 mb-4">Current Status:
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                    <div className="relative">
                      <select
                        value={statusUpdateForm.newStatus}
                        onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, newStatus: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Select Status</option>
                        {selectedOrder.status === 'Pending' && <option value="Packed">Packed</option>}
                        {selectedOrder.status === 'Packed' && <option value="Shipped">Shipped</option>}
                        {selectedOrder.status === 'Shipped' && <option value="Delivered">Delivered</option>}
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  {statusUpdateForm.newStatus === 'Shipped' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID *</label>
                        <input
                          type="text"
                          value={statusUpdateForm.trackingId}
                          onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingId: e.target.value })}
                          placeholder="Enter tracking ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Vendor *</label>
                        <div className="relative">
                          <select
                            value={statusUpdateForm.deliveryVendor}
                            onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, deliveryVendor: e.target.value })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            required
                          >
                            {deliveryVendors.map(vendor => (
                              <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowStatusUpdateModal(false);
                      setStatusUpdateForm({ newStatus: '', trackingId: '', deliveryVendor: '' });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStatusUpdate}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Order Details Modal with Images and Complete Information */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Order Details - {selectedOrder.orderNumber}</h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setOrderToPrint(selectedOrder);
                        setShowPrintOrderModal(true);
                      }}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <i className="ri-printer-line mr-2"></i>
                      Print Invoice
                    </Button>
                    <button
                      onClick={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-3">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Name:</span> {selectedOrder.customer.name}</div>
                          <div><span className="text-gray-500">Email:</span> {selectedOrder.customer.email}</div>
                          <div><span className="text-gray-500">Phone:</span> {selectedOrder.customer.phone}</div>
                          <div><span className="text-gray-500">Type:</span> {selectedOrder.customer.type}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Order Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Date:</span> {selectedOrder.orderDate}</div>
                          <div><span className="text-gray-500">Type:</span> {selectedOrder.orderType}</div>
                          <div><span className="text-gray-500">Payment Method:</span> {selectedOrder.paymentMethod}</div>
                          <div><span className="text-gray-500">Final Total:</span> ₹{selectedOrder.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Payment Information */}
                    <div>
                      <h3 className="font-medium mb-3">Payment Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Payment Type:</span>
                            <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(selectedOrder.paymentType)}`}>
                              {selectedOrder.paymentType}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Paid Amount:</span>
                            <div className="font-medium text-green-600">₹{selectedOrder.paidAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Balance Amount:</span>
                            <div className={`font-medium ${selectedOrder.balanceAmount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              ₹{selectedOrder.balanceAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Points Information */}
                        {(selectedOrder.pointsRedeemed > 0 || selectedOrder.pointsEarned > 0) && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Points Activity</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {selectedOrder.pointsRedeemed > 0 && (
                                <div>
                                  <span className="text-gray-500">Points Redeemed:</span>
                                  <div className="text-right">
                                    <div className="font-medium text-orange-800">
                                      {selectedOrder.pointsRedeemed.toLocaleString()} pts
                                    </div>
                                    <div className="text-xs text-orange-600">
                                      Discount: ₹{selectedOrder.pointsRedemptionValue.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {selectedOrder.pointsEarned > 0 && (
                                <div>
                                  <span className="text-gray-500">Points Earned:</span>
                                  <div className="text-right">
                                    <div className="font-medium text-green-800">
                                      {selectedOrder.pointsEarned.toLocaleString()} pts
                                    </div>
                                    <div className="text-xs text-green-600">
                                      Value: ₹{selectedOrder.pointsEarnedValue?.toLocaleString() || calculatePointsValue(selectedOrder.pointsEarned).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Multiple Payment Methods Display */}
                        {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Payment Methods</h4>
                            <div className="space-y-1">
                              {selectedOrder.payments.map((payment, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{payment.method}:</span>
                                  <span className="font-medium">₹{parseFloat(payment.amount).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Order Items with Images */}
                    <div>
                      <h3 className="font-medium mb-3">Order Sets</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => {
                          const product = subProducts.find(p => p.id === item.productId);
                          const totalPcs = item.quantity * item.pcsInSet;
                          const lineTotal = item.quantity * item.pcsInSet * item.singlePicPrice;

                          return (
                            <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                              <img
                                src={product?.images?.[0] || 'https://readdy.ai/api/search-image?query=product%20set%20pieces%20fashion%20clean%20background&width=100&height=100&seq=placeholder-detail&orientation=squarish'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-600">
                                  Quantity: {item.quantity} sets × {item.pcsInSet} pcs = {totalPcs} pieces
                                </div>
                                <div className="text-sm text-gray-600">
                                  Price: ₹{item.singlePicPrice} per piece
                                </div>
                                {product?.selectedSizes && product.selectedSizes.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="text-xs text-gray-500">Sizes:</span>
                                    {product.selectedSizes.map(size => (
                                      <span key={size} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">₹{lineTotal.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{totalPcs} pieces</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.deliveryAddress}</p>
                    </div>

                    {/* Tracking Information */}
                    {selectedOrder.trackingId && (
                      <div>
                        <h3 className="font-medium mb-3">Tracking Information</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-gray-500">Tracking ID:</span>
                              <div className="font-medium">{selectedOrder.trackingId}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Delivery Vendor:</span>
                              <div className="font-medium">{selectedOrder.deliveryVendor}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status History Sidebar */}
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg sticky top-0">
                      <h3 className="font-medium mb-4">Status History</h3>
                      <div className="space-y-3">
                        {selectedOrder.statusHistory.map((history, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-3 h-3 rounded-full mt-0.5 ${history.status === 'Delivered' ? 'bg-green-500' :
                              history.status === 'Shipped' ? 'bg-purple-500' :
                                history.status === 'Packed' ? 'bg-blue-500' :
                                  history.status === 'Cancelled' ? 'bg-red-500' :
                                    'bg-yellow-500'
                              }`}></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{history.status}</div>
                              <div className="text-xs text-gray-500">{history.date}</div>
                              <div className="text-xs text-gray-400">by {history.updatedBy}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-6 space-y-2">
                        {canUpdateStatus(selectedOrder.status) && (
                          <Button
                            onClick={() => {
                              setShowOrderModal(false);
                              openStatusUpdate(selectedOrder);
                            }}
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
                          >
                            Update Status
                          </Button>
                        )}
                        {selectedOrder.balanceAmount > 0 && (
                          <Button
                            onClick={() => {
                              setShowOrderModal(false);
                              openPaymentUpdate(selectedOrder);
                            }}
                            className="w-full bg-green-600 text-white hover:bg-green-700 text-sm"
                          >
                            Update Payment
                          </Button>
                        )}
                        {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                          <Button
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this order?')) {
                                updateOrderStatus(selectedOrder.id, 'Cancelled');
                                setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                              }
                            }}
                            className="w-full bg-red-600 text-white hover:bg-red-700 text-sm"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Order Modal */}
        {showPrintOrderModal && orderToPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Print Order Invoice</h2>
                  <button
                    onClick={() => setShowPrintOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Order Number:</span>
                        <span className="font-medium">{orderToPrint.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium">{orderToPrint.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{orderToPrint.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-medium">{orderToPrint.items.length} sets</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    This will print a complete invoice with all order details, product images, sizes, and payment information.
                  </p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => setShowPrintOrderModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handlePrintOrder();
                      setShowPrintOrderModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Print Invoice
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
