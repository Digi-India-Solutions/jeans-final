const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

bannerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner; // ✅ Use CommonJS export
