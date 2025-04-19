const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: String,
  status: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

sizeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Size', sizeSchema);
