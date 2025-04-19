const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // productId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    name: String,
    description: String,
    images: [String],
    status: { type: Boolean, default: true },
    // uniqueCategoryId: { type: String, unique: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save middleware to update the updatedAt field
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Category', categorySchema);