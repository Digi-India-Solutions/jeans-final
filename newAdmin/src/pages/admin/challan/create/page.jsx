
import { useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';

export default function CreateChallan() {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    deliveryVendor: 'BlueDart',
    trackingId: '',
    items: [
      {
        productName: '',
        size: '',
        quantity: 1,
        price: 0
      }
    ],
    totalAmount: 0,
    deliveryDate: '',
    notes: ''
  });

  const [orders] = useState([
    { id: 'ORD-2024-001', customer: 'Rajesh Kumar', amount: 6897, status: 'Packed' },
    { id: 'ORD-2024-002', customer: 'Fashion Store Pvt Ltd', amount: 29985, status: 'Packed' },
    { id: 'ORD-2024-003', customer: 'Priya Sharma', amount: 3798, status: 'Packed' },
    { id: 'ORD-2024-004', customer: 'Vikash Kumar', amount: 2199, status: 'Packed' },
    { id: 'ORD-2024-005', customer: 'Meera Joshi', amount: 4599, status: 'Packed' }
  ]);

  const [products] = useState([
    { id: 1, name: 'Premium Skinny Jeans', price: 2499 },
    { id: 2, name: 'Formal Cotton Shirt', price: 1899 },
    { id: 3, name: 'Casual Denim Shirt', price: 1599 },
    { id: 4, name: 'Regular Fit Jeans', price: 2199 },
    { id: 5, name: 'Formal Dress Shirt', price: 2299 }
  ]);

  const sizes = ['28', '30', '32', '34', '36', '38', '40', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const vendors = ['BlueDart', 'DTDC', 'Delhivery', 'FedEx', 'Aramex', 'Ecom Express'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate item total if quantity or price changed
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    });

    // Calculate total amount
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount: totalAmount
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', size: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        totalAmount: totalAmount
      }));
    }
  };

  const loadOrderData = (orderNumber) => {
    const order = orders.find(o => o.id === orderNumber);
    if (order) {
      setFormData(prev => ({
        ...prev,
        orderNumber: order.id,
        customerName: order.customer,
        totalAmount: order.amount,
        // Mock customer details
        customerAddress: '123 Main Street, City, State - 123456',
        customerPhone: '+91 98765 43210'
      }));
    }
  };

  const generateChallan = () => {
    if (!formData.orderNumber || !formData.customerName || formData.items.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    // Mock challan generation
    const challanNumber = `CHN-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    console.log('Generated Challan:', {
      challanNumber,
      ...formData,
      generatedDate: new Date().toISOString().split('T')[0]
    });

    alert(`Challan Generated Successfully!\nChallan Number: ${challanNumber}`);
    
    // Reset form
    setFormData({
      orderNumber: '',
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      deliveryVendor: 'BlueDart',
      trackingId: '',
      items: [{ productName: '', size: '', quantity: 1, price: 0 }],
      totalAmount: 0,
      deliveryDate: '',
      notes: ''
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Delivery Challan</h1>
          <p className="text-gray-600 mt-1">Generate delivery challan for packed orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Challan Details</h2>
                
                {/* Order Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Order *
                    </label>
                    <div className="relative">
                      <select
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={(e) => {
                          handleInputChange(e);
                          loadOrderData(e.target.value);
                        }}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="">Choose Order</option>
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.id} - {order.customer} (₹{order.amount.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Vendor
                      </label>
                      <div className="relative">
                        <select
                          name="deliveryVendor"
                          value={formData.deliveryVendor}
                          onChange={handleInputChange}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking ID
                      </label>
                      <input
                        type="text"
                        name="trackingId"
                        value={formData.trackingId}
                        onChange={handleInputChange}
                        placeholder="Enter tracking ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium">Items</h3>
                    <Button
                      onClick={addItem}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm px-3 py-1"
                    >
                      <i className="ri-add-line mr-1"></i>
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Product
                            </label>
                            <div className="relative">
                              <select
                                value={item.productName}
                                onChange={(e) => {
                                  const selectedProduct = products.find(p => p.name === e.target.value);
                                  handleItemChange(index, 'productName', e.target.value);
                                  if (selectedProduct) {
                                    handleItemChange(index, 'price', selectedProduct.price);
                                  }
                                }}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                              >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.name}>
                                    {product.name} - ₹{product.price}
                                  </option>
                                ))}
                              </select>
                              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Size
                            </label>
                            <div className="relative">
                              <select
                                value={item.size}
                                onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                              >
                                <option value="">Size</option>
                                {sizes.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Price
                              </label>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            {formData.items.length > 1 && (
                              <Button
                                onClick={() => removeItem(index)}
                                className="ml-2 bg-red-50 text-red-600 hover:bg-red-100 p-2"
                              >
                                <i className="ri-delete-bin-line text-sm"></i>
                              </Button>
                            )}
                          </div>
                        </div>
                        {item.quantity > 0 && item.price > 0 && (
                          <div className="mt-2 text-right">
                            <span className="text-sm font-medium text-gray-600">
                              Item Total: ₹{(item.quantity * item.price).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add any special instructions or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={generateChallan}
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <i className="ri-file-list-3-line"></i>
                    <span>Generate Challan</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData({
                        orderNumber: '',
                        customerName: '',
                        customerAddress: '',
                        customerPhone: '',
                        deliveryVendor: 'BlueDart',
                        trackingId: '',
                        items: [{ productName: '', size: '', quantity: 1, price: 0 }],
                        totalAmount: 0,
                        deliveryDate: '',
                        notes: ''
                      });
                    }}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear Form
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Challan Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Order Number:</span>
                    <p className="font-medium">{formData.orderNumber || 'Not selected'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Customer:</span>
                    <p className="font-medium">{formData.customerName || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Items Count:</span>
                    <p className="font-medium">{formData.items.filter(item => item.productName).length} items</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Delivery Vendor:</span>
                    <p className="font-medium">{formData.deliveryVendor}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <p className="text-xl font-bold text-green-600">₹{formData.totalAmount.toLocaleString()}</p>
                  </div>
                  
                  {formData.deliveryDate && (
                    <div>
                      <span className="text-sm text-gray-500">Delivery Date:</span>
                      <p className="font-medium">{formData.deliveryDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.href = '/admin/orders'}
                    className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  >
                    <i className="ri-shopping-bag-line mr-2"></i>
                    View All Orders
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/admin/returns'}
                    className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  >
                    <i className="ri-file-list-3-line mr-2"></i>
                    Manage Challans
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/admin/application/products'}
                    className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  >
                    <i className="ri-shirt-line mr-2"></i>
                    Product Catalog
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
