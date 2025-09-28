const express = require("express");
const upload = require("../multer.js"); // multer + cloudinary
const cloudinary = require("../multer.js").cloudinary; // import cloudinary instance
const Report = require("../models/Report.js");

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // DEBUG: Let's see what Cloudinary actually returns
    console.log("Full req.file object:", JSON.stringify(req.file, null, 2));
    
    // With CloudinaryStorage, the public_id is in req.file.filename
    // The filename contains the full public_id including the folder
    const cloudinaryId = req.file.filename; // This should be "PDF-DOCS-IMGS/xxxxx"

    console.log("Using cloudinaryId:", cloudinaryId);
    
    // Validate that we have a cloudinaryId
    if (!cloudinaryId) {
      throw new Error("Failed to get Cloudinary public_id from upload");
    }

    // Debug: Log what Report is
    console.log("Report model:", Report);
    // Save metadata in MongoDB
    const report = await Report.create({
      patientId: req.body.patientId,
      filename: req.file.originalname,
      fileUrl: req.file.path, // Cloudinary URL
      cloudinaryId: cloudinaryId, // Store the public_id
      contentType: req.file.mimetype,
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// Fetch all reports for a patient
router.get("/:patientId", async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    console.log("Attempting to delete from Cloudinary:", report.cloudinaryId);

    // Files are in "Assets" section, so they're resource_type: "raw"
    // Try with the exact public_id first, then without folder prefix
    const publicIdsToTry = [
      report.cloudinaryId, // PDF-DOCS-IMGS/bkvjkz60cmnfdjjao0ii
      report.cloudinaryId.split('/').pop(), // Just: bkvjkz60cmnfdjjao0ii
    ];

    let deletionSuccessful = false;

    for (const publicId of publicIdsToTry) {
      try {
        console.log(`Trying to delete publicId: "${publicId}" with resource_type: "image"`);
        
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId, { 
          resource_type: "image" 
        });
        
        console.log(`Result for "${publicId}":`, cloudinaryResult);
        
        if (cloudinaryResult.result === "ok") {
          console.log(`✅ Successfully deleted with publicId: "${publicId}"`);
          deletionSuccessful = true;
          break;
        }
      } catch (cloudinaryError) {
        console.log(`❌ Failed with "${publicId}":`, cloudinaryError.message);
      }
    }

    if (!deletionSuccessful) {
      console.warn("⚠️ Could not delete from Cloudinary - file may not exist");
    }

    if (!deletionSuccessful) {
      console.warn("⚠️ Could not delete from Cloudinary with any combination");
    }

    // Delete from MongoDB
    await Report.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Download route - fetches file and serves with proper headers
router.get("/download/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // For PDFs and documents, force download by modifying the Cloudinary URL
    let downloadUrl = report.fileUrl;
    
    // Add Cloudinary transformations to force download
    if (downloadUrl.includes('/image/upload/')) {
      // Replace the upload part to add download flag
      downloadUrl = downloadUrl.replace(
        '/image/upload/', 
        '/image/upload/fl_attachment:' + encodeURIComponent(report.filename) + '/'
      );
    }

    console.log("Original URL:", report.fileUrl);
    console.log("Download URL:", downloadUrl);

    // Set proper headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.setHeader('Content-Type', report.contentType || 'application/octet-stream');
    
    // Redirect to the modified URL
    res.redirect(downloadUrl);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;