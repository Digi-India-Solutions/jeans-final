const express = require('express');
const { createSize, getAllSizes, changeStatus, getSizeByID, updateSizeByID, deleteSizeByID ,getSizes} = require('./sizes-controller');

const router = express.Router();

router.post("/create-size", createSize);

router.get("/get-all-size-with-pagination", getAllSizes);

router.post("/change-status", changeStatus)

router.get("/get_size_by_id/:id", getSizeByID);

router.post("/update-size/:id", updateSizeByID);

router.get("/delete-size/:id", deleteSizeByID);

router.get("/get_all_sizes", getSizes);

module.exports = router;