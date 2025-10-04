const express = require("express");
const { createReturn,
    getAllReturnWithPagination,
    updateReturn,
    updateReturnStatus,
    deleteReturn,
    getReturnReport
} = require("./return-controller");
const router = express.Router();

router.post("/create-return", createReturn);

router.get('/get-all-return-with-pagination', getAllReturnWithPagination)

router.post('/update-return/:id', updateReturn)

router.get('/delete-return/:id', deleteReturn)

router.post('/update-return-status/:id', updateReturnStatus)

router.post('/get-return-report', getReturnReport)
module.exports = router;