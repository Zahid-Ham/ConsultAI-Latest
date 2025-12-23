// frontend/src/components/ChatbotPage.jsx

import React, { useState, useEffect } from "react";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ChatWindow from "./ChatWindow";
// MODIFIED: Import the api utility instead of axios directly
import api from "../utils/api";
import "./ChatbotPage.css";

const ChatbotPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Fetch chat history on mount and whenever a chat is updated
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // MODIFIED: Use api.get() and remove hardcoded URL & headers
        const response = await api.get("/chatbot/history");

        setChatHistory(response.data.history);
        // If no chat history, automatically create a new chat session
        if (response.data.history.length === 0) {
          handleNewChat();
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchChats();
  }, []);

  // Create a new chat session
  const handleNewChat = async () => {
    try {
      // MODIFIED: Use api.post() - no headers needed (handled by api.js)
      const response = await api.post("/chatbot/history", {});

      const newChatId = response.data.chatId;
      // Fetch the new chat object
      const chatRes = await api.get(`/chatbot/history/${newChatId}`);

      const newChat = chatRes.data.chat;
      setChatHistory((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
      return newChat;
    } catch (error) {
      console.error("Failed to create new chat:", error);
      return null;
    }
  };

  // Update chat history in real time when a message is sent
  const handleChatUpdate = (updatedChat) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
    );
    setSelectedChat(updatedChat);
  };

  // Delete chat handler
  const handleDeleteChat = async (chatId) => {
    try {
      // MODIFIED: Use api.delete()
      await api.delete(`/chatbot/history/${chatId}`);

      setChatHistory((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat && selectedChat._id === chatId) setSelectedChat(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="chatbot-page-container">
      <ChatHistorySidebar
        chats={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        onDeleteChat={handleDeleteChat}
      />
      {/* Ensure ChatWindow is also updated to use 'api' if it isn't already */}
      <ChatWindow
        selectedChat={selectedChat}
        onNewChat={handleNewChat}
        onChatUpdate={handleChatUpdate}
      />
    </div>
  );
};

export default ChatbotPage;
