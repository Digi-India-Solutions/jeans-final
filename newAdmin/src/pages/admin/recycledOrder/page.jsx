import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
// import CreateOrderModal from './CreateOrderModal';
import { getData, postData } from '../../../services/FetchNodeServices';
// import ProductSelectionModal from './ProductSelectionModal';
import OrderTable from './OrderTable';
import { toast } from 'react-toastify';
import FilteredOrdersCom from './FilteredOrdersCom';
// import CreateNotesModel from './CreateNotesModel';
import Swal from "sweetalert2";

export default function OrdersManagement() {
    const [subProducts, setSubProducts] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [orders, setOrders] = useState([]);

    const [filteredOrders, setFilteredOrders] = useState(orders);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false)
    const [statusUpdateForm, setStatusUpdateForm] = useState({ newStatus: '', trackingId: '', deliveryVendor: '' });
    const [paymentUpdateForm, setPaymentUpdateForm] = useState({ paidAmount: '', paymentMethod: '', notes: '' });
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
    const [permiton, setPermiton] = useState('');
    const [filters, setFilters] = useState({ status: '', orderType: '', customerType: '', paymentType: '', search: '' });

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


    const calculatePointsValue = (points) => {
        // 1 point = ₹0.50
        return points * 0.5;
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


    const fetchAllOrder = async () => {
        try {
            const response = await getData(`api/order/get-all-recycled-orders-by-admin-with-pagination?page=${currentPage}&limit=12&search=${filters?.search}`);
            console.log("XXXXXXXXXXX:=-=>yy===>", response.orders)
            if (response.success === true) {
                // console.log("XXXXXXXXXXX:=-=>yy===>", response.orders.filter(order => order?.recycleBin === true))
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

    //////////////////NOTS////////////////
    const openRestoreOrder = async (order) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this order!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "rgba(78, 204, 56, 1)",
            cancelButtonColor: "#4780b6ff",
            confirmButtonText: "Yes, restore it!",
        });

        if (result.isConfirmed) {
            try {
                 console.log("response==>SSSSS");
                const response = await getData(`api/order/move-to-order/${order?._id}`);
                console.log("response==>MMMMM", response);
                if (response.status === true) {
                    Swal.fire("Deleted!", "The Order has been restored.", "success");
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

    const openDeleteOrder = async (order) => {
        setSelectedOrder(order);
        setShowDeleteOrderModal(true);
        // console.log("order:==>", order)
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to deleted permanently this order!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await getData(`api/order/order-delete/${order?._id}`);
                console.log("response:==>", response)
                if (response.status === true) {
                    Swal.fire("Deleted!", "The order has been deleted permanently.", "success");
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


    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                        <p className="text-gray-600 mt-1">Manage online and offline orders with payment tracking</p>
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
                        openRestoreOrder={openRestoreOrder}
                        openDeleteOrder={openDeleteOrder}
                        permiton={permiton}
                    />
                </Card>


                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <i className="ri-shopping-cart-line text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">No orders found matching your criteria</p>
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

                                <div className="grid grid-cols-1 lg:grid-cols-0 gap-6">
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
                                                    <div><span className="text-gray-500">Type:</span> {selectedOrder?.customer?.type}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-medium mb-3">Order Information</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div><span className="text-gray-500">Date:</span> {selectedOrder?.orderDate}</div>
                                                    <div><span className="text-gray-500">Type:</span> {selectedOrder?.orderType}</div>
                                                    <div><span className="text-gray-500">Payment Method:</span> {selectedOrder?.paymentMethod}</div>
                                                    <div><span className="text-gray-500">Final Total:</span> ₹{selectedOrder?.total.toLocaleString()}</div>
                                                    {selectedOrder?.orderNote && (
                                                        <div><span className="text-gray-500">Note:</span> {selectedOrder?.orderNote}</div>
                                                    )}
                                                    {selectedOrder?.transportName && (
                                                        <div><span className="text-gray-500">Transport:</span> {selectedOrder?.transportName}</div>
                                                    )}
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
