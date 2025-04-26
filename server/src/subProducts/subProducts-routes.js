const express = require('express');
const router = express.Router();
const upload = require("../../middleware/multer")
const { createSubProduct, getAllSubProducts, getAllSubProductsByProductId, changeSubStatus, getSubProductByID, updateSubProductByID, deleteSubProductByID, changeStockStatus, getAllSubProductsByType, searchProduct } = require('./subProducts-controller');

router.post("/create-sub-product", upload.array('subProductImages'), createSubProduct);

router.get("/get-all-sub-products", getAllSubProducts);

// router.post("/change-type", typeProducts);

router.post("/change-sub-status", changeSubStatus)

router.post("/change-Stock-status", changeStockStatus)

router.get("/get_product_by_id/:id", getSubProductByID);

router.post("/update-sub-product/:id", upload.array('subProductImages'), updateSubProductByID);

router.post("/delete-product/:id", deleteSubProductByID);

router.post("/get-all-products-by-type/:term", getAllSubProductsByType);

router.get("/get-all-sub-products-by-productId/:id", getAllSubProductsByProductId);

// router.get("/search-product/:term", searchProduct);

// router.get("/get-all-products-for-store", getAllProductsForStore);

// router.get("/get-all-products-for-options", getAllProductsForOptions);

// router.post("/get-product-for-cart", getProductForCart);



module.exports = router;