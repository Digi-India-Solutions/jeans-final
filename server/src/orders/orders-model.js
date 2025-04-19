const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderUniqueId: {
        type: String,
        trim: true,
        default: "",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    shippingAddress: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
        },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Online', 'Cash On Delivery'],
    },
    orderStatus: {
        type: String,
        default: 'pending',
        enum: ['processing', 'pending', 'orderConfirmed', 'shipped', 'delivered', 'cancelled'],
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Successfull', 'Failed'],
    },
    paymentInfo: {
        transactionId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        paymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    cupanCode: {
        type: String
    },
    sentToShipRocket: {
        type: Boolean,
        default: false
    },
    discountCupan: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the `updatedAt` field before saving
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

