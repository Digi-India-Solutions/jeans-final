
import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function SalesReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

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

  const categoryDistribution = [
    { name: 'Jeans', value: 2450000, pieces: 980, percentage: 56.4, color: '#3B82F6' },
    { name: 'Shirts', value: 1890000, pieces: 1250, percentage: 43.6, color: '#10B981' }
  ];

  const topProducts = [
    { name: 'Premium Skinny Jeans', sales: 485000, units: 194, pieces: 194, growth: 15.2 },
    { name: 'Regular Fit Jeans', sales: 420000, units: 191, pieces: 191, growth: 8.7 },
    { name: 'Formal Cotton Shirts', sales: 380000, units: 200, pieces: 200, growth: 12.1 },
    { name: 'Casual Denim Shirts', sales: 295000, units: 184, pieces: 184, growth: -2.5 },
    { name: 'Bootcut Jeans', sales: 275000, units: 125, pieces: 125, growth: 22.3 }
  ];

  const renderChart = () => {
    const maxValue = Math.max(...salesData.jeans.dailyData.map(d => d.sales), ...salesData.shirts.dailyData.map(d => d.sales));
    
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
            points={salesData.jeans.dailyData.map((d, i) => {
              const x = 50 + (i * 80);
              const y = 180 - ((d.sales / maxValue) * 140);
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Shirts sales line */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            points={salesData.shirts.dailyData.map((d, i) => {
              const x = 50 + (i * 80);
              const y = 180 - ((d.sales / maxValue) * 140);
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {salesData.jeans.dailyData.map((d, i) => {
            const x = 50 + (i * 80);
            const y = 180 - ((d.sales / maxValue) * 140);
            return (
              <circle
                key={`jeans-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="hover:r-6 cursor-pointer transition-all"
              >
                <title>Jeans: ₹{d.sales.toLocaleString()} | {d.pieces} Pcs ({d.date})</title>
              </circle>
            );
          })}
          
          {salesData.shirts.dailyData.map((d, i) => {
            const x = 50 + (i * 80);
            const y = 180 - ((d.sales / maxValue) * 140);
            return (
              <circle
                key={`shirts-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="#10B981"
                className="hover:r-6 cursor-pointer transition-all"
              >
                <title>Shirts: ₹{d.sales.toLocaleString()} | {d.pieces} Pcs ({d.date})</title>
              </circle>
            );
          })}
          
          {/* X-axis labels */}
          {salesData.jeans.dailyData.map((d, i) => (
            <text
              key={i}
              x={50 + (i * 80)}
              y="195"
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {new Date(d.date).getDate()}
            </text>
          ))}
          
          {/* Y-axis labels */}
          {[0, 25000, 50000, 75000].map((value, i) => (
            <text
              key={i}
              x="35"
              y={185 - (i * 35)}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              ₹{(value / 1000)}k
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const renderPieChart = () => {
    const centerX = 120;
    const centerY = 120;
    const radius = 80;
    let currentAngle = 0;

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
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={category.color}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                >
                  <title>{category.name}: ₹{category.value.toLocaleString()} | {category.pieces} Pcs ({category.percentage}%)</title>
                </path>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="35" fill="white" />
          <text x={centerX} y={centerY - 8} textAnchor="middle" className="text-xs font-medium fill-gray-700">
            Total Sales
          </text>
          <text x={centerX} y={centerY + 2} textAnchor="middle" className="text-xs fill-gray-500">
            ₹{(salesData.jeans.total + salesData.shirts.total).toLocaleString()}
          </text>
          <text x={centerX} y={centerY + 12} textAnchor="middle" className="text-xs fill-gray-500">
            {(salesData.jeans.pieces + salesData.shirts.pieces)} Pcs
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
                onChange={(e) => setDateRange(e.target.value)}
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-dashboard-line mr-2"></i>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jeans')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'jeans'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-shirt-line mr-2"></i>
            Jeans Sales
          </button>
          <button
            onClick={() => setActiveTab('shirts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'shirts'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-t-shirt-line mr-2"></i>
            Shirts Sales
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <i className="ri-shirt-line text-2xl text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jeans Sales</p>
                    <p className="text-lg font-bold text-gray-900">₹{(salesData.jeans.total / 100000).toFixed(1)}L | {salesData.jeans.pieces} Pcs</p>
                    <p className="text-sm text-green-600">+{salesData.jeans.growth}% from last month</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <i className="ri-t-shirt-line text-2xl text-green-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Shirts Sales</p>
                    <p className="text-lg font-bold text-gray-900">₹{(salesData.shirts.total / 100000).toFixed(1)}L | {salesData.shirts.pieces} Pcs</p>
                    <p className="text-sm text-green-600">+{salesData.shirts.growth}% from last month</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <i className="ri-shopping-cart-line text-2xl text-purple-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-lg font-bold text-gray-900">{(salesData.jeans.orders + salesData.shirts.orders).toLocaleString()}</p>
                    <p className="text-sm text-green-600">+10.2% from last month</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <i className="ri-money-dollar-circle-line text-2xl text-yellow-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-lg font-bold text-gray-900">₹{((salesData.jeans.total + salesData.shirts.total) / 100000).toFixed(1)}L | {(salesData.jeans.pieces + salesData.shirts.pieces)} Pcs</p>
                    <p className="text-sm text-green-600">+10.7% from last month</p>
                  </div>
                </div>
              </Card>
            </div>

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
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedPeriod === period
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
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                index === 0 ? 'bg-yellow-500' :
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.growth >= 0 
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <i className="ri-money-dollar-circle-line text-2xl text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue & Pieces</p>
                    <p className="text-lg font-bold text-gray-900">₹{(salesData.jeans.total / 100000).toFixed(1)}L | {salesData.jeans.pieces} Pcs</p>
                    <p className="text-sm text-green-600">+{salesData.jeans.growth}% growth</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <i className="ri-shopping-bag-line text-2xl text-green-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.jeans.orders}</p>
                    <p className="text-sm text-blue-600">Jeans orders</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <i className="ri-calculator-line text-2xl text-purple-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{salesData.jeans.avgOrder}</p>
                    <p className="text-sm text-gray-600">Per order</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Jeans Sales Performance</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-blue-500 mb-2">📊</div>
                  <p className="text-gray-600">Detailed jeans sales analytics</p>
                  <p className="text-sm text-gray-500">Track performance by product variants</p>
                  <p className="text-sm text-gray-500 mt-1">Total: ₹{(salesData.jeans.total / 100000).toFixed(1)}L | {salesData.jeans.pieces} Pcs</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Shirts Sales Tab */}
        {activeTab === 'shirts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue & Pieces</p>
                    <p className="text-lg font-bold text-gray-900">₹{(salesData.shirts.total / 100000).toFixed(1)}L | {salesData.shirts.pieces} Pcs</p>
                    <p className="text-sm text-green-600">+{salesData.shirts.growth}% growth</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <i className="ri-shopping-bag-line text-2xl text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.shirts.orders}</p>
                    <p className="text-sm text-green-600">Shirts orders</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <i className="ri-calculator-line text-2xl text-yellow-600"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{salesData.shirts.avgOrder}</p>
                    <p className="text-sm text-gray-600">Per order</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Shirts Sales Performance</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-green-500 mb-2">📈</div>
                  <p className="text-gray-600">Detailed shirts sales analytics</p>
                  <p className="text-sm text-gray-500">Track performance by shirt categories</p>
                  <p className="text-sm text-gray-500 mt-1">Total: ₹{(salesData.shirts.total / 100000).toFixed(1)}L | {salesData.shirts.pieces} Pcs</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
