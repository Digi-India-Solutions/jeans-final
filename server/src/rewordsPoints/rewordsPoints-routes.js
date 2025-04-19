// routes/rewardPointsRoutes.js
const express = require("express");
const { getRewardPoints, addRewardPoints, redeemRewardPoints, getAllRewards, changeStatus, deleteRewards } = require("./rewordsPoints-controller");
const router = express.Router();

// Routes
router.get("/get-all-rewards-by-id/:userId", getRewardPoints);
router.post("/add", addRewardPoints);
router.post("/redeem", redeemRewardPoints);
router.get("/get-All-rewards", getAllRewards)
router.post("/change-status", changeStatus)
router.get("/delete-rewards/:id", deleteRewards)

module.exports = router;
