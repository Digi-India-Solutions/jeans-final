const express = require('express');

const router = express.Router();

const upload = require("../../middleware/multer")
// const multer = require("multer");
// const { v4: uuidv4 } = require('uuid');
const { createCategory, getAllCategorys, changeStatus, getCategoryByID, updateCategoryByID, deleteCategoryByID,getCategoryByMainCategoryID } = require('./categorys-controller');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./uploads/categorys-images");
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
//     },
// });

// const upload = multer({ storage: storage });

router.post("/create-category", upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]), createCategory);

router.get("/get-all-categorys-with-pagination", getAllCategorys);

router.post("/change-status", changeStatus)

router.get("/get_category_by_id/:id", getCategoryByID);

router.post("/update-category/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]),  updateCategoryByID);

router.post("/delete-category/:id", deleteCategoryByID);

router.get("/get_category_by_main_category/:id", getCategoryByMainCategoryID);

module.exports = router;