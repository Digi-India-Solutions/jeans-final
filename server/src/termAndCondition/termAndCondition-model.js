// models/termAndCondition-model.js
const mongoose = require("mongoose");

const termAndConditionSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "Anibhavi Creation Pvt. Ltd.",
    },
    terms: {
      type: [String],  // ✅ array of term strings
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one term is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TermAndCondition", termAndConditionSchema);