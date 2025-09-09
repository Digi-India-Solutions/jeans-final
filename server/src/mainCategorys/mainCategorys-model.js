const mongoose = require('mongoose');

const mainCategorySchema = new mongoose.Schema({
    // productId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    mainCategoryName: { type: String, required: true },
    description: String,
    slug: String,
    images: [String],
    status: { type: Boolean, default: true },
    // uniqueCategoryId: { type: String, unique: true },
    productsCount: { type: Number, default: 0 },
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
mainCategorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('MainCategory', mainCategorySchema);