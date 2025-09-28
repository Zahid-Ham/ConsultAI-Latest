const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true }, // to delete from Cloudinary
  contentType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
