const express = require('express');
const { 
  getUnverifiedDoctors, 
  verifyDoctor 
} = require('../controllers/doctorController');
const { 
  authenticateToken, 
  authorizeRole 
} = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Get all unverified doctors
router.get('/unverified-doctors', getUnverifiedDoctors);

// Verify a doctor by ID
router.put('/verify-doctor/:id', validateObjectId, verifyDoctor);

module.exports = router; 