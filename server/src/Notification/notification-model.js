const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        image: { type: String },
    },
    { timestamps: true } // createdAt & updatedAt
);

module.exports = mongoose.model("Notification", NotificationSchema);