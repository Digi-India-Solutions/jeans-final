const express = require("express");
const router = express.Router();

const { createOrder, createOrderByAdmin, getAllOrdersByAdminWithPagination, getAllOrders, getOrderByID, changeStatus,changeStatusByAdmin, getAllOrdersByUser, verifyPayment, deleteOrderByID, updateOrderPaymentByAdmin, FilterOrdersByAdmin } = require("./orders-controller");


router.post("/create-order", createOrder);

router.post("/create-order-by-admin", createOrderByAdmin);

router.post("/verify-payment", verifyPayment);

router.get("/get-all-orders", getAllOrders);

router.get("/get-all-orders-by-admin-with-pagination", getAllOrdersByAdminWithPagination);

router.get("/get-order-by-id/:id", getOrderByID);

router.post("/change-status/:id", changeStatus)

router.post("/change-status-by-admin/:orderId", changeStatusByAdmin)

router.post("/update-order-payment-by-admin/:orderId", updateOrderPaymentByAdmin)

// router.post("/update-order/:id", updateOrderByID);

router.post("/order-delete/:id", deleteOrderByID);

router.get("/get-all-orders-by-user/:id", getAllOrdersByUser);

// router.get("/search-orders/:term", searchOrders);

router.post("/filter-orders-by-admin", FilterOrdersByAdmin);


module.exports = router;