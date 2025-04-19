const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    couponTitle: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false, trim: true },
});

couponSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Coupon', couponSchema);

