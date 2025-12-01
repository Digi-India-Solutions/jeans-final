
export default function SalesChart({ salesData, dateRange, setDateRange }) {
  // Safe max to avoid divide-by-zero
  const maxSales = Math.max(...salesData.map(d => d.sales), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>

        <div className="flex items-center space-x-2">
          {["Monthly", "Weekly", "Daily"].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition 
                ${
                  dateRange === range
                    ? "bg-gray-700 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                }
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full flex items-end space-x-2 overflow-x-auto pb-3 scrollbar-none">
        {salesData.map((data, index) => {
          const barHeight = Math.max((data?.sales / maxSales) * 250, 8); // min 8px

          return (
            <div key={index} className="flex flex-col items-center w-7">
              <div
                className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-300 relative group"
                style={{ height: `${barHeight}px` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow">
                  ₹{data?.sales?.toLocaleString()}
                </div>
              </div>

              {/* Label */}
              <span className="text-[10px] text-gray-600 mt-1 tracking-tight">
                {dateRange === "Monthly" && data?.month}
                {dateRange === "Weekly" && `W ${data?.week}`}
                {dateRange === "Daily" && data?.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
        <span>Total Sales: ₹{salesData.reduce((a, b) => a + b.sales, 0).toLocaleString()}</span>
      </div>
    </div>
  );
}
