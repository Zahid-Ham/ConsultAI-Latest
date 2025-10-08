// backend/routes/chatbotRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Correctly import the controllers and the middleware
const chatbotController = require('../controllers/chatbotController');
const chatHistoryController = require('../controllers/chatHistoryController');
const { authenticateToken: protect } = require('../middleware/auth.js'); // Use the correct path and alias

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route for symptom analysis (Chatbot)
router.post('/symptom-analysis', protect, chatbotController.analyzeSymptoms);

// Route for medical report analysis (File Upload)
router.post('/report-analysis', protect, upload.single('file'), chatbotController.analyzeReport);
// Route for medical report analysis when the file is stored in Cloudinary
router.post('/report-analysis-cloudinary', protect, chatbotController.analyzeReportCloudinary);

// === NEW CHAT HISTORY ROUTES ===

// GET route to fetch all chat history for the authenticated user
router.get('/history', protect, chatHistoryController.getChatHistory);

// POST route to create a new chat session
router.post('/history', protect, chatHistoryController.createChat);

// GET route to fetch a specific chat session by ID
router.get('/history/:chatId', protect, chatHistoryController.getChatById);

// DELETE route to delete a specific chat session by ID
router.delete('/history/:chatId', protect, chatHistoryController.deleteChat);

module.exports = router;