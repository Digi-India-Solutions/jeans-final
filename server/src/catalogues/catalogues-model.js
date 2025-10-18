const mongoose = require("mongoose");

const catalogueSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String }, // optional, if you want to delete later
});

// ✅ Correct export
module.exports = mongoose.model("Catalogue", catalogueSchema);
