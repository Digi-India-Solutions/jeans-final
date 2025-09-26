const express = require("express");
const router = express.Router();

const { getJeansShirtRevenueAndOrder, getSalesData, getTopProducts } = require("./salesAndReports-controller");


router.get("/get-jeans-shirt-revenue-and-order", getJeansShirtRevenueAndOrder);

router.get("/get-SalesData", getSalesData)

router.get("/get-top-products", getTopProducts)

module.exports = router;