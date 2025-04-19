// models/RewardPoints.js
const mongoose = require("mongoose");

const rewardPointsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    },
    history: [
        {
            type: {
                type: String,
                enum: ['earned', 'redeemed'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            description: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],

    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("RewardPoints", rewardPointsSchema);
