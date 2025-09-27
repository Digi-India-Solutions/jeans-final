import React from 'react'
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

function ReportsSection({ setActiveReportTab, activeReportTab ,reportFilters ,setReportFilters ,getReportSummary ,generateReportData }) {
    return (
        <div className="space-y-6">
            {/* Report Sub-tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveReportTab('deliveries')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeReportTab === 'deliveries'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <i className="ri-truck-line mr-2"></i>
                    Delivery Challans Report
                </button>
                <button
                    onClick={() => setActiveReportTab('returns')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeReportTab === 'returns'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <i className="ri-arrow-go-back-line mr-2"></i>
                    Returns Report
                </button>
            </div>

            {/* Report Filters */}
            <Card className="mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                            <div className="relative">
                                <select
                                    value={reportFilters.period}
                                    onChange={(e) => setReportFilters({ ...reportFilters, period: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                >
                                    <option value="daily">Daily (Last 7 days)</option>
                                    <option value="monthly">Monthly (Last 12 months)</option>
                                    <option value="yearly">Yearly (Last 5 years)</option>
                                    <option value="custom">Custom Date Range</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>

                        {reportFilters.period === 'custom' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={reportFilters.customDateFrom}
                                        onChange={(e) => setReportFilters({ ...reportFilters, customDateFrom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={reportFilters.customDateTo}
                                        onChange={(e) => setReportFilters({ ...reportFilters, customDateTo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    // Refresh report data
                                    console.log('Refreshing report data with filters:', reportFilters);
                                }}
                                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            >
                                <i className="ri-refresh-line mr-2"></i>
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {(() => {
                    const summary = getReportSummary(activeReportTab, reportFilters.period);
                    return (
                        <>
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total {activeReportTab === 'deliveries' ? 'Deliveries' : 'Returns'}</p>
                                            <p className="text-2xl font-bold text-gray-900">{summary.total.toLocaleString()}</p>
                                        </div>
                                        <div className={`p-3 rounded-full ${activeReportTab === 'deliveries' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                                            <i className={`${activeReportTab === 'deliveries' ? 'ri-truck-line text-blue-600' : 'ri-arrow-go-back-line text-orange-600'} text-xl`}></i>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-sm font-medium ${summary.trendColor}`}>
                                            {summary.trend}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-1">vs last period</span>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Value</p>
                                            <p className="text-2xl font-bold text-gray-900">{summary.totalValue}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-green-100">
                                            <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm text-gray-600">
                                            Avg: ₹{Math.round(parseInt(summary.totalValue.replace(/[₹,]/g, '')) / summary.total).toLocaleString()} per {activeReportTab === 'deliveries' ? 'delivery' : 'return'}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Avg Per Day</p>
                                            <p className="text-2xl font-bold text-gray-900">{summary.avgPerDay}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <i className="ri-calendar-line text-purple-600 text-xl"></i>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm text-gray-600">
                                            Based on {reportFilters.period} period
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Success Rate</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {activeReportTab === 'deliveries' ? '94.2%' : '76.8%'}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-cyan-100">
                                            <i className="ri-check-line text-cyan-600 text-xl"></i>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm text-green-600">
                                            +2.1% vs last period
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </>
                    );
                })()}
            </div>

            {/* Charts */}
            <Card>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                            {activeReportTab === 'deliveries' ? 'Delivery Challans' : 'Returns'} Trend
                        </h3>
                        <div className="flex space-x-2">
                            <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-3 py-1">
                                <i className="ri-download-line mr-1"></i>
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Simple Chart Visualization */}
                    <div className="space-y-4">
                        {(() => {
                            const chartData = generateReportData(activeReportTab, reportFilters.period);
                            const maxValue = Math.max(...chartData.data);

                            return (
                                <div className="space-y-3">
                                    {chartData.labels.map((label, index) => {
                                        const value = chartData.data[index];
                                        const percentage = (value / maxValue) * 100;

                                        return (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="w-16 text-sm text-gray-600 text-right">{label}</div>
                                                <div className="flex-1">
                                                    <div className="bg-gray-200 rounded-full h-6 relative">
                                                        <div
                                                            className={`${activeReportTab === 'deliveries' ? 'bg-blue-500' : 'bg-orange-500'} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                                            style={{ width: `${percentage}%` }}
                                                        >
                                                            <span className="text-white text-xs font-medium">{value}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-16 text-sm text-gray-900 font-medium text-right">
                                                    {activeReportTab === 'deliveries' ? `₹${(value * 1800).toLocaleString()}` : `₹${(value * 900).toLocaleString()}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Peak Period:</span>
                                <span className="ml-2 font-medium">
                                    {reportFilters.period === 'daily' ? 'Today' :
                                        reportFilters.period === 'monthly' ? 'December 2024' :
                                            reportFilters.period === 'yearly' ? '2024' : 'Custom Range'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Lowest Period:</span>
                                <span className="ml-2 font-medium">
                                    {reportFilters.period === 'daily' ? '3 days ago' :
                                        reportFilters.period === 'monthly' ? 'August 2024' :
                                            reportFilters.period === 'yearly' ? '2021' : 'Custom Range'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Growth Rate:</span>
                                <span className="ml-2 font-medium text-green-600">
                                    {activeReportTab === 'deliveries' ? '+15.2%' : '+8.7%'} YoY
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ReportsSection
