const mongoose = require('mongoose');
const { Schema } = mongoose;

const returnSchema = new Schema(
    {
        returnNumber: { type: String, required: true },          // auto generated
        customer: { type: String },                              // customer name
        customerId: { type: Schema.Types.ObjectId, ref: 'User' }, // optional if needed
        orderId: { type: Schema.Types.ObjectId, ref: "AdminOrder", required: false, default: null, },
        orderNumber: { type: String },                          // e.g. ORD-2025-3076
        refundMethod: { type: String },                        // from frontend
        totalRefund: { type: Number },                         // computed in frontend
        date: { type: Date },                                  // return date
        status: { type: String },                              // Pending/Approved
        notes: { type: String },
        reason: { type: String },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'subProduct', required: false, default: null },
                name: String,
                availableSizes: [String],
                returnPcs: Number,
                reason: String,
                refundAmount: Number,
                pcsInSet: Number,
                singlePicPrice: Number,
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);

