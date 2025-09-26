// routes/rewardPointsRoutes.js
const express = require("express");
const { getRewardPoints, addRewardPoints, redeemRewardPoints, getAllRewards,
    changeStatus, deleteRewards, clearOldPoints, addFistTimeSignupReward,
    getFistTimeSignupReward, updateFistTimeSignupReward, changePointsByAdmin,
    searchRewordByAdminWithPagination ,getAllRewardsWithPagination } = require("./rewordsPoints-controller");
const router = express.Router();

// Routes
router.get("/get-all-rewards-by-id/:userId", getRewardPoints);
router.post("/add", addRewardPoints);
router.post("/change-points-by-admin/:id", changePointsByAdmin)
router.post("/redeem", redeemRewardPoints);
router.get("/get-All-rewards", getAllRewards)
router.get("/get-All-rewards-with-pagination", getAllRewardsWithPagination)
router.post("/change-status", changeStatus)
router.get("/delete-rewards/:id", deleteRewards)
router.get("/cleanOldPoints/:id", clearOldPoints);
router.post("/add-fist-time-signup-reward", addFistTimeSignupReward)
router.get("/get-fist-time-signup-reward", getFistTimeSignupReward)
router.post("/update-fist-time-signup-reward/:id", updateFistTimeSignupReward)
// router.post("/add-fist-time-signup-reward",addFistTimeSignupReward)

router.get("/search-reword-by-admin-with-pagination", searchRewordByAdminWithPagination);

module.exports = router;
