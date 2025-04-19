const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    Variant: [
        {
            color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', unique: false },
            sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size', unique: false }],
            price: Number,
            discountPrice: Number,
            finalPrice: Number,
            tax: String,
        },
    ],
    type: [{ type: String, required: true }],
    images: [String],
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
