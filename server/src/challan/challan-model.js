const mongoose = require('mongoose');
const { Schema } = mongoose;

const challanSchema = new Schema(
    {
        challanNumber: { type: String, required: true }, // added from JSON
        customer: { type: String }, // if you want customer name in challan
        customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'AdminOrder', required: true },
        orderNumber: { type: String, required: true },

        deliveryVendor: { type: String }, // maps to "vendor" in JSON
        notes: { type: String },
        vendor: { type: String },
        biltiSlipUrl: { type: String },
        items: [
            {
                // Product reference (optional)
                productId: { type: Schema.Types.ObjectId, ref: 'subProduct' },

                name: String, // "black"
                availableSizes: [String], // for size array ["32","34","36"]

                dispatchedQty: Number, // match JSON key
                quantity: Number, // optional, if you need quantity separate
                price: Number,
                pcsInSet: Number,

                images: [String], // optional extra images
                selectedSizes: [String], // optional
            },
        ],

        totalValue: Number, // 30000
        date: { type: Date }, // "2025-09-27"
        status: { type: String }, // "Dispatched"
    },
    { timestamps: true }
);

module.exports = mongoose.model('Challan', challanSchema);
