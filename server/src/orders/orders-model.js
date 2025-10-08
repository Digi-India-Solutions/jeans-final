// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const orderSchema = new Schema({
//     orderUniqueId: {
//         type: String,
//         trim: true,
//         default: "",
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     products: [
//         {
//             subProduct: [{
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "SubProduct",
//                 required: true,
//             }],
//             productName: [{
//                 type: String,
//                 required: true,
//             }],
//             price: [{
//                 type: Number,
//                 required: true,
//             }],
//             quantity: [{
//                 type: Number,
//                 required: true,
//             }],
//         },
//     ],
//     shippingAddress: {
//         name: {
//             type: String,
//             required: true,
//         },
//         email: {
//             type: String,
//             required: true,
//         },
//         phone: {
//             type: String,
//             required: true,
//         },
//         address: {
//             type: String,
//             required: true,
//         },
//         city: {
//             type: String,
//             required: true,
//         },
//         state: {
//             type: String,
//             required: true,
//         },
//         country: {
//             type: String,
//             required: true,
//         },
//         postalCode: {
//             type: String,
//         },
//     },
//     paymentMethod: {
//         type: String,
//         required: true,
//         enum: ['Online', 'Cash On Delivery'],
//     },
//     orderStatus: {
//         type: String,
//         default: 'pending',
//         enum: ['processing', 'pending', 'order Confirmed', 'shipped', 'delivered', 'cancelled'],
//     },
//     paymentStatus: {
//         type: String,
//         default: 'Pending',
//         enum: ['Pending', 'Complete Payment', 'Failed', 'Partial Payment'],
//     },
//     paymentInfo: {
//         transactionId: {
//             type: String,
//         },
//         orderId: {
//             type: String,
//         },
//         paymentId: {
//             type: String,
//         },
//         razorpaySignature: {
//             type: String,
//         },
//     },
//     totalAmount: {
//         type: Number,
//         required: true,
//     },

//     pendingAmount: {
//         type: Number,
//         trim: true,
//         default: 0
//     },
//     recivedAmount: {
//         type: Number,
//         trim: true,
//         default: 0
//     },
//     shippingCost: {
//         type: Number,
//         default: 0,
//     },
//     orderDate: {
//         type: Date,
//         default: Date.now,
//     },
//     cupanCode: {
//         type: String
//     },
//     sentToShipRocket: {
//         type: Boolean,
//         default: false
//     },
//     discountCupan: {
//         type: Number,
//         default: 0
//     },
//     reworPoins: {
//         type: Number,
//         default: 0
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// // Middleware to update the `updatedAt` field before saving
// orderSchema.pre('save', function (next) {
//     this.updatedAt = Date.now();
//     next();
// });

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;



// // const mongoose = require('mongoose');
// // const { Schema } = mongoose;



// // const StatusHistorySchema = new Schema({
// //     status: { type: String, required: true },
// //     date: { type: String, required: true }, // format: YYYY-MM-DD
// //     updatedBy: { type: String, default: "System" },
// // });

// // const PaymentSchema = new Schema({
// //     method: { type: String, required: true }, // e.g. Bank Transfer, UPI
// //     amount: { type: Number, required: true },
// // });

// // const ItemSchema = new Schema({
// //     productId: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct", required: true },
// //     name: { type: String, required: true },
// //     quantity: { type: Number, required: true },
// //     singlePicPrice: { type: Number, required: true },
// //     pcsInSet: { type: Number, required: true },
// //     availableSizes: [{ type: String }],
// //     images: [{ type: String }],
// //     selectedSizes: [{ type: String }],
// // });

// // const CustomerSchema = new Schema({
// //     name: { type: String, required: true },
// //     email: { type: String },
// //     phone: { type: String },
// //     deliveryAddress: { type: String, required: true },
// // });

// const adminorderSchema = new Schema({
//     orderNumber: { type: String, required: true, unique: true },
//     customer: {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//         name: { type: String, required: true },
//         email: { type: String },
//         phone: { type: String },
//         deliveryAddress: { type: String, required: true },
//     },
//     items: [{
//         productId: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct", required: true },
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         singlePicPrice: { type: Number, required: true },
//         pcsInSet: { type: Number, required: true },
//         availableSizes: [{ type: String }],
//         images: [{ type: String }],
//         selectedSizes: [{ type: String }],
//     }],

//     subtotal: { type: Number, required: true },
//     pointsRedeemed: { type: Number, default: 0 },
//     pointsRedemptionValue: { type: Number, default: 0 },
//     total: { type: Number, required: true },

//     status: { type: String, default: "Pending" },
//     paymentType: { type: String }, // "Complete Payment" / "Partial Payment"
//     paidAmount: { type: Number, default: 0 },
//     balanceAmount: { type: Number, default: 0 },
//     payments: [{
//         method: { type: String, required: true }, // e.g. Bank Transfer, UPI
//         amount: { type: Number, required: true },
//     }],
//     paymentMethod: { type: String }, // Cash / Bank Transfer / Online etc.
//     orderType: { type: String, default: "Offline" },

//     orderDate: { type: String }, // YYYY-MM-DD
//     trackingId: { type: String, default: "" },
//     deliveryVendor: { type: String, default: "" },

//     pointsEarned: { type: Number, default: 0 },
//     pointsEarnedValue: { type: Number, default: 0 },

//     statusHistory: [{
//         status: { type: String, required: true },
//         date: { type: String, required: true }, // format: YYYY-MM-DD
//         updatedBy: { type: String, default: "System" },
//     }],
// },
//     { timestamps: true }
// );

// const AdminOrder = mongoose.model('AdminOrder', adminorderSchema);

// module.exports = AdminOrder;

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ------------------------- User Order Schema ------------------------- */
const orderSchema = new Schema({
    orderUniqueId: { type: String, trim: true, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    products: [
        {
            subProduct: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubProduct", required: true }],
            productName: [{ type: String, required: true }],
            price: [{ type: Number, required: true }],
            quantity: [{ type: Number, required: true }],
        },
    ],

    shippingAddress: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String },
    },

    paymentMethod: {
        type: String,
        required: true,
        enum: ['Online', 'Cash On Delivery'],
    },
    orderStatus: {
        type: String,
        default: 'pending',
        enum: ['processing', 'pending', 'order Confirmed', 'shipped', 'delivered', 'cancelled'],
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Complete Payment', 'Failed', 'Partial Payment'],
    },

    paymentInfo: {
        transactionId: { type: String },
        orderId: { type: String },
        paymentId: { type: String },
        razorpaySignature: { type: String },
    },

    totalAmount: { type: Number, required: true },
    pendingAmount: { type: Number, trim: true, default: 0 },
    recivedAmount: { type: Number, trim: true, default: 0 },
    shippingCost: { type: Number, default: 0 },

    orderDate: { type: Date, default: Date.now },
    cupanCode: { type: String },
    sentToShipRocket: { type: Boolean, default: false },
    discountCupan: { type: Number, default: 0 },
    reworPoins: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to auto-update `updatedAt`
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Order = mongoose.model('Order', orderSchema);


/* ------------------------- Admin Order Schema ------------------------- */
const adminOrderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    customer: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        deliveryAddress: { type: String, required: true },
    },

    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "SubProduct", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        singlePicPrice: { type: Number, required: true },
        pcsInSet: { type: Number, required: true },
        availableSizes: [{ type: String }],
        images: [{ type: String }],
        selectedSizes: [{ type: String }],
        deliveredPcs: { type: Number, default: 0 },
        dispatchedQty: { type: Number, default: 0 },
        returnPcs: { type: Number, default: 0 },
        // returnAmount: { type: Number, default: 0 },
    }],

    subtotal: { type: Number, required: true },
    pointsRedeemed: { type: Number, default: 0 },
    pointsRedemptionValue: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: { type: String, default: "Pending" },
    paymentType: { type: String }, // "Complete Payment" / "Partial Payment"
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },

    payments: [{
        method: { type: String, required: true }, // e.g. Bank Transfer, UPI
        amount: { type: Number, required: true },
        // date: { type: Date, required: true },
    }],
    paymentInfo: {
        transactionId: String,
        razorpayOrderId: String,
        paymentId: String,
        razorpaySignature: String,
    },
    paymentMethod: { type: String }, // Cash / Bank Transfer / Online
    orderType: { type: String, default: "Offline" },

    orderDate: { type: String }, // YYYY-MM-DD
    trackingId: { type: String, default: "" },
    deliveryVendor: { type: String, default: "" },

    orderNote: { type: String, default: "" },
    transportName: { type: String, default: "" },

    pointsEarned: { type: Number, default: 0 },
    pointsEarnedValue: { type: Number, default: 0 },

    statusHistory: [{
        status: { type: String, required: true },
        date: { type: String, required: true }, // format: YYYY-MM-DD
        updatedBy: { type: String, default: "System" },
        notes: { type: String, default: '' }
    }],
}, { timestamps: true });

const AdminOrder = mongoose.model('AdminOrder', adminOrderSchema);


/* ------------------------- Export Both Models ------------------------- */
module.exports = {
    Order,
    AdminOrder,
};
