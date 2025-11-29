
export default function OrdersChart({orderSales}) {
  // const orderData = [
  //   { status: 'Delivered', count: 245, color: 'bg-green-500', percentage: 65 },
  //   { status: 'Shipped', count: 89, color: 'bg-blue-500', percentage: 23 },
  //   { status: 'Pending', count: 32, color: 'bg-yellow-500', percentage: 8 },
  //   { status: 'Canceled', count: 15, color: 'bg-red-500', percentage: 4 }
  // ];

  const total = orderSales.reduce((sum, item) => sum + item.count, 0);
console.log("orderSales::=>>XX", orderSales);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Status Distribution</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {orderSales.map((item, index) => {
              const previousPercentages = orderSales.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
              const strokeDashoffset = -previousPercentages;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color.replace('bg-', '').replace('-500', '')}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-width-10"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-gray-800">{total}</span>
            <span className="text-sm text-gray-500">Total Orders</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {orderSales.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm font-medium text-gray-700">{item.status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{item.count}</span>
              <span className="text-xs text-gray-500">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
