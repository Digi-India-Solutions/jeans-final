const express = require('express');
const router = express.Router();
const upload = require("../../middleware/multer")
const { createProduct, getAllProducts, typeProducts, changeStatus, getProductByID, updateProductByID, deleteProductByID, changeStockStatus, getAllProductsByType } = require('./products-controller');
// const multer = require('multer')
// const fs = require("fs")

// const dir = '../../Public'

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true })
//         }
//         cb(null, dir)
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname)
//     }
// })

// const upload = multer({ storage: storage })

router.post("/create-product", upload.array('productImages'), createProduct);

router.get("/get-all-products-with-pagination", getAllProducts);

router.post("/change-type", typeProducts);

router.post("/change-status", changeStatus)

router.post("/change-Stock-status", changeStockStatus)

router.get("/get_product_by_id/:id", getProductByID);

router.post("/update-product/:id", upload.array('productImages'), updateProductByID);

router.post("/delete-product/:id", deleteProductByID);

router.post("/get-all-products-by-type/:term", getAllProductsByType);



// router.get("/get-all-products-for-store", getAllProductsForStore);

// router.get("/get-all-products-for-options", getAllProductsForOptions);

// router.post("/get-product-for-cart", getProductForCart);

// router.get("/search-product/:term", searchProduct);

module.exports = router;