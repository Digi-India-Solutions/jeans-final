import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import JeansSalesTab from './JeansSalesTab';
import ShirtsSalesTab from './ShirtsSalesTab';
import OverviewTab from './OverviewTab';
import { getData } from '../../../services/FetchNodeServices';

export default function SalesReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  // Sample sales data for Jeans and Shirts with piece counts
  const salesData = {
    jeans: {
      total: 2450000,
      pieces: 980,
      growth: 12.5,
      orders: 980,
      avgOrder: 2500,
      dailyData: [
        { date: '2024-01-01', sales: 45000, orders: 18, pieces: 18 },
        { date: '2024-01-02', sales: 52000, orders: 21, pieces: 21 },
        { date: '2024-01-03', sales: 38000, orders: 15, pieces: 15 },
        { date: '2024-01-04', sales: 65000, orders: 26, pieces: 26 },
        { date: '2024-01-05', sales: 48000, orders: 19, pieces: 19 },
        { date: '2024-01-06', sales: 71000, orders: 28, pieces: 28 },
        { date: '2024-01-07', sales: 55000, orders: 22, pieces: 22 }
      ]
    },
    shirts: {
      total: 1890000,
      pieces: 1250,
      growth: 8.3,
      orders: 1250,
      avgOrder: 1512,
      dailyData: [
        { date: '2024-01-01', sales: 32000, orders: 21, pieces: 21 },
        { date: '2024-01-02', sales: 28000, orders: 18, pieces: 18 },
        { date: '2024-01-03', sales: 45000, orders: 30, pieces: 30 },
        { date: '2024-01-04', sales: 38000, orders: 25, pieces: 25 },
        { date: '2024-01-05', sales: 51000, orders: 34, pieces: 34 },
        { date: '2024-01-06', sales: 42000, orders: 28, pieces: 28 },
        { date: '2024-01-07', sales: 35000, orders: 23, pieces: 23 }
      ]
    }
  };
  const [salesDatas, setSalesData] = useState(salesData);

  const topProductsss = [
    { name: 'Premium Skinny Jeans', sales: 485000, units: 194, pieces: 194, growth: 15.2 },
    { name: 'Regular Fit Jeans', sales: 420000, units: 191, pieces: 191, growth: 8.7 },
    { name: 'Formal Cotton Shirts', sales: 380000, units: 200, pieces: 200, growth: 12.1 },
    { name: 'Casual Denim Shirts', sales: 295000, units: 184, pieces: 184, growth: -2.5 },
    { name: 'Bootcut Jeans', sales: 275000, units: 125, pieces: 125, growth: 22.3 }
  ];
  const [topProducts, setTopProducts] = useState(topProductsss || [])
  // const categoryDistribution = [
  //   { name: 'Jeans', value: 2450000, pieces: 980, percentage: 56.4, color: '#3B82F6' },
  //   { name: 'Shirts', value: 1890000, pieces: 1250, percentage: 43.6, color: '#10B981' }
  // ];



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getData(
          `api/salesAndReports/get-SalesData?range=${selectedPeriod}`
        );
        // console.log("XXXXXXXXXXXX:==>", res.data)
        if (res?.success === true) {
          setSalesData(res?.data || salesData);
        }
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  useEffect(() => {
    const fetchTopProductData = async () => {
      try {
        const res = await getData(
          `api/salesAndReports/get-top-products?range=${dateRange}`
        );
        console.log("XXXXXXXXXXXX:==>", res?.data)
        if (res?.success === true) {
          setTopProducts(res?.data || salesData);
        }
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
      }
    };
    fetchTopProductData();
  }, [dateRange]);


  const renderChart = () => {
    // Determine max value safely
    const jeansSales = salesDatas?.jeans?.dailyData?.map(d => d?.sales) || [0];
    const shirtsSales = salesDatas?.shirts?.dailyData?.map(d => d?.sales) || [0];
    const maxValue = Math.max(...jeansSales, ...shirtsSales, 1);
    console.log("maxValue==>", maxValue, jeansSales, shirtsSales)

    // Combine dailyData for X-axis if dates differ
    const allDates = Array.from(
      new Set([
        ...salesDatas?.jeans?.dailyData?.map(d => d?.date || ""),
        ...salesDatas?.shirts?.dailyData?.map(d => d?.date || "")
      ])
    ).sort((a, b) => new Date(a) - new Date(b));

    const getSalesForDate = (categoryData, date) => {
      const item = categoryData.find(d => d?.date === date);
      return item ? item?.sales : 0;
    };

    return (
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Sales Trend ({selectedPeriod})</h3>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Jeans Sales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Shirts Sales</span>
            </div>
          </div>
        </div>

        <svg width="100%" height="200" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="40"
              y1={40 + (y * 1.2)}
              x2="95%"
              y2={40 + (y * 1.2)}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Jeans sales line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={allDates
              .map((date, i) => {
                const x = 50 + i * 80;
                const y = 180 - ((getSalesForDate(salesDatas?.jeans?.dailyData || [], date) / maxValue) * 140);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Shirts sales line */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            points={allDates
              .map((date, i) => {
                const x = 50 + i * 80;
                const y = 180 - ((getSalesForDate(salesDatas?.shirts?.dailyData || [], date) / maxValue) * 140);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data points */}
          {allDates.map((date, i) => {
            const jeansY = 180 - ((getSalesForDate(salesDatas?.jeans?.dailyData || [], date) / maxValue) * 140);
            const shirtsY = 180 - ((getSalesForDate(salesDatas?.shirts?.dailyData || [], date) / maxValue) * 140);
            return (
              <g key={i}>
                {/* Jeans */}
                <circle
                  cx={50 + i * 80}
                  cy={jeansY}
                  r="4"
                  fill="#3B82F6"
                  className="hover:r-6 cursor-pointer transition-all"
                >
                  <title>Jeans: ₹{getSalesForDate(salesDatas?.jeans?.dailyData || [], date).toLocaleString()} | {salesDatas?.jeans?.dailyData?.find(d => d.date === date)?.pieces || 0} Pcs ({date})</title>
                </circle>

                {/* Shirts */}
                <circle
                  cx={50 + i * 80}
                  cy={shirtsY}
                  r="4"
                  fill="#10B981"
                  className="hover:r-6 cursor-pointer transition-all"
                >
                  <title>Shirts: ₹{getSalesForDate(salesDatas?.shirts?.dailyData || [], date).toLocaleString()} | {salesDatas?.shirts?.dailyData?.find(d => d.date === date)?.pieces || 0} Pcs ({date})</title>
                </circle>
              </g>
            );
          })}

          {/* X-axis labels */}
          {allDates.map((date, i) => (
            <text
              key={i}
              x={50 + i * 80}
              y="195"
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {new Date(date).getDate()}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), Math.round(maxValue)].map((value, i) => (
            <text
              key={i}
              x="35"
              y={185 - (i * 35)}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              ₹{Math.round(value / 1000)}k
            </text>
          ))}
        </svg>
      </div>
    );
  };


  // const renderPieChart = () => {
  //   const centerX = 120;
  //   const centerY = 120;
  //   const radius = 80;
  //   let currentAngle = 0;

  //   return (
  //     <div className="relative">
  //       <svg width="240" height="240" className="mx-auto">
  //         {categoryDistribution?.map((category, index) => {
  //           const angle = (category.percentage / 100) * 2 * Math.PI;
  //           const x1 = centerX + radius * Math.cos(currentAngle);
  //           const y1 = centerY + radius * Math.sin(currentAngle);
  //           const x2 = centerX + radius * Math.cos(currentAngle + angle);
  //           const y2 = centerY + radius * Math.sin(currentAngle + angle);

  //           const largeArcFlag = angle > Math.PI ? 1 : 0;

  //           const pathData = [
  //             `M ${centerX} ${centerY}`,
  //             `L ${x1} ${y1}`,
  //             `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
  //             'Z'
  //           ].join(' ');

  //           currentAngle += angle;

  //           return (
  //             <g key={index}>
  //               <path
  //                 d={pathData}
  //                 fill={category?.color}
  //                 className="hover:opacity-80 cursor-pointer transition-opacity"
  //               >
  //                 <title>{category?.name}: ₹{category?.value.toLocaleString()} | {category?.pieces} Pcs ({category?.percentage}%)</title>
  //               </path>
  //             </g>
  //           );
  //         })}

  //         {/* Center circle */}
  //         <circle cx={centerX} cy={centerY} r="35" fill="white" />
  //         <text x={centerX} y={centerY - 8} textAnchor="middle" className="text-xs font-medium fill-gray-700">
  //           Total Sales
  //         </text>
  //         <text x={centerX} y={centerY + 2} textAnchor="middle" className="text-xs fill-gray-500">
  //           ₹{(salesDatas?.jeans?.total + salesDatas?.shirts?.total).toLocaleString()}
  //         </text>
  //         <text x={centerX} y={centerY + 12} textAnchor="middle" className="text-xs fill-gray-500">
  //           {(salesDatas?.jeans?.pieces + salesDatas?.shirts?.pieces)} Pcs
  //         </text>
  //       </svg>

  //       {/* Legend */}
  //       <div className="flex justify-center space-x-6 mt-4">
  //         {categoryDistribution.map((category, index) => (
  //           <div key={index} className="flex items-center">
  //             <div
  //               className="w-4 h-4 rounded-full mr-2"
  //               style={{ backgroundColor: category.color }}
  //             ></div>
  //             <span className="text-sm">
  //               {category.name} ({category.percentage}%)
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };


  const renderPieChart = () => {
    if (!salesDatas) return null;

    const centerX = 120;
    const centerY = 120;
    const radius = 80;
    let currentAngle = 0;

    // Build category distribution from API response
    const totalSales = (salesDatas?.jeans?.total || 0) + (salesDatas?.shirts?.total || 0);

    const categoryDistribution = [
      {
        name: "Jeans",
        value: salesDatas?.jeans?.total || 0,
        pieces: salesDatas?.jeans?.pieces || 0,
        percentage: totalSales ? ((salesDatas?.jeans?.total / totalSales) * 100).toFixed(1) : 0,
        color: "#4F46E5", // indigo
      },
      {
        name: "Shirts",
        value: salesDatas?.shirts?.total || 0,
        pieces: salesDatas?.shirts?.pieces || 0,
        percentage: totalSales ? ((salesDatas?.shirts?.total / totalSales) * 100).toFixed(1) : 0,
        color: "#22C55E", // amber
      },
    ];

    return (
      <div className="relative">
        <svg width="240" height="240" className="mx-auto">
          {categoryDistribution.map((category, index) => {
            const angle = (category.percentage / 100) * 2 * Math.PI;
            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(currentAngle + angle);
            const y2 = centerY + radius * Math.sin(currentAngle + angle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle += angle;

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={category.color}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                >
                  <title>
                    {category.name}: ₹{category.value.toLocaleString()} | {category.pieces} Pcs (
                    {category.percentage}%)
                  </title>
                </path>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="35" fill="white" />
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            Total Sales
          </text>
          <text
            x={centerX}
            y={centerY + 2}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            ₹{totalSales.toLocaleString()}
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {(salesDatas?.jeans?.pieces || 0) + (salesDatas?.shirts?.pieces || 0)} Pcs
          </text>
        </svg>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          {categoryDistribution.map((category, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-sm">
                {category.name} ({category.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales & Reports</h1>
            <p className="text-gray-600 mt-1">Monitor your sales performance by category</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => { setDateRange(e.target.value), setSelectedPeriod(e.target.value) }}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <i className="ri-download-line mr-2"></i>
              Export Excel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <i className="ri-file-pdf-line mr-2"></i>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-dashboard-line mr-2"></i>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jeans')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jeans' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-shirt-line mr-2"></i>
            Jeans Sales
          </button>
          <button
            onClick={() => setActiveTab('shirts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shirts' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-t-shirt-line mr-2"></i>
            Shirts Sales
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}

            <OverviewTab salesData={salesData} dateRange={dateRange} setDateRange={setDateRange} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Interactive Sales Trend</h3>
                  <div className="flex space-x-2">
                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1 text-xs rounded-full ${selectedPeriod === period
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                {renderChart()}
              </Card>

              {/* Sales Distribution Chart */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Sales Distribution</h3>
                  <div className="text-sm text-gray-500">By Category</div>
                </div>
                {renderPieChart()}
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Top Performing Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Revenue & Pieces</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{product.sales.toLocaleString()} | {product.pieces} Pcs</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.units}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.growth >= 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {product.growth >= 0 ? '+' : ''}{product.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Jeans Sales Tab */}
        {activeTab === 'jeans' && (
          <JeansSalesTab setSalesData={setSalesData} salesData={salesDatas} />
        )}

        {/* Shirts Sales Tab */}
        {activeTab === 'shirts' && (
          <ShirtsSalesTab setSalesData={setSalesData} salesData={salesDatas} />
        )}
      </div>
    </AdminLayout>
  );
}
