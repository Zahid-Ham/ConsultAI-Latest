const express = require("express");
const router = express.Router();
const cloudinary = require("../cloudinary");

const Report = require("../models/Report.js");

// List files from Cloudinary
router.get("/list", async (req, res) => {
  try {
    // Fetch images
    const imageResult = await cloudinary.api.resources({
      type: "upload",
      max_results: 50,
      resource_type: "image",
    });
    // Fetch raw files (PDF, docs, etc.)
    const rawResult = await cloudinary.api.resources({
      type: "upload",
      max_results: 50,
      resource_type: "raw",
    });
    // Combine both
    const allResources = [
      ...(imageResult.resources || []),
      ...(rawResult.resources || []),
    ];
    const files = allResources.map((file) => ({
      public_id: file.public_id,
      url: file.secure_url,
      original_filename: file.original_filename || file.public_id,
      format: file.format,
      resource_type: file.resource_type,
      type: file.type,
    }));
    res.json({ files });
  } catch (err) {
    console.error("Cloudinary API error:", err);
    res.status(500).json({
      error: "Failed to fetch files from Cloudinary.",
      details: err.message || err,
    });
  }
});

// NEW: List only files uploaded by the current user (patient)
router.get("/user/:patientId", async (req, res) => {
  try {
    console.log(
      "cloudinary/user endpoint called with patientId:",
      req.params.patientId
    );
    const reports = await Report.find({ patientId: req.params.patientId }).sort(
      { createdAt: -1 }
    );
    console.log("Number of reports found:", reports.length);
    // Map to Cloudinary file info format
    const files = reports.map((report) => ({
      public_id: report.cloudinaryId,
      url: report.fileUrl,
      original_filename: report.filename,
      format: report.contentType,
      resource_type: "raw",
      type: "upload",
    }));
    res.json({ files });
  } catch (err) {
    console.error("Error in /user/:patientId endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
