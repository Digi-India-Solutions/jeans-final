const express = require('express');
const { createColor, getAllColors, changeStatus, getColorByID, updateColorByID, deleteColorByID,getColors } = require('./colors-controller');

const router = express.Router();

router.post("/create-color", createColor);

router.get("/get-all-color-with-pagination", getAllColors);

router.post("/change-status", changeStatus)

router.get("/get_color_by_id/:id", getColorByID);

router.post("/update-color/:id", updateColorByID);

router.get("/delete-color/:id", deleteColorByID);

router.get("/get_all_colors", getColors);

module.exports = router;