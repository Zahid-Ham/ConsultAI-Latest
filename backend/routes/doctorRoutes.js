const express = require('express');
const { 
  getUnverifiedDoctors, 
  verifyDoctor, 
  getAllDoctors,
  getVerifiedDoctors // 👈 Import the new controller function
} = require('../controllers/doctorController');
const { 
  authenticateToken, 
  authorizeRole 
} = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Public route for patients to get all verified doctors
// This route does not have the authorizeRole('admin') middleware.
router.get('/verified', authenticateToken, getVerifiedDoctors);

// All routes below this line require both authentication and an admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Get all unverified doctors
router.get('/unverified', getUnverifiedDoctors);

// Get all doctors (verified and unverified)
router.get('/', getAllDoctors);

// Verify a doctor by ID
router.put('/verify/:doctorId', validateObjectId, verifyDoctor);

module.exports = router;