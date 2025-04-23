const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'removed'],
            default: 'pending'
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    appliedCoupon: {
        code: { type: String },
        discount: { type: Number }
    }
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
