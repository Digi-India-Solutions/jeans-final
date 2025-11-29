export default function SalesChart({ salesData, dateRange, setDateRange }) {


  const maxSales = Math.max(...salesData.map(d => d.sales));
  console.log("salesData==>", salesData)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
        <div className="flex items-center space-x-2">
          {["Monthly", "Weekly", "Daily"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition 
                ${dateRange === range
                  ? "bg-gray-700 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 flex items-end justify-between space-x-2 overflow-hidden">
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
            {/* <span className="text-xs text-gray-500 mt-2">{data.month}</span> */}
            <span className="text-xs text-gray-500 mt-2">
              {dateRange === "Monthly" && data?.month}
              {dateRange === "Weekly" && `Week ${data?.week}`}
              {dateRange === "Daily" && data?.day}
            </span>
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
