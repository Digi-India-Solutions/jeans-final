const express = require('express');
const router = express.Router();
const upload = require("../../middleware/multer")
const { createSubProduct, getAllProducts, typeProducts, changeStatus, getProductByID, updateProductByID, deleteProductByID, changeStockStatus, getAllProductsByType ,searchProduct} = require('./products-controller');

router.post("/create-product", upload.array( 'productImages'), createSubProduct);

router.get("/get-all-products-with-pagination", getAllProducts);

router.post("/change-type", typeProducts);

router.post("/change-status", changeStatus)

router.post("/change-Stock-status", changeStockStatus)

router.get("/get_product_by_id/:id", getProductByID);

router.post("/update-product/:id", upload.array( 'productImages'), updateProductByID);

router.post("/delete-product/:id", deleteProductByID);

router.post("/get-all-products-by-type/:term", getAllProductsByType);

router.get("/search-product/:term", searchProduct);

// router.get("/get-all-products-for-store", getAllProductsForStore);

// router.get("/get-all-products-for-options", getAllProductsForOptions);

// router.post("/get-product-for-cart", getProductForCart);



module.exports = router;