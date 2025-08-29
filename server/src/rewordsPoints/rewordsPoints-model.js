// models/RewardPoints.js
const mongoose = require("mongoose");

// RewardPoints Schema
const rewardPointsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one reward point record per user
        },
        points: {
            type: Number,
            default: 0,
            min: 0, // no negative points
        },
        history: [
            {
                type: {
                    type: String,
                    enum: ["earned", "redeemed", "expired"],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                description: {
                    type: String,
                    trim: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        status: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const RewardPoints = mongoose.model("RewardPoints", rewardPointsSchema);

// UserSignupPoint Schema
const userSignupPointSchema = new mongoose.Schema(
    {
        points: { type: Number, required: true, min: 0 },
        status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const UserSignupPoint = mongoose.model("UserSignupPoint", userSignupPointSchema);

module.exports = { RewardPoints, UserSignupPoint, };
