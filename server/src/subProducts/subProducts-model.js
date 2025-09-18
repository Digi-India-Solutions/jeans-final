// const mongoose = require('mongoose');

// const subProductSchema = new mongoose.Schema({
//     productName: { type: String, required: true },
//     productDescription: { type: String, required: true },
//     categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
//     Variant: [
//         {
//             productSingleImage: String,
//             // color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', unique: false },
//             color: String,
//             sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size', unique: false }],
//             price: Number,
//             finalPrice: Number,
//             set: String,
//         },
//     ],
//     type: [{ type: String, required: true }],
//     images: [String],
//     status: { type: Boolean, default: true },
//     isActive: { type: Boolean, default: true },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// subProductSchema.pre('save', function (next) {
//     this.updatedAt = Date.now();
//     next();
// });

// module.exports = mongoose.model('SubProduct', subProductSchema);



const mongoose = require('mongoose');

const subProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: false, required: true },
    description: { type: String, required: true },
    lotNumber: { type: String, required: true },
    color: { type: String, required: true },
    sizes: { type: String, required: true },
    singlePicPrice: Number,
    filnalLotPrice: String,
    barcode: { type: String, required: true },
    pcsInSet: String,
    subProductImages: [String],
    dateOfOpening: { type: String },
    status: { type: Boolean, default: true },
    stock: { type: String, },
    lotStock: { type: String, },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now, },
    updatedAt: { type: Date, default: Date.now, },
});

subProductSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SubProduct', subProductSchema);
