const express = require('express');

const router = express.Router();

const upload = require("../../middleware/multer")

const { createMainCategory ,getAllMainCategorys,changeStatus,getMainCategoryByID, updateMainCategoryByID,deleteMainCategoryByID} = require('./mainCategorys-controller');

router.post("/create-main-category", upload.single('images'), createMainCategory);

router.get("/get-all-main-categorys-with-pagination", getAllMainCategorys);

router.post("/change-status", changeStatus)

router.get("/get_main-category_by_id/:id", getMainCategoryByID);

router.post("/update-main-category/:id", upload.single('images'), updateMainCategoryByID);

router.post("/delete-main-category/:id", deleteMainCategoryByID);


module.exports = router;