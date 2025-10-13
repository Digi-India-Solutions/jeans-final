export default function RecentOrders() {
  const recentOrders = [
    {
      id: '#ORD-2024-001',
      customer: 'Rajesh Kumar',
      items: 'Denim Jeans (2), Cotton Shirt (1)',
      amount: '₹2,450',
      status: 'Shipped',
      date: '2024-01-15',
      type: 'online'
    },
    {
      id: '#ORD-2024-002',
      customer: 'Fashion Hub Store',
      items: 'Formal Shirts (50)',
      amount: '₹45,000',
      status: 'Pending',
      date: '2024-01-15',
      type: 'b2b'
    },
    {
      id: '#ORD-2024-003',
      customer: 'Priya Sharma',
      items: 'Casual Jeans (1)',
      amount: '₹1,200',
      status: 'Delivered',
      date: '2024-01-14',
      type: 'online'
    },
    {
      id: '#ORD-2024-004',
      customer: 'Metro Clothing',
      items: 'Mixed Items (25)',
      amount: '₹28,500',
      status: 'Packed',
      date: '2024-01-14',
      type: 'b2b'
    },
    {
      id: '#ORD-2024-005',
      customer: 'Amit Patel',
      items: 'Designer Shirt (1)',
      amount: '₹1,800',
      status: 'Canceled',
      date: '2024-01-13',
      type: 'online'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Packed': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-700 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Orders
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Order ID</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Customer</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Items</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Type</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <span className="text-sm font-medium text-blue-600">{order.id}</span>
                </td>
                <td className="py-3 px-2">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{order.customer}</span>
                    <div className="text-xs text-gray-500">{order.date}</div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-600">{order.items}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-medium text-gray-800">{order.amount}</span>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.type === 'b2b' ? 'bg-purple-700 text-white' : 'bg-gray-700 text-white'
                  }`}>
                    {order.type === 'b2b' ? 'B2B' : 'Retail'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
