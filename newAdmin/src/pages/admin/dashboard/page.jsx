import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import StatsCard from './components/StatsCard';
import SalesChart from './components/SalesChart';
import OrdersChart from './components/OrdersChart';
import RecentOrders from './components/RecentOrders';
import { getData, postData } from '../../../services/FetchNodeServices';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('This Month');
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [data, setData] = useState([]);
  const [categoryComparisons, setCategoryComparison] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [orderSales, setOrderSales] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  // Updated stats with piece counts
  const stats = [
    { title: 'Total Sales', value: '₹4.34L | 2,230 Pcs', change: '+12.5%', changeType: 'positive', icon: 'ri-money-dollar-circle-line', color: 'blue' },
    { title: 'Jeans Sales', value: '₹2.45L | 980 Pcs', change: '+15.2%', changeType: 'positive', icon: 'ri-shirt-line', color: 'blue' },
    { title: 'Shirts Sales', value: '₹1.89L | 1,250 Pcs', change: '+8.3%', changeType: 'positive', icon: 'ri-t-shirt-line', color: 'green' },
    { title: 'Orders', value: '2,230', change: '+18.0%', changeType: 'positive', icon: 'ri-shopping-cart-line', color: 'purple' },
    { title: 'Users', value: '15,847', change: '+5.2%', changeType: 'positive', icon: 'ri-user-line', color: 'orange' },
    { title: 'Cart Items', value: '485 | 485 Pcs', change: '+22.1%', changeType: 'positive', icon: 'ri-shopping-bag-line', color: 'pink' }
  ];

  // const recentSales = [
  //   { id: 1, customer: 'Rajesh Kumar', amount: '₹2,850 | 1 Pc', product: 'Premium Skinny Jeans', status: 'Completed', time: '2 hours ago' },
  //   { id: 2, customer: 'Priya Sharma', amount: '₹1,250 | 1 Pc', product: 'Formal Cotton Shirt', status: 'Processing', time: '3 hours ago' },
  //   { id: 3, customer: 'Amit Singh', amount: '₹3,200 | 2 Pcs', product: 'Regular Fit Jeans Set', status: 'Shipped', time: '5 hours ago' },
  //   { id: 4, customer: 'Neha Gupta', amount: '₹980 | 1 Pc', product: 'Casual Denim Shirt', status: 'Completed', time: '1 day ago' },
  //   { id: 5, customer: 'Vikram Patel', amount: '₹4,500 | 3 Pcs', product: 'Jeans Combo Pack', status: 'Processing', time: '1 day ago' }
  // ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  // // Jeans vs Shirts comparison data
  // const categoryComparison = {
  //   jeans: {
  //     todaySales: 45000, todayPcs: 18, weeklySales: 315000, weeklyPcs: 126,
  //     monthlySales: 2450000, monthlyPcs: 980, ytdSales: 12250000, ytdPcs: 4900, growth: 15.2
  //   },
  //   shirts: {
  //     todaySales: 32000, todayPcs: 21, weeklySales: 224000, weeklyPcs: 147,
  //     monthlySales: 1890000, monthlyPcs: 1250, ytdSales: 9450000, ytdPcs: 6250, growth: 8.3
  //   }
  // };

  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      // console.log("response.data:==>response.data:==>", response)
    } catch (error) {
      console.log(error)
    }
  }
  const fetchDashboardData = async () => {
    const response = await getData('api/dashboard/get-dashboard-data');
    // console.log("response:==>", response)
    if (response?.success === true) {
      setData(response?.stats)
    }
  }
  const fetchCategoryComparisons = async () => {
    const response = await getData('api/dashboard/get-category-comparisons');
    // console.log("response:==>SSS=>", response.categoryComparison)
    if (response?.success === true) {
      setCategoryComparison(response?.categoryComparison)
    }
  }

  const fetchSalesChart = async () => {
    const response = await getData('api/dashboard/get-sales-chart-data');
    // console.log("response:==>SSS=>", response.salesChart)
    if (response?.success === true) {
      setSalesData(response?.salesData)
    }
  }

  const fetchOrderSales = async () => {
    const response = await getData('api/dashboard/get-order-sales-chart-data');
    // console.log("response:==>SSS=>", response.orderData)
    if (response?.success === true) {
      setOrderSales(response?.orderData)
    }
  }

  const fetchRecentSales = async () => {
    const response = await getData('api/dashboard/get-recent-sales-data');
    console.log("response:==>SSS=>", response.recentSales)
    if (response?.success === true) {
      setRecentSales(response?.recentSales)
    }
  }



  useEffect(() => {
    fetchDashboardData()
    fetchCategoryComparisons()
    fetchSalesChart()
    fetchOrderSales()
    fetchRecentSales()
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [user?.role])

  const formatLakh = (num = 0) => {
    if (num >= 100000) {
      // 1 lakh or more
      return (num / 100000)?.toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
    } else if (num >= 1000) {
      // 1 thousand or more
      return (num / 1000)?.toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    } else if (num >= 10000000) {
      return (num / 10000000)?.toFixed(num % 10000000 === 0 ? 0 : 1) + 'M';
    } else {
      // below 1 thousand
      return num
    }
  }

  // console.log("data:==>", data, stats)
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          {/* <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="ri-download-line mr-2"></i>
              Export
            </Button>
          </div> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {data?.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Jeans vs Shirts Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jeans Analytics */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <i className="ri-shirt-line text-xl text-blue-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Jeans Sales Analytics</h3>
              </div>
              <div className="text-sm text-green-600 font-medium">+{categoryComparisons?.jeans?.growth}%</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Today</p>
                <p className="text-lg font-bold text-gray-900">₹{formatLakh(categoryComparisons?.jeans?.todaySales)} | {categoryComparisons?.jeans?.todayPcs} Pcs</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Weekly</p>
                <p className="text-lg font-bold text-gray-900">₹{formatLakh(categoryComparisons?.jeans?.weeklySales)} | {categoryComparisons?.jeans?.weeklyPcs} Pcs</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Monthly</p>
                <p className="text-sm font-bold text-blue-600">₹{formatLakh(categoryComparisons?.jeans?.monthlySales)} | {categoryComparisons?.jeans?.monthlyPcs} Pcs</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">YTD</p>
                <p className="text-sm font-bold text-blue-600">₹{formatLakh(categoryComparisons?.jeans?.ytdSales)} | {categoryComparisons?.jeans?.ytdPcs} Pcs</p>
              </div>
            </div>
          </Card>

          {/* Shirts Analytics */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <i className="ri-t-shirt-line text-xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Shirts Sales Analytics</h3>
              </div>
              <div className="text-sm text-green-600 font-medium">+{categoryComparisons?.shirts?.growth}%</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Today</p>
                <p className="text-lg font-bold text-gray-900">₹{formatLakh(categoryComparisons?.shirts?.todaySales)} | {categoryComparisons?.shirts?.todayPcs} Pcs</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Weekly</p>
                <p className="text-lg font-bold text-gray-900">₹{formatLakh(categoryComparisons?.shirts?.weeklySales)} | {categoryComparisons?.shirts?.weeklyPcs} Pcs</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Monthly</p>
                <p className="text-sm font-bold text-green-600">₹{formatLakh(categoryComparisons?.shirts?.monthlySales)} | {categoryComparisons?.shirts?.monthlyPcs} Pcs</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">YTD</p>
                <p className="text-sm font-bold text-green-600">₹{formatLakh(categoryComparisons?.shirts?.ytdSales)} | {categoryComparisons?.shirts?.ytdPcs} Pcs</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SalesChart salesData={salesData} />
          <OrdersChart orderSales={orderSales} />
        </div>

        {/* Recent Orders */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
              {/* <Button variant="outline" size="sm">
                View All
              </Button> */}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount & Pieces</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.product}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sale.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
