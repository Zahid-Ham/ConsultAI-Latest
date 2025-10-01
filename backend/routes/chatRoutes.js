// backend/routes/chatRoutes.js

const express = require("express");

const router = express.Router();

const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage, // Import the new function
  sendFileMessage,
  sendCloudinaryMessage,
} = require("../controllers/chatController");

const { authenticateToken } = require("../middleware/auth");

// Existing routes

router.post("/conversations", authenticateToken, createConversation);

router.get("/conversations", authenticateToken, getConversations);

router.get("/messages/:conversationId", authenticateToken, getMessages);

router.post("/messages", authenticateToken, sendMessage);

// New route for deleting a message

router.delete("/messages/:messageId", authenticateToken, deleteMessage);
router.post("/messages/file", authenticateToken, sendFileMessage);
router.post("/messages/cloudinary", authenticateToken, sendCloudinaryMessage);

module.exports = router;
