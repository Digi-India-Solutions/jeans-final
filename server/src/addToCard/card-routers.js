const { Router } = require("express");
const router = Router();
const upload = require('../../middleware/multer')

const { AddToCard, getCardById, updateCard, deleteFromCart, deleteCard, getAllCard, applyCoupon } = require("./card-conroller")

router.post("/add-to-cart", AddToCard)

router.get("/get-card-by-user-id/:id", getCardById)

router.post("/update-card", updateCard)

router.post("/delete-from-cart", deleteFromCart)

router.get('/delete-card/:id', deleteCard);

router.get("/get-all-card", getAllCard)

router.post("/apply-coupon/:id", applyCoupon)

module.exports = router;