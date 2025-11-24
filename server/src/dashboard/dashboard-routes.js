const express = require('express');
const { getDashboardData } = require('./dashboard-controller');

const router = express.Router();

router.get("/get-dashboard-data", getDashboardData);


module.exports = router;