import React from 'react'
import Card from '../../../components/base/Card'

function ShirtsSalesTab({ salesData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue & Pieces</p>
              <p className="text-lg font-bold text-gray-900">₹{salesData.shirts.total} | {salesData.shirts.pieces} Pcs</p>
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
            <p className="text-sm text-gray-500 mt-1">Total: ₹{salesData.shirts.total } | {salesData.shirts.pieces} Pcs</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ShirtsSalesTab
