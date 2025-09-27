// backend/controllers/chatHistoryController.js

const Chat = require('../models/Chat');

exports.getChatHistory = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ history: chats });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Server error while fetching chat history.' });
    }
};

exports.createChat = async (req, res) => {
    try {
        const newChat = new Chat({
            userId: req.user.id,
            title: 'New Chat', // You can set a default title
            messages: [],
        });
        await newChat.save();
        res.status(201).json({ chatId: newChat._id });
    } catch (error) {
        console.error('Error creating new chat:', error);
        res.status(500).json({ error: 'Server error while creating a new chat.' });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        await Chat.findOneAndDelete({ _id: chatId, userId: req.user.id });
        res.status(200).json({ message: 'Chat deleted successfully.' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Server error while deleting chat.' });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found.' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Error fetching chat by ID:', error);
        res.status(500).json({ error: 'Server error while fetching chat.' });
    }
};