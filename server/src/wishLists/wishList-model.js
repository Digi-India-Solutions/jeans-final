// const mongoose = require('mongoose');

// const wishListSchema = new mongoose.Schema({
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProduct' },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     quantity: { type: Number },
//     status: { type: Boolean, default: true },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// });

// wishListSchema.pre('save', function (next) {
//     this.updatedAt = Date.now();
//     next();
// });

// module.exports = mongoose.model('WishList', wishListSchema);


const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubProduct',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        status: { type: Boolean, default: true },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

wishListSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('WishList', wishListSchema);