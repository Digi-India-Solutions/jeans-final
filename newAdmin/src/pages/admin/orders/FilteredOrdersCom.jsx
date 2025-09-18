import React from 'react'
import Button from '../../../components/base/Button'
import { postData } from '../../../services/FetchNodeServices';

const FilteredOrdersCom = ({ setFilters, filters, setFilteredOrders, orders, setOrders, totalPages,currentPage ,setTotalPages }) => {

  // const applyFilters = () => {
  //   let filtered = orders;

  //   if (filters.status) {
  //     filtered = filtered.filter(order => order.status === filters.status);
  //   }

  //   if (filters.orderType) {
  //     filtered = filtered.filter(order => order.orderType === filters.orderType);
  //   }

  //   if (filters.customerType) {
  //     filtered = filtered.filter(order => order.customer.type === filters.customerType);
  //   }

  //   if (filters.paymentType) {
  //     filtered = filtered.filter(order => order.paymentType === filters.paymentType);
  //   }

  //   if (filters.search) {
  //     filtered = filtered.filter(order =>
  //       order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
  //       order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
  //       order.customer.email.toLowerCase().includes(filters.search.toLowerCase())
  //     );
  //   }

  //   setFilteredOrders(filtered);
  // };


  const applyFilters = async () => {
    try {
      const response = await postData(`api/order/filter-orders-by-admin?page=${currentPage}&limit=12`, filters);

      if (response.success === true) {
        // console.log("XXXXXXXXXXX:=-=>yy", response)
        setOrders(response.orders || []);
        setTotalPages(response?.pagination?.totalPages || 1);
        setFilteredOrders(response.orders || []);
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Order number, customer..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
          <div className="relative">
            <select
              value={filters.orderType}
              onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="">All Types</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <div className="relative">
            <select
              value={filters.customerType}
              onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="">All Customers</option>
              <option value="B2B">B2B</option>
              <option value="Retail">Retail</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
          <div className="relative">
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="">All Payments</option>
              <option value="Complete Payment">Complete Payment</option>
              <option value="Partial Payment">Partial Payment</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        <div className="flex items-end">
          <Button
            onClick={applyFilters}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FilteredOrdersCom
