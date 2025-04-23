const express = require('express');
const upload = require("../../middleware/multer")
const { createReview, getAllReviews, changeReviewStatus ,deleteReview} = require('./review-controller');
const router = express.Router();

router.post("/create-review", upload.array('images'), createReview);

router.get("/get-all-review", getAllReviews);

router.post("/change-review-status", changeReviewStatus);

router.get("/delete-reviews/:id", deleteReview);

module.exports = router;