const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    mainCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    name: String,
    description: String,
    images: [String],
    categoryBanner: [String],
    status: { type: Boolean, default: true },
    productsCount: { type: Number, default: 0 },
    slug: String,
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