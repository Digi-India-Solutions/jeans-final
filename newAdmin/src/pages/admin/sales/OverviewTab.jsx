import React, { useEffect, useState } from "react";
import Card from "../../../components/base/Card";
import { getData } from "../../../services/FetchNodeServices";

function OverviewTab({ dateRange, setDateRange }) {
    const [salesDatas, setSalesData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getData(
                    `api/salesAndReports/get-jeans-shirt-revenue-and-order?range=${dateRange}`
                );
                if (res?.success === true) {
                    console.log("get-jeans-shirt-revenue-and-order", res?.data)
                    setSalesData(res?.data);
                }
            } catch (err) {
                console.error("Failed to fetch sales data:", err);
            }
        };
        fetchData();
    }, [dateRange]);

    // helper: format currency in Lakh
    // const formatLakh = (num = 0) => (num / 1000).toFixed(1);

    // helper: growth color
    const growthClass = (growth) =>
        growth >= 0 ? "text-green-600" : "text-red-600";

    // total revenue & orders
    const totalRevenue = (salesDatas?.jeans?.total || 0) + (salesDatas?.shirts?.total || 0);
    const totalOrders = salesDatas?.totalOrder || 0 || (salesDatas?.jeans?.orders || 0) + (salesDatas?.shirts?.orders || 0);
    const totalPieces = (salesDatas?.jeans?.pieces || 0) + (salesDatas?.shirts?.pieces || 0);

    console.log("GGG:=>", salesDatas, totalRevenue)

    const formatLakh = (num = 0) => {
        if (num >= 100000) {
            // 1 lakh or more
            return (num / 100000)?.toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
        } else if (num >= 1000) {
            // 1 thousand or more
            return (num / 1000)?.toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
        } else {
            // below 1 thousand
            return num
        }
    }

    // console.log("salesDatas", salesDatas?.shirts?.growth)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Jeans */}
            <Card className="p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <i className="ri-shirt-line text-2xl text-blue-600"></i>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Jeans Sales</p>
                        <p className="text-lg font-bold text-gray-900">
                            ₹{salesDatas?.jeans?.total} | {salesDatas?.jeans?.pieces || 0} Pcs
                        </p>
                        <p className={`text-sm ${growthClass(salesDatas?.jeans?.growth)}`}>
                            {salesDatas?.jeans?.growth}% from {dateRange === 'thisMonth' ? "last month" : dateRange === 'thisWeek' ? 'last Week' : dateRange === 'thisYear' ? "last Year" : dateRange === ' today' ? ' today' : 'Custom'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Shirts */}
            <Card className="p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                        <i className="ri-t-shirt-line text-2xl text-green-600"></i>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Shirts Sales</p>
                        <p className="text-lg font-bold text-gray-900">
                            ₹{salesDatas?.shirts?.total} | {salesDatas?.shirts?.pieces || 0} Pcs
                        </p>
                        <p className={`text-sm ${growthClass(salesDatas?.shirts?.growth)}`}>
                            {salesDatas?.shirts?.growth === "NaN" ? -100 : salesDatas?.shirts?.growth}% from {dateRange === 'thisMonth' ? "last month" : dateRange === 'thisWeek' ? 'last Week' : dateRange === 'thisYear' ? "last Year" : dateRange === ' today' ? ' today' : 'Custom'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Total Orders */}
            <Card className="p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                        <i className="ri-shopping-cart-line text-2xl text-purple-600"></i>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-lg font-bold text-gray-900">
                            {totalOrders.toLocaleString()}
                        </p>
                        <p className={`text-sm ${growthClass(salesDatas?.jeans?.growth)}`}>
                            {salesDatas?.jeans?.growth}% from {dateRange === 'thisMonth' ? "last month" : dateRange === 'thisWeek' ? 'last Week' : dateRange === 'thisYear' ? "last Year" : dateRange === ' today' ? ' today' : 'Custom'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Total Revenue */}
            <Card className="p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <i className="ri-money-dollar-circle-line text-2xl text-yellow-600"></i>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-lg font-bold text-gray-900">
                            ₹{totalRevenue} | {totalPieces} Pcs
                        </p>
                        <p className={`text-sm ${growthClass(
                            (parseInt(salesDatas?.jeans?.growth || 0) + parseInt(salesDatas?.shirts?.growth || 0)) / 2
                        )}`}>
                            {(
                                parseInt((salesDatas?.jeans?.growth || 0) + parseInt(salesDatas?.shirts?.growth || 0)) / 2
                            ).toFixed(2)}% from {dateRange === 'thisMonth' ? "last month" : dateRange === 'thisWeek' ? 'last Week' : dateRange === 'thisYear' ? "last Year" : dateRange === ' today' ? ' today' : 'Custom'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default OverviewTab;
