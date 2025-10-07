// backend/models/Chat.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String, // 'user' or 'ai'
        required: true,
    },
    text: {
        type: mongoose.Schema.Types.Mixed, // MODIFIED: Allows both string and JSON object
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // --- ADD THIS FIELD ---
    modelType: {
        type: String,
        enum: ['medllama2', 'gemini'],
        default: 'medllama2',
    },
    // --------------------
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;