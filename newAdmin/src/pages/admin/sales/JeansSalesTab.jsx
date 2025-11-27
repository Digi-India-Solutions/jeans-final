import React from 'react'
import Card from '../../../components/base/Card'

function JeansSalesTab({salesData}) {
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <i className="ri-money-dollar-circle-line text-2xl text-blue-600"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue & Pieces</p>
                            <p className="text-lg font-bold text-gray-900">₹{formatLakh(salesData?.jeans?.total)} | {salesData?.jeans?.pieces} Pcs</p>
                            <p className="text-sm text-green-600">+{salesData?.jeans?.growth}% growth</p>
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
                            <p className="text-2xl font-bold text-gray-900">{salesData?.jeans?.orders}</p>
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
                            <p className="text-2xl font-bold text-gray-900">₹{salesData?.jeans?.avgOrder}</p>
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
                        <p className="text-sm text-gray-500 mt-1">Total: ₹{formatLakh(salesData?.jeans?.total)} | {salesData?.jeans?.pieces} Pcs</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default JeansSalesTab
