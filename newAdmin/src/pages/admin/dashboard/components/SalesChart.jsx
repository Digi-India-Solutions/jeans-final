export default function SalesChart() {
  const salesData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
    { month: 'Jul', sales: 73000 },
    { month: 'Aug', sales: 69000 },
    { month: 'Sep', sales: 76000 },
    { month: 'Oct', sales: 82000 },
    { month: 'Nov', sales: 89000 },
    { month: 'Dec', sales: 95000 }
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">Monthly</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-700 hover:text-white rounded-lg">Weekly</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-700 hover:text-white rounded-lg">Daily</button>
        </div>
      </div>
      
      <div className="h-80 flex items-end justify-between space-x-2">
        {salesData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors relative group"
              style={{ height: `${(data.sales / maxSales) * 250}px` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{data.sales.toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{data.month}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Total Sales: ₹7,82,000</span>
        <span className="text-green-600 font-medium">↑ 12.5% from last year</span>
      </div>
    </div>
  );
}
