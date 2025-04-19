const express = require("express");
const router = express.Router();

const { createOrder, getAllOrders, getOrderByID, changeStatus } = require("./orders-controller");


router.post("/create-order", createOrder);

router.get("/get-all-orders", getAllOrders);

router.get("/get-order-by-id/:id", getOrderByID);

router.post("/change-status/:id", changeStatus)

// router.post("/update-order/:id", updateOrderByID);

// router.post("/delete-order/:id", deleteOrderByID);

// router.get("/get-all-orders-by-user/:id", getAllOrdersByUser);

// router.get("/search-orders/:term", searchOrders);


module.exports = router;