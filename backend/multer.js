const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "PDF-DOCS-IMGS",   // folder in Cloudinary
    resource_type: "auto",     // allows images, PDFs, docs
  },
});

const upload = multer({ storage });

module.exports = upload;
module.exports.cloudinary = cloudinary; // export cloudinary instance to use in routes
