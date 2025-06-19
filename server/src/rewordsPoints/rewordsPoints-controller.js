const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const RewardPoints = require("./rewordsPoints-model")


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