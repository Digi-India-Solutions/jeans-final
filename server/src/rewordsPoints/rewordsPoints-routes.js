// routes/rewardPointsRoutes.js
const express = require("express");
const { getRewardPoints, addRewardPoints, redeemRewardPoints, getAllRewards, changeStatus, deleteRewards, clearOldPoints, addFistTimeSignupReward, getFistTimeSignupReward,updateFistTimeSignupReward } = require("./rewordsPoints-controller");
const router = express.Router();

// Routes
router.get("/get-all-rewards-by-id/:userId", getRewardPoints);
router.post("/add", addRewardPoints);
router.post("/redeem", redeemRewardPoints);
router.get("/get-All-rewards", getAllRewards)
router.post("/change-status", changeStatus)
router.get("/delete-rewards/:id", deleteRewards)
router.get("/cleanOldPoints/:id", clearOldPoints);
router.post("/add-fist-time-signup-reward", addFistTimeSignupReward)
router.get("/get-fist-time-signup-reward", getFistTimeSignupReward)
router.post("/update-fist-time-signup-reward/:id",updateFistTimeSignupReward)
// router.post("/add-fist-time-signup-reward",addFistTimeSignupReward)

module.exports = router;
