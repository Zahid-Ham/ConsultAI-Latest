const express = require('express');
const { register, login, googleLogin } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Register route with validation
router.post('/register', validateRegistration, register);

// Login route with validation
router.post('/login', validateLogin, login);

// Google login route
router.post('/google-login', googleLogin);

module.exports = router;