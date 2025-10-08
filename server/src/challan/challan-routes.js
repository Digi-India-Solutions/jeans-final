const express = require("express");
const { createChallan, getAllChallansWithPagination, updateChallan, updateChallanStatus, deleteChallan, getChallansReport,uploadBiltiSlip,removeBiltiSlip, createChallanWithSlip,getAllChallansByCustomerAndOrder } = require("./challan-controller");
const upload = require("../../middleware/multer");
const router = express.Router();

router.post("/create-challan", createChallan);

router.post('/upload-slip', upload.single('biltiSlip'), uploadBiltiSlip);

router.post('/remove-slip', removeBiltiSlip);

router.get('/get-all-challans-with-pagination', getAllChallansWithPagination)

router.post('/update-challan/:id', updateChallan)

router.get('/delete-challan/:id', deleteChallan)

router.post('/update-challan-status/:id', updateChallanStatus)

router.post('/get-challans-report', getChallansReport)

router.post('/get-all-challans-by-customer-and-order', getAllChallansByCustomerAndOrder)
module.exports = router;