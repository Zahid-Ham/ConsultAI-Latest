const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: function () {
        // Only require text if there is no file
        return !this.fileUrl && !this.file;
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String, // URL to the uploaded file
      required: false,
    },
    fileType: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
