import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaRobot, FaUpload, FaPaperPlane, FaFileAlt } from 'react-icons/fa';
import './Chatbot.css';

// Chatbot component for the small pop-up chat window
const Chatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        const userMessage = { sender: 'user', text: input };
        setMessages(currentMessages => [...currentMessages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chatbot/symptom-analysis', { message: input }, {
                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setMessages(currentMessages => [...currentMessages, aiMessage]);
        } catch (error) {
            console.error('Error sending message to AI:', error);
            setMessages(currentMessages => [...currentMessages, { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const userMessage = { sender: 'user', text: `Analyzing file: ${file.name}...` };
        setMessages(currentMessages => [...currentMessages, userMessage]);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chatbot/report-analysis', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                     Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setMessages(currentMessages => [...currentMessages, aiMessage]);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = { sender: 'ai', text: 'Sorry, something went wrong with the file upload. Please ensure it is a valid PDF.' };
            setMessages(currentMessages => [...currentMessages, errorMessage]);
        } finally {
            setLoading(false);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h3 className="text-white font-semibold">ConsultAI Chatbot</h3>
                <button onClick={onClose} className="text-white hover:text-red-500 focus:outline-none">
                    <FaTimes size={18} />
                </button>
            </div>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className={`message-icon ${msg.sender}`}>
                            {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
                        </div>
                        <div className="message-content">{msg.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="loading-message">
                        <FaRobot className="inline-block mr-2" />
                        AI is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input">
                <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your symptoms or ask a question..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <label htmlFor="file-upload" className="flex items-center justify-center p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400">
                        <FaFileAlt size={20} />
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                    </label>
                    {file && (
                        <button
                            type="button"
                            onClick={handleFileUpload}
                            className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        >
                            <FaUpload size={16} />
                        </button>
                    )}
                    <button type="submit" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none" disabled={loading || !!file}>
                        <FaPaperPlane size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;