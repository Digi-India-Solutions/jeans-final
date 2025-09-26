const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const User = require("../users/users-model");
const { RewardPoints, UserSignupPoint } = require("./rewordsPoints-model");
const cron = require('node-cron');
// const UserSignupPoint = require("./rewordsPoints-model")

exports.getRewardPoints = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    console.log("DDDD", userId)
    const userPoints = await RewardPoints.findOne({ userId });

    if (!userPoints) {
        return res.status(404).json({ success: false, message: "No reward points found for this user." });
    }

    res.status(200).json({ success: true, data: userPoints });
});

exports.addRewardPoints = catchAsyncErrors(async (req, res, next) => {
    const { userId, amount, description } = req.body;

    const points = Math.floor((amount * 2.5) / 100);

    let userPoints = await RewardPoints.findOne({ userId });

    if (!userPoints) {

        userPoints = new RewardPoints({ userId, points: points, history: [{ type: 'earned', amount, description }] });
    } else {
        userPoints.points += points;
        userPoints.history.push({ type: 'earned', amount, description });
    }

    await userPoints.save();

    res.status(200).json({ success: true, message: "Points added", data: userPoints });
});

// Redeem points
exports.redeemRewardPoints = catchAsyncErrors(async (req, res, next) => {
    const { userId, amount, description } = req.body;

    const userPoints = await RewardPoints.findOne({ userId });

    if (!userPoints || userPoints.points < amount) {
        return res.status(400).json({ success: false, message: "Not enough points to redeem." });
    }

    userPoints.points -= amount;
    userPoints.history.push({ type: 'redeemed', amount, description });

    await userPoints.save();

    res.status(200).json({ success: true, message: "Points redeemed", data: userPoints });
});

exports.changePointsByAdmin = catchAsyncErrors(async (req, res, next) => {
    const { points, reason, type } = req.body;
    const rewordsPointsId = req.params.id;
    console.log(rewordsPointsId, req.body)

    let userPoints = await RewardPoints.findOne({ _id: rewordsPointsId });
    console.log("userPoints=>", userPoints)

    if (userPoints && type === 'earned') {
        userPoints.points += Number(points);
        userPoints.history.push({ type, amount: points, description: `Admin:=> ${reason}` });
    } else {
        userPoints.points -= Number(points);
        userPoints.history.push({ type, amount: points, description: `Admin:=> ${reason}` });
    }

    await userPoints.save();

    res.status(200).json({ success: true, message: "Points added", data: userPoints });
});

exports.getAllRewards = catchAsyncErrors(async (req, res, next) => {
    try {
        const rewards = await RewardPoints.find().populate("userId")

        if (!rewards || rewards.length === 0) {
            return res.status(404).json({ success: false, message: "No rewards found." });
        }

        res.status(200).json({ success: true, rewards });
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching rewards" });
    }
});

exports.getAllRewardsWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const rewards = await RewardPoints.find().populate("userId").sort({ createdAt: -1 }).skip(skip).limit(limit)

        const totalRecords = await RewardPoints.countDocuments(rewards);

        if (!rewards || rewards.length === 0) {
            return res.status(404).json({ success: false, message: "No rewards found." });
        }

        res.status(200).json({ success: true, count: rewards.length, totalRecords, totalPages: Math.ceil(totalRecords / limit), currentPage: page, rewards, });

    } catch (error) {
        console.error("Error fetching rewards:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching rewards" });
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { status } = req.body
        const rewards = await RewardPoints.find({ status: status });
        if (!rewards) {
            return res.status(404).json({ message: "rewards not found." });
        }

        res.status(200).json({ success: true, rewards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.deleteRewards = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    try {
        const reward = await RewardPoints.findById(id);

        if (!reward) {
            return res.status(404).json({ success: false, message: "Reward not found" });
        }

        await RewardPoints.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Reward deleted successfully" });
    } catch (error) {
        console.error("Delete reward error:", error);
        return res.status(500).json({ success: false, message: "Server error while deleting reward" });
    }
});

exports.clearOldPoints = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const userPoints = await RewardPoints.findOne({ userId });

        if (!userPoints) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        let expiryDate = ""
        if (userPoints) {
            expiryDate = new Date(userPoints.updatedAt);
            expiryDate.setDate(expiryDate.getDate() + 90);
        }
        let amount = userPoints.points
        if (new Date() > expiryDate) {
            userPoints.points -= amount;
            userPoints.history.push({ type: 'expired', amount: amount, description: "Points expired " });
            await userPoints.save();
        } else {
            return res.status(200).json({ success: true, message: "No points expired", data: userPoints });
        }


    } catch (err) {
        console.error("Cleanup error:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addFistTimeSignupReward = catchAsyncErrors(async (req, res, next) => {
    try {
        const reward = await UserSignupPoint.create(req.body);
        res.status(201).json({ success: true, data: reward });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
})


exports.getFistTimeSignupReward = catchAsyncErrors(async (req, res, next) => {
    try {
        const rewards = await UserSignupPoint.find().sort({ createdAt: -1 });
        res.json({ success: true, data: rewards });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
})

// Update Reward
exports.updateFistTimeSignupReward = catchAsyncErrors(async (req, res, next) => {
    try {
        const reward = await UserSignupPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: reward });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// // Delete Reward
// export const deleteFistTimeSignupReward = async (req, res) => {
//     try {
//         await UserSignupPoint.findByIdAndDelete(req.params.id);
//         res.json({ success: true, message: "Reward deleted" });
//     } catch (err) {
//         res.status(400).json({ success: false, message: err.message });
//     }
// };


// controllers/rewardController.js

exports.searchRewordByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        // Query params
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || "";

        // 🔍 Search filter
        let filter = {};
        if (search) {
            // First find users matching search
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { shopname: { $regex: search, $options: "i" } },
                    { uniqueUserId: { $regex: search, $options: "i" } },
                ],
            }).select("_id");

            const userIds = users.map((u) => u?._id);

            filter = {
                $or: [
                    { userId: { $in: userIds } },
                    { "history.description": { $regex: search, $options: "i" } }, // also allow searching in history descriptions
                ],
            };
        }

        // Fetch reward records
        const rewards = await RewardPoints.find(filter).populate("userId").sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalRecords = await RewardPoints.countDocuments(filter);

        res.status(200).json({ success: true, count: rewards.length, totalRecords, totalPages: Math.ceil(totalRecords / limit), currentPage: page, rewards, });

    } catch (err) {
        console.error("Error in searchRewordByAdminWithPagination:", err);
        res.status(500).json({ success: false, message: "Failed to fetch rewards", error: err.message, });
    }
});


