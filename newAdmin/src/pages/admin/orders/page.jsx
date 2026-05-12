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
import CreateNotesModel from './CreateNotesModel';
import Swal from "sweetalert2";
import EditOrderModel from './EditOrderModel';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function OrdersManagement() {
  const navigate = useNavigate();
  const [editOrderNoteForm, setEditOrderNoteForm] = useState({ orderId: '', orderNote: '' })
  const [showEditOrderNoteModal, setShowEditOrderNoteModal] = useState(false)
  const [subProducts, setSubProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [orders, setOrders] = useState([]);

  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editOrderModal, setEditOrderModal] = useState({});
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [filteredSubProducts, setFilteredSubProducts] = useState(subProducts);
  const [statusUpdateForm, setStatusUpdateForm] = useState({ newStatus: '', trackingId: '', deliveryVendor: '' });
  const [totalPagesSubProduct, setTotalPagesSubProduct] = useState(1)
  const [currentPageSubProduct, setCurrentPageSubProduct] = useState(1)
  const [paymentUpdateForm, setPaymentUpdateForm] = useState({ paidAmount: '', paymentMethod: '', notes: '' });
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [permiton, setPermiton] = useState('');
  const [filters, setFilters] = useState({ status: '', orderType: '', customerType: '', paymentType: '', search: '' });
  const [terms, setTerms] = useState([])
  const [companyName, setCompanyNam] = useState('')
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
  const [isExporting, setIsExporting] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({ ...selectedOrder, payments: [{ method: 'Cash', amount: '' }] } || { customerId: '', customerName: '', customerEmail: '', customerPhone: '', customerType: 'Retail', deliveryAddress: '', orderType: 'Offline', payments: [{ method: 'Cash', amount: '' }], items: [], customerAvailablePoints: 0, redeemPoints: 0, pointsToEarn: 0 });

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
  };

  const updateOrderPayment = async (orderId, additionalPayment, paymentMethod, notes) => {

    const response = await postData(`api/order/update-order-payment-by-admin/${orderId}`, { orderId, additionalPayment, paymentMethod, notes });
    console.log("response==>", response);
    if (response.success) {
      toast.success(response.message);
      fetchAllOrder();
    } else {
      toast.error(response.message);
    }
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
    console.log("SSSSS::=>", newOrderForm);
    return newOrderForm?.payments?.reduce((sum, payment) => {
      return sum + (parseFloat(payment?.amount) || 0);
    }, 0);
  };




  // Points calculation functions - Updated with new rules
  const calculatePointsToEarn = (finalAmount) => {
    return Math.floor((finalAmount * 4) / 100);
  };

  const calculatePointsValue = (points) => {
    // 1 point = ₹0.50
    return Number(points) * 0.5;
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


  // const handlePrintOrder = () => {
  //   if (!orderToPrint) return;

  //   let printContent = `
  //     <html>
  //       <head>
  //         <title>Order Invoice - ${orderToPrint.orderNumber}</title>
  //         <style>
  //           @media print {
  //             body { margin: 0; padding: 10mm; }
  //             .no-print { display: none; }
  //             * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  //           }
  //           body { 
  //             font-family: Arial, sans-serif; 
  //             margin: 0;
  //             padding: 10mm;
  //             background: white;
  //             color: black;
  //           }
  //           .header {
  //             text-align: center;
  //             border-bottom: 2px solid #000;
  //             padding-bottom: 10px;
  //             margin-bottom: 20px;
  //           }
  //           .company-name {
  //             font-size: 24px;
  //             font-weight: bold;
  //             margin-bottom: 5px;
  //           }
  //           .invoice-title {
  //             font-size: 18px;
  //             font-weight: bold;
  //             margin-top: 10px;
  //           }
  //           .section {
  //             margin-bottom: 20px;
  //           }
  //           .section-title {
  //             font-size: 14px;
  //             font-weight: bold;
  //             margin-bottom: 10px;
  //             border-bottom: 1px solid #ccc;
  //             padding-bottom: 5px;
  //           }
  //           .info-grid {
  //             display: grid;
  //             grid-template-columns: 1fr 1fr;
  //             gap: 20px;
  //             margin-bottom: 20px;
  //           }
  //           .info-item {
  //             margin-bottom: 5px;
  //           }
  //           .label {
  //             font-weight: bold;
  //             display: inline-block;
  //             width: 120px;
  //           }
  //           .items-table {
  //             width: 100%;
  //             border-collapse: collapse;
  //             margin-bottom: 20px;
  //           }
  //           .items-table th,
  //           .items-table td {
  //             border: 1px solid #000;
  //             padding: 8px;
  //             text-align: left;
  //           }
  //           .items-table th {
  //             background-color: #f5f5f5;
  //             font-weight: bold;
  //           }
  //           .item-image {
  //             width: 40px;
  //             height: 40px;
  //             object-fit: cover;
  //             border-radius: 4px;
  //           }
  //           .sizes-list {
  //             font-size: 12px;
  //             color: #666;
  //           }
  //           .totals-section {
  //             border-top: 2px solid #000;
  //             padding-top: 10px;
  //             text-align: right;
  //           }
  //           .total-row {
  //             display: flex;
  //             justify-content: space-between;
  //             margin-bottom: 5px;
  //           }
  //           .total-row.final {
  //             font-size: 16px;
  //             font-weight: bold;
  //             border-top: 1px solid #000;
  //             padding-top: 5px;
  //           }
  //           .payment-section {
  //             margin-top: 20px;
  //           }
  //           .payment-method {
  //             display: flex;
  //             justify-content: space-between;
  //             margin-bottom: 3px;
  //           }
  //           .footer {
  //             margin-top: 30px;
  //             text-align: center;
  //             font-size: 12px;
  //             color: #666;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="header">
  //           <div class="company-name">Anibhavi Creation Pvt. Ltd.</div>
  //           <div>Fashion & Apparel Store</div>
  //           <div class="invoice-title">ORDER INVOICE</div>
  //         </div>

  //         <div class="info-grid">
  //           <div>
  //             <div class="section-title">Order Information</div>
  //             <div class="info-item"><span class="label">Order Number:</span> ${orderToPrint.orderNumber}</div>
  //             <div class="info-item"><span class="label">Order Date:</span> ${orderToPrint.orderDate}</div>
  //             <div class="info-item"><span class="label">Order Type:</span> ${orderToPrint.orderType}</div>
  //             <div class="info-item"><span class="label">Status:</span> ${orderToPrint.status}</div>
  //           </div>
  //           <div>
  //             <div class="section-title">Customer Information</div>
  //             <div class="info-item"><span class="label">Name:</span> ${orderToPrint.customer.name}</div>
  //             <div class="info-item"><span class="label">Email:</span> ${orderToPrint.customer.email}</div>
  //             <div class="info-item"><span class="label">Phone:</span> ${orderToPrint.customer.phone}</div>
  //           </div>
  //         </div>

  //         <div class="section">
  //           <div class="section-title">Delivery Address</div>
  //           <div>${orderToPrint.customer.deliveryAddress}</div>
  //         </div>

  //         <div class="section">
  //           <div class="section-title">Order Items</div>
  //           <table class="items-table">
  //             <thead>
  //               <tr>
  //                 <th>Image</th>
  //                 <th>Product Set</th>
  //                 <th>Qty</th>
  //                 <th>Pcs/Set</th>
  //                 <th>Total Pcs</th>
  //                 <th>Price/Pc</th>
  //                 <th>Available Sizes</th>
  //                 <th>Total</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //   `;
  //   console.log("GGGG:=>GGGG:=>GGGG:=>", orderToPrint)
  //   orderToPrint.items.forEach(item => {
  //     const product = subProducts?.find(p => p?._id === item.productId._id);
  //     const totalPcs = item.quantity * item.pcsInSet;
  //     const lineTotal = item.quantity * item.pcsInSet * item.singlePicPrice;

  //     printContent += `
  //       <tr>
  //         <td>
  //           <img src="${product?.subProductImages?.[0] || item?.productId?.subProductImages?.[0] || ''}" alt="${item.name}" class="item-image" />
  //         </td>
  //         <td>${item?.color}</td>
  //         <td>${item.quantity}</td>
  //         <td>${item.pcsInSet}</td>
  //         <td>${totalPcs}</td>
  //         <td>₹${item.singlePicPrice}</td>
  //         <td class="sizes-list">${normalizeSizes(product?.sizes || product?.availableSizes) || normalizeSizes(item?.availableSizes) || 'N/A'}</td>
  //         <td>₹${lineTotal.toLocaleString()}</td>
  //       </tr>
  //     `;
  //   });

  //   printContent += `
  //             </tbody>
  //           </table>
  //         </div>

  //         <div class="totals-section">
  //           <div class="total-row">
  //             <span>Subtotal:</span>
  //             <span>₹${(orderToPrint.subtotal || orderToPrint.total + (orderToPrint.pointsRedemptionValue || 0)).toLocaleString()}</span>
  //           </div>
  //   `;

  //   if (orderToPrint.pointsRedeemed > 0) {
  //     printContent += `
  //           <div class="total-row">
  //             <span>Points Redeemed (${orderToPrint.pointsRedeemed.toLocaleString()} pts):</span>
  //             <span>-₹${orderToPrint.pointsRedemptionValue.toLocaleString()}</span>
  //           </div>
  //     `;
  //   }

  //   printContent += `
  //           <div class="total-row final">
  //             <span>Final Payable:</span>
  //             <span>₹${orderToPrint.total.toLocaleString()}</span>
  //           </div>
  //         </div>

  //         <div class="payment-section">
  //           <div class="section-title">Payment Information</div>
  //   `;

  //   if (orderToPrint.payments && orderToPrint.payments.length > 0) {
  //     orderToPrint.payments.forEach(payment => {
  //       if (parseFloat(payment.amount) > 0) {
  //         printContent += `
  //           <div class="payment-method">
  //             <span>${payment.method}:</span>
  //             <span>₹${parseFloat(payment.amount).toLocaleString()}</span>
  //           </div>
  //         `;
  //       }
  //     });
  //   }

  //   printContent += `
  //           <div class="payment-method">
  //             <span><strong>Total Paid:</strong></span>
  //             <span><strong>₹${orderToPrint.paidAmount.toLocaleString()}</strong></span>
  //           </div>
  //   `;

  //   if (orderToPrint.balanceAmount > 0) {
  //     printContent += `
  //           <div class="payment-method">
  //             <span><strong>Balance Due:</strong></span>
  //             <span><strong>₹${orderToPrint.balanceAmount.toLocaleString()}</strong></span>
  //           </div>
  //     `;
  //   }

  //   if (orderToPrint.pointsEarned > 0) {
  //     printContent += `
  //           <div class="payment-method">
  //             <span><strong>Points to Earn:</strong></span>
  //             <span><strong>${orderToPrint.pointsEarned.toLocaleString()} pts (₹${(orderToPrint.pointsEarnedValue || calculatePointsValue(orderToPrint.pointsEarned)).toLocaleString()})</strong></span>
  //           </div>
  //           <div class="payment-method">
  //             <span style="font-size: 11px; color: #666;">Points expire in 90 days from credit date</span>
  //           </div>
  //     `;
  //   }

  //   printContent += `
  //         </div>

  //         <div class="footer">
  //           <p>Thank you for your business!</p>
  //           <p>Order generated on ${new Date().toLocaleString()}</p>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   // Create a hidden iframe for printing
  //   const printFrame = document.createElement('iframe');
  //   printFrame.style.display = 'none';
  //   printFrame.style.position = 'absolute';
  //   printFrame.style.left = '-9999px';
  //   document.body.appendChild(printFrame);

  //   const doc = printFrame.contentWindow.document;
  //   doc.open();
  //   doc.write(printContent);
  //   doc.close();

  //   // Wait for content to load then print
  //   printFrame.onload = () => {
  //     setTimeout(() => {
  //       printFrame.contentWindow.focus();
  //       printFrame.contentWindow.print();

  //       setTimeout(() => {
  //         document.body.removeChild(printFrame);
  //       }, 1000);
  //     }, 500);
  //   };
  // };

  const handlePrintOrder = () => {
    if (!orderToPrint) return;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
    const fmtCurrency = (n) => `₹${fmt(n)}`;

    // ✅ Fix 3 — Payment status label + color
    const getPaymentStatusLabel = () => {
      const paid = Number(orderToPrint.paidAmount || 0);
      const balance = Number(orderToPrint.balanceAmount || 0);
      const total = Number(orderToPrint.total || 0);
      if (paid <= 0) return { label: 'Unpaid', color: '#DC2626' };
      if (balance <= 0) return { label: 'Fully Paid', color: '#16A34A' };
      if (paid >= total * 0.5) return { label: 'Partial Payment', color: '#D97706' };
      return { label: 'Partial Payment', color: '#D97706' };
    };
    const paymentStatus = getPaymentStatusLabel();

    // ✅ Fix 1 — Created by name not role
    const createdByName = orderToPrint.createdBy?.name ?? 'System';

    // Items rows HTML
    let itemsRows = '';
    (orderToPrint.items || []).forEach((item) => {
      const subProduct = item?.productId;                      // already populated in data
      const imageUrl = subProduct?.subProductImages?.[0] ?? '';
      const lotNumber = subProduct?.lotNumber ?? '—';
      const color = item?.color ?? subProduct?.color ?? '—';
      const qty = Number(item.quantity || 0);
      const pcsInSet = Number(item.pcsInSet || subProduct?.pcsInSet || 1);
      const price = Number(item.singlePicPrice || subProduct?.singlePicPrice || 0);
      const totalPcs = qty * pcsInSet;
      const lineTotal = totalPcs * price;
      const sizes = (() => {
        try {
          const raw = subProduct?.sizes ?? item?.availableSizes ?? [];
          const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return Array.isArray(arr) ? arr.join(', ') : 'N/A';
        } catch { return 'N/A'; }
      })();

      itemsRows += `
        <tr>
          <td style="text-align:center;">
            ${imageUrl
          ? `<img src="${imageUrl}" alt="Product" style="width:50px;height:50px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />`
          : `<div style="width:50px;height:50px;background:#f3f4f6;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;">No Img</div>`
        }
          </td>
          <td><strong>Lot: ${lotNumber}</strong><br/><span style="color:#6b7280;font-size:11px;">Color: ${color}</span></td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:center;">${pcsInSet}</td>
          <td style="text-align:center;font-weight:600;">${totalPcs}</td>
          <td style="text-align:right;">${fmtCurrency(price)}</td>
          <td style="font-size:11px;color:#6b7280;">${sizes}</td>
          <td style="text-align:right;font-weight:700;">${fmtCurrency(lineTotal)}</td>
        </tr>`;
    });

    // Payments rows HTML
    let paymentsHTML = '';
    (orderToPrint.payments || []).forEach((p) => {
      if (Number(p.amount) > 0) {
        paymentsHTML += `
          <div class="total-row">
            <span>${p.method}:</span>
            <span>${fmtCurrency(p.amount)}</span>
          </div>`;
      }
    });

    // Points section HTML
    let pointsHTML = '';
    if (Number(orderToPrint.pointsRedeemed) > 0) {
      pointsHTML += `
        <div class="total-row" style="color:#7c3aed;">
          <span>Points Redeemed (${fmt(orderToPrint.pointsRedeemed)} pts):</span>
          <span>-${fmtCurrency(orderToPrint.pointsRedemptionValue)}</span>
        </div>`;
    }
    if (Number(orderToPrint.pointsEarned) > 0) {
      pointsHTML += `
        <div class="total-row" style="color:#16a34a;margin-top:4px;">
          <span>🎁 Points Earned:</span>
          <span>+${fmt(orderToPrint.pointsEarned)} pts (${fmtCurrency(orderToPrint.pointsEarnedValue)})</span>
        </div>
        <div style="font-size:10px;color:#9ca3af;text-align:right;">Points expire in 90 days from credit date</div>`;
    }

    // Balance section
    const balanceHTML = Number(orderToPrint.balanceAmount) > 0 ? `
      <div class="total-row" style="color:#DC2626;">
        <span><strong>Balance Due:</strong></span>
        <span><strong>${fmtCurrency(orderToPrint.balanceAmount)}</strong></span>
      </div>` : '';

    // Transport info
    const transportHTML = (orderToPrint.transportName || orderToPrint.trackingId || orderToPrint.deliveryVendor) ? `
      <div class="section">
        <div class="section-title">Transport Information</div>
        <div class="info-grid">
          ${orderToPrint.transportName ? `<div class="info-item"><span class="label">Transport:</span> ${orderToPrint.transportName}</div>` : ''}
          ${orderToPrint.deliveryVendor ? `<div class="info-item"><span class="label">Vendor:</span> ${orderToPrint.deliveryVendor}</div>` : ''}
          ${orderToPrint.trackingId ? `<div class="info-item"><span class="label">Tracking ID:</span> ${orderToPrint.trackingId}</div>` : ''}
        </div>
      </div>` : '';

    // Order note
    const noteHTML = orderToPrint.orderNote ? `
      <div class="section">
        <div class="section-title">Order Note</div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px;font-size:12px;">${orderToPrint.orderNote}</div>
      </div>` : '';

    // ✅ Fix 2 — Dynamic Terms & Conditions (customize these as needed)
    const termsAndConditions = [
      "All sales are final. Goods once sold will not be returned unless found defective.",
      "Payment is due within the credit period agreed upon at the time of order.",
      "Any discrepancies in the invoice must be reported within 48 hours of receipt.",
      "Goods remain the property of the seller until full payment is received.",
      "Late payments may attract interest as per mutual agreement.",
      "Disputes, if any, shall be subject to the jurisdiction of the local courts.",
      "This invoice is computer-generated and does not require a signature.",
      "Points earned will be credited within 24 hours of order confirmation.",
      "Points are non-transferable and have no cash value.",
    ];

    const termsHTML = terms
      .map((t, i) => `<li style="margin-bottom:4px;">${i + 1}. ${t}</li>`)
      .join('');

    // ── Full HTML ─────────────────────────────────────────────────────────────
    const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Order Invoice - ${orderToPrint.orderNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 8mm; }
      .no-print { display: none; }
      * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      margin: 0; padding: 10mm;
      background: white; color: #111;
      font-size: 13px; line-height: 1.5;
    }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px;
    }
    .company-block { flex: 1; }
    .company-name { font-size: 22px; font-weight: 800; color: #1e293b; }
    .company-sub  { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .invoice-block { text-align: right; }
    .invoice-title { font-size: 20px; font-weight: 700; color: #4f46e5; }
    .invoice-meta  { font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* ✅ Fix 3 — Payment status badge */
    .payment-status-badge {
      display: inline-block;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700;
      margin-top: 6px;
    }

    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #4f46e5;
      border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { margin-bottom: 4px; font-size: 12px; }
    .label { font-weight: 600; color: #374151; display: inline-block; min-width: 110px; }

    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    .items-table th {
      background: #f1f5f9; font-weight: 700; text-transform: uppercase;
      font-size: 10px; letter-spacing: 0.05em;
      border: 1px solid #e2e8f0; padding: 8px 6px;
    }
    .items-table td {
      border: 1px solid #e2e8f0; padding: 8px 6px; vertical-align: middle;
    }
    .items-table tr:nth-child(even) td { background: #f8fafc; }

    .totals-wrapper {
      display: flex; justify-content: flex-end; margin-bottom: 20px;
    }
    .totals-box {
      width: 320px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
    }
    .totals-header {
      background: #f1f5f9; padding: 8px 14px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #475569;
    }
    .total-row {
      display: flex; justify-content: space-between;
      padding: 5px 14px; font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-row.final {
      background: #1e293b; color: white;
      font-size: 14px; font-weight: 700; padding: 10px 14px;
    }
    .total-row.paid-row { background: #f0fdf4; color: #16a34a; font-weight: 600; }

    .terms-section {
      margin-top: 24px; padding: 12px 16px;
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
    }
    .terms-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #374151; margin-bottom: 8px;
    }
    .terms-list {
      margin: 0; padding: 0; list-style: none;
      font-size: 10.5px; color: #6b7280; line-height: 1.6;
    }

    .footer {
      margin-top: 24px; text-align: center;
      font-size: 11px; color: #9ca3af;
      border-top: 1px solid #e2e8f0; padding-top: 12px;
    }
    .signature-row {
      display: flex; justify-content: space-between;
      margin-top: 30px; padding-top: 10px;
    }
    .signature-box { text-align: center; width: 160px; }
    .signature-line { border-top: 1px solid #374151; padding-top: 4px; font-size: 11px; color: #6b7280; }
  </style>
</head>
<body>

  <!-- ── Header ── -->
  <div class="header">
    <div class="company-block">
      <div class="company-name">Anibhavi Creation Pvt. Ltd.</div>
      <div class="company-sub">Fashion &amp; Apparel Store</div>
      <div class="company-sub">GST: 07AAAPZ1234A1Z5 &nbsp;|&nbsp; +91 98765 43210</div>
    </div>
    <div class="invoice-block">
      <div class="invoice-title">ORDER INVOICE</div>
      <div class="invoice-meta">${orderToPrint.orderNumber}</div>
      <div class="invoice-meta">Date: ${orderToPrint.orderDate}</div>
      <div class="invoice-meta">Type: ${orderToPrint.orderType}</div>
      <!-- ✅ Fix 3 — Payment status badge -->
      <div>
        <span class="payment-status-badge" style="background:${paymentStatus.color}22;color:${paymentStatus.color};border:1px solid ${paymentStatus.color}44;">
          ${paymentStatus.label}
        </span>
      </div>
    </div>
  </div>

  <!-- ── Order + Customer Info ── -->
  <div class="section">
    <div class="info-grid">
      <div>
        <div class="section-title">Order Information</div>
        <div class="info-item"><span class="label">Order No:</span> ${orderToPrint.orderNumber}</div>
        <div class="info-item"><span class="label">Order Date:</span> ${orderToPrint.orderDate}</div>
        <div class="info-item"><span class="label">Order Type:</span> ${orderToPrint.orderType}</div>
        <div class="info-item"><span class="label">Status:</span> ${orderToPrint.status}</div>
        <div class="info-item"><span class="label">Payment Type:</span> ${orderToPrint.paymentType}</div>
        <!-- ✅ Fix 1 — Created by NAME not role -->
        <div class="info-item"><span class="label">Created By:</span> ${createdByName}</div>
      </div>
      <div>
        <div class="section-title">Customer Information</div>
        <div class="info-item"><span class="label">Name:</span> ${orderToPrint.customer?.name ?? '—'}</div>
        <div class="info-item"><span class="label">Email:</span> ${orderToPrint.customer?.email ?? '—'}</div>
        <div class="info-item"><span class="label">Phone:</span> ${orderToPrint.customer?.phone ?? '—'}</div>
        <div class="info-item"><span class="label">Shop:</span> ${orderToPrint.customer?.userId?.shopname ?? '—'}</div>
        <div class="info-item"><span class="label">Customer ID:</span> ${orderToPrint.customer?.userId?.uniqueUserId ?? '—'}</div>
      </div>
    </div>
  </div>

  <!-- ── Delivery Address ── -->
  <div class="section">
    <div class="section-title">Delivery Address</div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 12px;font-size:12px;">
      ${orderToPrint.customer?.deliveryAddress ?? '—'}
    </div>
  </div>

  <!-- ── Transport ── -->
  ${transportHTML}

  <!-- ── Order Note ── -->
  ${noteHTML}

  <!-- ── Order Items ── -->
  <div class="section">
    <div class="section-title">Order Items</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:60px;">Image</th>
          <th>Lot / Color</th>
          <th style="text-align:center;">Qty (Sets)</th>
          <th style="text-align:center;">Pcs/Set</th>
          <th style="text-align:center;">Total Pcs</th>
          <th style="text-align:right;">Price/Pc</th>
          <th>Sizes</th>
          <th style="text-align:right;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  </div>

  <!-- ── Totals ── -->
  <div class="totals-wrapper">
    <div class="totals-box">
      <div class="totals-header">Payment Summary</div>
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${fmtCurrency(orderToPrint.subtotal)}</span>
      </div>
      ${pointsHTML}
      <div class="total-row final">
        <span>Final Payable:</span>
        <span>${fmtCurrency(orderToPrint.total)}</span>
      </div>
      ${paymentsHTML}
      <div class="total-row paid-row">
        <span><strong>Total Paid:</strong></span>
        <span><strong>${fmtCurrency(orderToPrint.paidAmount)}</strong></span>
      </div>
      ${balanceHTML}
    </div>
  </div>

  <!-- ── Signature Row ── -->
  <div class="signature-row">
    <div class="signature-box">
      <div style="height:40px;"></div>
      <div class="signature-line">Customer Signature</div>
    </div>
    <div class="signature-box">
      <div style="height:40px;"></div>
      <div class="signature-line">Authorised Signatory</div>
    </div>
  </div>

  <!-- ✅ Fix 2 — Terms & Conditions page (dynamic) -->
  <div class="terms-section">
    <div class="terms-title">📋 Terms &amp; Conditions</div>
    <ul class="terms-list">
      ${termsHTML}
    </ul>
  </div>

  <!-- ── Footer ── -->
  <div class="footer">
    <p>Thank you for your business with Anibhavi Creation Pvt. Ltd.!</p>
    <p>Generated on ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Order: ${orderToPrint.orderNumber}</p>
  </div>

</body>
</html>`;

    // ── Print via hidden iframe ────────────────────────────────────────────────
    const printFrame = document.createElement('iframe');
    printFrame.style.cssText = 'display:none;position:absolute;left:-9999px;width:0;height:0;';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 2000);
      }, 600);
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

  const fetchTermAndCondition = useCallback(async () => {
    try {
      const res = await getData("api/termAndCondition/get");

      if (res?.success && res?.data) {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          setTerms(data.terms ?? data.termsList ?? []);
          setCompanyName(data.companyName ?? "Anibhavi Creation Pvt. Ltd.");
        }
      }
    } catch (err) {
      console.error("fetchTermAndCondition:", err); // ✅ never silent
    }
  }, []);

  useEffect(() => {
    fetchAllOrder()
    fetchTermAndCondition()
  }, [currentPage, filters.search])

  useEffect(() => {
    fetchProductsWithPagination()
  }, [productSearchQuery, currentPageSubProduct])

  //////////////////NOTS////////////////
  const openEditOrderNote = (order) => {
    setEditOrderNoteForm({
      orderId: order._id,
      orderNote: order?.orderNote || ''
    });
    setShowEditOrderNoteModal(true);
  };

  const openDeleteOrder = async (order) => {
    setSelectedOrder(order);
    setShowDeleteOrderModal(true);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this order!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await getData(`api/order/move-to-recycle-bin/${order?._id}`);
        console.log("SXSXXXXXX==>", response)
        if (response.status === true) {
          Swal.fire("Deleted!", "The cart has been deleted.", "success");
          fetchAllOrder();
        } else {
          Swal.fire("Failed!", response?.message || "Delete failed", "error");
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error!", "Something went wrong!", "error");
      }
    }


  };

  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
      setPermiton(response?.data[0]?.permissions?.orders)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [user?.role])



  const handleUpdateOrder = (order) => {
    console.log("XXXXXXX::=>", order);
    setNewOrderForm({
      ...order,
      customerId: order?.customer?.userId?._id,
      customerName: order?.customer?.userId?.name,
      customerEmail: order?.customer?.userId?.email,
      customerPhone: order?.customer?.userId?.phone,
      deliveryAddress: order?.customer?.deliveryAddress,
      redeemPoints: order?.pointsRedeemed,
      orderNote: order?.orderNote,
      items: order?.items.map((item) => ({
        productId: item?.productId?._id,
        color: item?.color,
        quantity: item?.quantity,
        singlePicPrice: item?.singlePicPrice,
        pcsInSet: item?.pcsInSet,
        availableSizes: item?.availableSizes
      }))

    });

    setShowEditOrderModal(true)
    setShowOrderModal(false);

  }

  // ─── Excel Export ──────────────────────────────────────────────────────────
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL orders (no pagination limit) for export
      const response = await getData(`api/order/get-all-orders-by-admin-with-pagination?page=1&limit=99999&search=${filters?.search}`);
      const allOrders = response?.orders || filteredOrders;

      const rows = allOrders.map((order) => {
        const itemsSummary = order.items
          ?.map(item => `${item.color || item.name} x${item.quantity} sets (${item.pcsInSet} pcs/set @ ₹${item.singlePicPrice})`)
          .join(' | ');

        const paymentsSummary = order.payments
          ?.filter(p => parseFloat(p.amount) > 0)
          .map(p => `${p.method}: ₹${parseFloat(p.amount).toLocaleString()}`)
          .join(' | ');

        return {
          'Order Number': order.orderNumber || '',
          'Order Date': order.orderDate || '',
          'Order Type': order.orderType || '',
          'Status': order.status || '',
          'Payment Type': order.paymentType || '',
          'Customer Name': order.customer?.name || '',
          'Customer Email': order.customer?.email || '',
          'Customer Phone': order.customer?.phone || '',
          'Customer Type': order.customer?.type || '',
          'Delivery Address': order.customer?.deliveryAddress || '',
          'Items': itemsSummary || '',
          'Total Sets': order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0,
          'Total Pieces': order.items?.reduce((s, i) => s + ((i.quantity || 0) * (i.pcsInSet || 0)), 0) || 0,
          'Subtotal (₹)': order.subtotal || order.total || 0,
          'Points Redeemed': order.pointsRedeemed || 0,
          'Points Discount (₹)': order.pointsRedemptionValue || 0,
          'Total Amount (₹)': order.total || 0,
          'Paid Amount (₹)': order.paidAmount || 0,
          'Balance Amount (₹)': order.balanceAmount || 0,
          'Payment Methods': paymentsSummary || '',
          'Points Earned': order.pointsEarned || 0,
          'Tracking ID': order.trackingId || '',
          'Delivery Vendor': order.deliveryVendor || '',
          'Order Note': order.orderNote || '',
          'Transport Name': order.transportName || '',
          'Created By': order.createdBy?.name || '',
          'Created By Email': order.createdBy?.email || '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Column widths
      const colWidths = [
        { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
        { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 35 },
        { wch: 55 }, { wch: 12 }, { wch: 13 }, { wch: 14 }, { wch: 14 },
        { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 15 }, { wch: 16 },
        { wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 20 },
        { wch: 16 }, { wch: 18 }, { wch: 22 },
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Summary sheet
      const totalRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
      const totalPaid = allOrders.reduce((s, o) => s + (o.paidAmount || 0), 0);
      const totalBalance = allOrders.reduce((s, o) => s + (o.balanceAmount || 0), 0);
      const statusCounts = allOrders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      const summaryData = [
        ['Orders Export Summary'],
        ['Generated On', new Date().toLocaleString()],
        ['Total Orders', allOrders.length],
        [],
        ['Revenue Summary'],
        ['Total Revenue (₹)', totalRevenue],
        ['Total Paid (₹)', totalPaid],
        ['Total Balance (₹)', totalBalance],
        [],
        ['Status Breakdown'],
        ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const fileName = `Orders_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success(`Exported ${allOrders.length} orders to ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  console.log("selectedOrder=>>>", selectedOrder,)

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage online and offline orders with payment tracking</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Export to Excel Button */}
            <Button
              onClick={exportToExcel}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <i className="ri-file-excel-line"></i>
                  <span>Export Excel</span>
                </>
              )}
            </Button>

            {/* Create Order Button */}
            {permiton?.write && (
              <Button
                onClick={() => setShowCreateOrderModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>Create Order</span>
              </Button>
            )}
          </div>
          {/* {permiton?.write && <Button
            onClick={() => setShowCreateOrderModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line"></i>
            <span>Create Order</span>
          </Button>} */}
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
            openEditOrderNote={openEditOrderNote}
            openDeleteOrder={openDeleteOrder}
            permiton={permiton}
            showCreateOrderModal={showCreateOrderModal}
            setShowCreateOrderModal={setShowCreateOrderModal}
            showEditOrderModal={showEditOrderModal}
            setShowEditOrderModal={setShowEditOrderModal}
            setNewOrderForm={setNewOrderForm}
          />
        </Card>


        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-shopping-cart-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No orders found matching your criteria</p>
          </div>
        )}

        {showEditOrderNoteModal && (
          <CreateNotesModel
            fetchAllOrder={fetchAllOrder}
            setEditOrderNoteForm={setEditOrderNoteForm}
            editOrderNoteForm={editOrderNoteForm}
            setShowEditOrderNoteModal={setShowEditOrderNoteModal}
          />)}

        {/* Create Order Modal */}
        {showCreateOrderModal && (
          <CreateOrderModal
            // selectedOrder={selectedOrder}
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
            fetchAllOrder={fetchAllOrder}
          />
        )}

        {/* Edit Order Modal */}
        {showEditOrderModal && (
          <EditOrderModel
            // selectedOrder={selectedOrder}
            subProducts={subProducts}
            getTotalPaidAmount={getTotalPaidAmount}
            calculatePointsValue={calculatePointsValue}
            calculatePointsToEarn={calculatePointsToEarn}
            setNewOrderForm={setNewOrderForm}
            newOrderForm={newOrderForm}
            setShowProductSelectionModal={setShowProductSelectionModal}
            setShowEditOrderModal={setShowEditOrderModal}
            setShowPrintOrderModal={setShowPrintOrderModal}
            orders={orders} setOrders={setOrders}
            setFilteredOrders={setFilteredOrders}
            filteredOrders={filteredOrders}
            setOrderToPrint={setOrderToPrint}
            fetchAllOrder={fetchAllOrder}
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const balance = parseFloat(selectedOrder?.balanceAmount || 0);

                        if (value <= balance) {
                          setPaymentUpdateForm({ ...paymentUpdateForm, paidAmount: value });
                        } else {
                          alert("⚠️ Paid amount cannot exceed the remaining balance!");
                        }
                      }}
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
                    className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-500"
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
                  <h2 className="text-xl font-semibold">{selectedOrder.status === 'Packed' ? 'Please Create Delivery Challan' : 'Update Order Status'}</h2>
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

                {selectedOrder.status === 'Packed' ? <div className="space-y-4">

                </div> : <div className="space-y-4">
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
                </div>}

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowStatusUpdateModal(false);
                      setStatusUpdateForm({ newStatus: '', trackingId: '', deliveryVendor: '' });
                    }}
                    className="flex-1 bg-gray-900 text-gray-700 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  {selectedOrder.status === 'Packed' ? '' : <Button
                    onClick={handleStatusUpdate}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Update Status
                  </Button>}
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
                    {permiton.update && <div className="flex space-x-1">
                      <Button
                        onClick={() => {
                          handleUpdateOrder(selectedOrder);
                        }}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-2 py-1 rounded"
                      >
                        Edit Order
                      </Button>

                    </div>}
                    <Button
                      onClick={() => {
                        navigate(`/admin/returns`, { state: { order: selectedOrder, model: true } });
                      }}
                      className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-2 py-1 rounded"
                    >
                      Create Challan
                    </Button>
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
                          <div><span className="text-gray-500">Name:</span> {selectedOrder?.customer?.name}</div>
                          <div><span className="text-gray-500">Email:</span> {selectedOrder?.customer?.email}</div>
                          <div><span className="text-gray-500">Phone:</span> {selectedOrder?.customer?.phone}</div>
                          {selectedOrder?.customer?.type &&
                            <div><span className="text-gray-500">Type:</span> {selectedOrder?.customer?.type}</div>
                          }
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Order Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Date:</span> {selectedOrder?.orderDate}</div>
                          <div><span className="text-gray-500">Type:</span> {selectedOrder?.orderType}</div>
                          <div><span className="text-gray-500">Payment Method:</span> {selectedOrder?.paymentMethod}</div>
                          <div><span className="text-gray-500">Total Amount:</span> ₹{selectedOrder?.total.toLocaleString()}</div>
                          {selectedOrder?.orderNote && (
                            <div><span className="text-gray-500">Note:</span> {selectedOrder?.orderNote}</div>
                          )}
                          {selectedOrder?.transportName && (
                            <div><span className="text-gray-500">Transport:</span> {selectedOrder?.transportName}</div>
                          )}
                        </div>
                      </div>

                      {selectedOrder?.createdBy && <div>
                        <h3 className="font-medium mb-3">Order Created By</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Name:</span> {selectedOrder?.createdBy?.name}</div>
                          <div><span className="text-gray-500">Email:</span> {selectedOrder?.createdBy?.email}</div>
                        </div>
                      </div>}
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
                            <div className="font-medium text-green-600">₹{selectedOrder?.paidAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Additional Discount:</span>
                            <div className="font-medium text-green-600">₹{selectedOrder?.additionalDiscount.toLocaleString()}</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Balance Amount:</span>
                            <div className={`font-medium ${selectedOrder?.balanceAmount || selectedOrder?.total - selectedOrder?.paidAmount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              ₹{selectedOrder?.balanceAmount?.toLocaleString() || (selectedOrder?.total - selectedOrder?.paidAmount)}
                            </div>
                          </div>
                        </div>

                        {/* Points Information */}
                        {(selectedOrder?.pointsRedeemed > 0 || selectedOrder?.pointsEarned > 0) && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Points Activity</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {selectedOrder?.pointsRedeemed > 0 && (
                                <div>
                                  <span className="text-gray-500">Points Redeemed:</span>
                                  <div className="text-right">
                                    <div className="font-medium text-orange-800">
                                      {selectedOrder?.pointsRedeemed.toLocaleString()} pts
                                    </div>
                                    <div className="text-xs text-orange-600">
                                      Discount: ₹{selectedOrder?.pointsRedemptionValue?.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {selectedOrder?.pointsEarned > 0 && (
                                <div>
                                  <span className="text-gray-500">Points Earned:</span>
                                  <div className="text-right">
                                    <div className="font-medium text-green-800">
                                      {selectedOrder.pointsEarned.toLocaleString()} pts
                                    </div>
                                    <div className="text-xs text-green-600">
                                      Value: ₹{selectedOrder?.pointsEarnedValue?.toLocaleString() || calculatePointsValue(selectedOrder?.pointsEarned).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Multiple Payment Methods Display */}
                        {selectedOrder?.payments && selectedOrder?.payments.length > 0 && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Payment Methods</h4>
                            <div className="space-y-1">
                              {selectedOrder?.payments?.map((payment, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{payment?.method}:</span>
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
                          const product = subProducts.find(p => p._id === item.productId);
                          const totalPcs = item.quantity * item.pcsInSet;
                          const lineTotal = item.quantity * item.pcsInSet * item.singlePicPrice;
                          // console.log("hhhhhh>>", item)
                          return (
                            <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                              <img
                                src={product?.images?.[0] || item?.productId?.subProductImages?.[0] || 'https://readdy.ai/api/search-image?query=product%20set%20pieces%20fashion%20clean%20background&width=100&height=100&seq=placeholder-detail&orientation=squarish'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.color}</div>
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
                      {permiton.update && <div className="mt-6 space-y-2">
                        {canUpdateStatus(selectedOrder?.status) && (
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
                        {selectedOrder.status !== 'Cancelled' &&
                          // selectedOrder.status !== 'Delivered' &&
                          (
                            <Button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this order?')) {
                                  updateOrderStatus(selectedOrder._id, 'Cancelled');
                                  setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                                }
                              }}
                              className="w-full bg-red-600 text-white hover:bg-red-700 text-sm"
                            >
                              Cancel Order
                            </Button>
                          )}
                      </div>}
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
