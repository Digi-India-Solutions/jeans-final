const express = require('express');

const router = express.Router();

const upload = require("../../middleware/multer")

const { createSubCategory ,getAllSubCategorys,changeStatus,getSubCategoryByID, updateSubCategoryByID,deleteSubCategoryByID} = require('./subCategorys-controller');

router.post("/create-sub-category", upload.single('images'), createSubCategory);

router.get("/get-all-sub-categorys-with-pagination", getAllSubCategorys);

router.post("/change-status", changeStatus)

router.get("/get_sub-category_by_id/:id", getSubCategoryByID);

router.post("/update-sub-category/:id", upload.single('images'), updateSubCategoryByID);

router.post("/delete-sub-category/:id", deleteSubCategoryByID);


module.exports = router;