// frontend/src/components/ChatSidebar.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaRegComment, FaArrowLeft } from 'react-icons/fa';

const ChatSidebar = ({ onSelectChat, onNewChat, isChatOpen, onToggleSidebar }) => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/chatbot/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChats(response.data.history);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            }
        };
        fetchChats();
    }, [isChatOpen]);

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/chatbot/history/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove chat from state after successful deletion
            setChats(chats.filter(chat => chat._id !== chatId));
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <button onClick={onNewChat} className="new-chat-btn">
                    <FaPlus /> <span>New Chat</span>
                </button>
                <button onClick={onToggleSidebar} className="toggle-sidebar-btn">
                    <FaArrowLeft />
                </button>
            </div>
            <div className="chat-list">
                {chats.length > 0 ? (
                    chats.map(chat => (
                        <div key={chat._id} className="chat-item" onClick={() => onSelectChat(chat)}>
                            <FaRegComment />
                            <span>{chat.title}</span>
                            <button onClick={(e) => handleDeleteChat(e, chat._id)} className="delete-chat-btn">
                                <FaTrash />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-chats-msg">No chats yet.</p>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;