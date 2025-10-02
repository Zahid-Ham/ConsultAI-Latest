// backend/routes/userRoutes.js

const express = require('express');
const { authenticateToken } = require('../middleware/auth.js');
const { getUserProfile, updateUserProfile } = require('../controllers/userController.js');
// V V V THIS IS THE CORRECTED PATH V V V
const upload = require('../multer.js'); // Correct path from /routes to /backend root

const router = express.Router();

// I've moved the GET profile route from server.js to here for better organization

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, upload.single('profilePicture'), updateUserProfile);

module.exports = router;