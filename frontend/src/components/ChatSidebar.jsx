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
                            {
                                (() => {
                                    // Compute a display title if the backend title is default
                                    const defaultTitle = !chat.title || /^New Chat/i.test(chat.title);
                                    if (!defaultTitle) return <span>{chat.title}</span>;
                                    // Try to derive from first message
                                    let derived = 'New Chat';
                                    if (chat.messages && chat.messages.length > 0) {
                                        const first = chat.messages[0].text || '';
                                        const text = typeof first === 'string' ? first : JSON.stringify(first);
                                        const fileMatch = text.match(/(?:File attached:|Cloud file attached:)\s*([^\.\n]+)/i);
                                        if (fileMatch && fileMatch[1]) {
                                            derived = fileMatch[1].trim();
                                        } else if (text.trim().length > 0) {
                                            derived = text.trim().substring(0, 30) + (text.trim().length > 30 ? '...' : '');
                                        }
                                    }
                                    return <span>{derived}</span>;
                                })()
                            }
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