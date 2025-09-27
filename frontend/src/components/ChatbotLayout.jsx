// frontend/src/components/ChatbotLayout.jsx

import React, { useState } from 'react';
import ChatHistorySidebar from './ChatHistorySidebar';
import ChatWindow from './ChatWindow';
import { useNavigate } from 'react-router-dom';
import './ChatbotLayout.css';

const ChatbotLayout = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate = useNavigate();

    const handleNewChat = () => {
        setSelectedChat(null);
    };

    const handleExitChat = () => {
        navigate('/dashboard');
    };

    return (
        <div className="chatbot-layout-container">
            {/* Sidebar */}
            <ChatHistorySidebar 
                onNewChat={handleNewChat} 
                onSelectChat={setSelectedChat} 
            />

            {/* Chat Window Section */}
            <div className="chat-window-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <h2 className="chat-title">
                        {selectedChat ? selectedChat.title : "New Chat"}
                    </h2>
                    <button 
                        className="exit-btn" 
                        onClick={handleExitChat} 
                        aria-label="Exit Chat"
                    >
                        ✖
                    </button>
                </div>

                {/* Chat Content */}
                <div className="chat-messages-container">
                    {selectedChat ? (
                        <ChatWindow 
                            selectedChat={selectedChat} 
                            onNewChat={handleNewChat} 
                            onExitChat={handleExitChat} 
                        />
                    ) : (
                        <div className="welcome-message">
                            <h2>👋 Welcome to your AI Assistant</h2>
                            <p>Start a new chat or select one from history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatbotLayout;
