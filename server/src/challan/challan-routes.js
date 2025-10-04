const express = require("express");
const { createChallan, getAllChallansWithPagination, updateChallan, updateChallanStatus, deleteChallan, getChallansReport } = require("./challan-controller");
const router = express.Router();

router.post("/create-challan", createChallan);

router.get('/get-all-challans-with-pagination', getAllChallansWithPagination)

router.post('/update-challan/:id', updateChallan)

router.get('/delete-challan/:id', deleteChallan)

router.post('/update-challan-status/:id', updateChallanStatus)

router.post('/get-challans-report', getChallansReport)
module.exports = router;