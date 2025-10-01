const express = require("express");
const router = express.Router();
const cloudinary = require("../cloudinary");

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
    const allResources = [...(imageResult.resources || []), ...(rawResult.resources || [])];
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
    res.status(500).json({ error: "Failed to fetch files from Cloudinary.", details: err.message || err });
  }
});

module.exports = router;
