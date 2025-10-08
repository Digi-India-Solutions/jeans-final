const express = require("express");
const router = express.Router();

const { createOrder, createOrderByAdmin, createOrderByclient, getAllOrdersByAdminWithPagination, updateOrderNoteByAdmin,
    getAllOrders, getOrderByID, changeStatus, changeStatusByAdmin, getAllOrdersByUser, verifyPayment, deleteOrderByID,
    updateOrderPaymentByAdmin, FilterOrdersByAdmin ,getAllAdminOrders } = require("./orders-controller");


router.post("/create-order", createOrder);

router.post("/verify-payment", verifyPayment);

router.post("/create-order-by-admin", createOrderByAdmin);

router.post("/create-order-by-client", createOrderByclient);

// router.post("/create-order-by-admin", createOrderByAdmin);

router.get("/get-all-orders", getAllOrders);

router.get("/get-all-Admin-orders", getAllAdminOrders);

router.get("/get-all-orders-by-admin-with-pagination", getAllOrdersByAdminWithPagination);

router.get("/get-order-by-id/:id", getOrderByID);

router.post("/change-status/:id", changeStatus)

router.post("/change-status-by-admin/:orderId", changeStatusByAdmin)

router.post("/update-order-payment-by-admin/:orderId", updateOrderPaymentByAdmin)

router.post("/update-order-notes-by-admin/:orderId", updateOrderNoteByAdmin)

// router.post("/update-order/:id", updateOrderByID);

router.post("/order-delete/:id", deleteOrderByID);

router.get("/get-all-orders-by-user/:id", getAllOrdersByUser);

// router.get("/search-orders/:term", searchOrders);

router.post("/filter-orders-by-admin", FilterOrdersByAdmin);


module.exports = router;