const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    colorName: String,
    color: String,
    colorStatus: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

colorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Color', colorSchema);
