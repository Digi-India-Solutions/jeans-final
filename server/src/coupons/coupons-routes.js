const express = require('express');
const { createCoupon, getAllCoupons, changeStatus, deleteCoupon, getCouponById, updateCoupon, getCouponByCode, getCouponByStatus } = require('./coupons-controller',);

const router = express.Router();

router.post("/create-coupon", createCoupon);

router.get("/get-All-coupons", getAllCoupons)

router.post("/change-status", changeStatus)

router.get("/delete-coupon/:id", deleteCoupon)

router.get("/get-coupon-by-id/:id", getCouponById)

router.post("/update-coupon/:id", updateCoupon)

router.post("/get-coupon-by-code", getCouponByCode)

router.post("/get-coupon-by-status", getCouponByStatus)

module.exports = router;