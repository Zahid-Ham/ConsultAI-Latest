// backend/controllers/chatController.js

const Conversation = require("../models/conversation");

const Message = require("../models/message");

const { User } = require("../models");

// @desc Create a new conversation

// @route POST /api/chat/conversations

// @access Private

const createConversation = async (req, res) => {
  const { recipientId } = req.body;

  const senderId = req.user.id;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate("participants", "name specialization role");

    if (conversation) {
      return res.status(200).json({
        success: true,

        message: "Conversation already exists",

        data: conversation,
      });
    }

    conversation = new Conversation({
      participants: [senderId, recipientId],
    });

    await conversation.save();

    await conversation.populate("participants", "name specialization role");

    res.status(201).json({
      success: true,

      message: "Conversation created successfully",

      data: conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);

    res.status(500).json({
      success: false,

      message: "Failed to create conversation.",

      error: error.message,
    });
  }
};

// @desc Get conversations for a user (patient or doctor)

// @route GET /api/chat/conversations

// @access Private

const getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name specialization role");

    res.status(200).json({
      success: true,

      data: conversations,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);

    res.status(500).json({
      success: false,

      message: "Failed to retrieve conversations.",

      error: error.message,
    });
  }
};

// @desc Get messages for a specific conversation

// @route GET /api/chat/messages/:conversationId

// @access Private

const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    res.status(200).json({
      success: true,

      data: messages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);

    res.status(500).json({
      success: false,

      message: "Failed to retrieve messages.",

      error: error.message,
    });
  }
};

// @desc Send a new message

// @route POST /api/chat/messages

// @access Private

const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;

  const senderId = req.user.id;

  if (!text || !conversationId) {
    return res.status(400).json({
      success: false,
      message: "Message content and conversation ID are required.",
    });
  }

  try {
    const message = new Message({
      conversationId,

      sender: senderId,

      text,
    });

    await message.save();

    await message.populate("sender", "name");

    const conversation = await Conversation.findById(conversationId);

    if (conversation) {
      const recipientId = conversation.participants.find(
        (p) => p.toString() !== senderId.toString()
      );

      const io = req.app.get("io");

      if (recipientId) {
        io.to(recipientId.toString()).emit("receiveMessage", message);
      }

      io.to(senderId.toString()).emit("receiveMessage", message);
    }

    res.status(201).json({
      success: true,

      message: "Message sent successfully",

      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);

    res.status(500).json({
      success: false,

      message: "Failed to send message.",

      error: error.message,
    });
  }
};

// @desc Delete a message

// @route DELETE /api/chat/messages/:messageId

// @access Private

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  const userId = req.user.id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    } // Only allow the sender to delete their own message

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this message.",
      });
    }

    await message.deleteOne();

    const io = req.app.get("io"); // Emit to the conversation's room to notify all participants

    const conversation = await Conversation.findById(message.conversationId);

    if (conversation) {
      conversation.participants.forEach((p) => {
        io.to(p.toString()).emit("messageDeleted", messageId);
      });
    }

    res.status(200).json({
      success: true,

      message: "Message deleted successfully",

      data: { messageId },
    });
  } catch (error) {
    console.error("Error deleting message:", error);

    res.status(500).json({
      success: false,

      message: "Failed to delete message.",

      error: error.message,
    });
  }
};

const multer = require("multer");
const cloudinary = require("../cloudinary");
const upload = multer({ storage: multer.memoryStorage() });

// Send a file message (upload from computer)
const sendFileMessage = async (req, res) => {
  try {
    upload.single("file")(req, res, async function (err) {
      if (err || !req.file) {
        return res
          .status(400)
          .json({ success: false, message: "File upload failed." });
      }
      // Upload buffer to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: undefined,
          filename_override: req.file.originalname,
          use_filename: true,
          unique_filename: false,
        },
        async (error, result) => {
          if (error || !result) {
            return res
              .status(500)
              .json({
                success: false,
                message: "Cloudinary upload failed",
                error,
              });
          }
          // Create chat message with file link and original filename
          const message = new Message({
            conversationId: req.body.conversationId,
            sender: req.body.senderId,
            text: "",
            fileUrl: result.secure_url,
            fileType: result.resource_type,
            fileName: req.file.originalname,
          });
          await message.save();
          await message.populate("sender", "name");
          // Emit via socket
          const conversation = await Conversation.findById(
            req.body.conversationId
          );
          const io = req.app.get("io");
          if (conversation) {
            conversation.participants.forEach((p) => {
              io.to(p.toString()).emit("receiveMessage", message);
            });
          }
          res
            .status(201)
            .json({
              success: true,
              message: "File message sent",
              data: message,
            });
        }
      );
      // Pipe buffer to Cloudinary
      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(result);
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
  }
};

// Send a Cloudinary file message (share from cloud)
const sendCloudinaryMessage = async (req, res) => {
  try {
    const { publicId, conversationId, senderId, fileUrl, fileName, fileType } =
      req.body;
    // Use provided file details if available, else fetch from Cloudinary
    let url = fileUrl,
      name = fileName,
      type = fileType;
    if (!url || !name || !type) {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: "auto",
      });
      url = result.secure_url;
      name = result.original_filename;
      type = result.resource_type;
    }
    // Create chat message with file link
    const message = new Message({
      conversationId,
      sender: senderId,
      text: "",
      fileUrl: url,
      fileType: type,
      fileName: name,
    });
    await message.save();
    await message.populate("sender", "name");
    // Emit via socket
    const conversation = await Conversation.findById(conversationId);
    const io = req.app.get("io");
    if (conversation) {
      conversation.participants.forEach((p) => {
        io.to(p.toString()).emit("receiveMessage", message);
      });
    }
    res
      .status(201)
      .json({
        success: true,
        message: "Cloudinary file shared",
        data: message,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Cloudinary file share failed",
        error: error.message,
      });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  sendFileMessage,
  sendCloudinaryMessage,
};
