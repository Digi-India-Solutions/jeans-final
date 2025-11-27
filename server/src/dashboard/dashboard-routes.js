const express = require('express');
const { getDashboardData, getCategoryComparisons, getSalesChartData ,getOrderStatusChartData  ,getRecentSalesData} = require('./dashboard-controller');

const router = express.Router();

router.get("/get-dashboard-data", getDashboardData);

router.get("/get-category-comparisons", getCategoryComparisons)

router.get("/get-sales-chart-data", getSalesChartData)

router.get("/get-order-sales-chart-data", getOrderStatusChartData)

router.get("/get-recent-sales-data" ,getRecentSalesData)
module.exports = router;