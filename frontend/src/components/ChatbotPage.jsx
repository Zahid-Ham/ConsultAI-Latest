import React, { useState, useEffect } from "react";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ChatWindow from "./ChatWindow";
// FIX: Use the 'api' utility which is hardcoded to Render
import api from "../utils/api";
import "./ChatbotPage.css";

const ChatbotPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // FIX: Remove 'http://localhost:5000' and use api.get
        const response = await api.get("/chatbot/history");
        setChatHistory(response.data.history);
        if (response.data.history.length === 0) {
          handleNewChat();
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      // FIX: Use api.post
      const response = await api.post("/chatbot/history", {});
      const newChatId = response.data.chatId;
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

  const handleChatUpdate = (updatedChat) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
    );
    setSelectedChat(updatedChat);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      // FIX: Use api.delete
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
      <ChatWindow
        selectedChat={selectedChat}
        onNewChat={handleNewChat}
        onChatUpdate={handleChatUpdate}
      />
    </div>
  );
};

export default ChatbotPage;
