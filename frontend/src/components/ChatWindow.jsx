// frontend/src/components/ChatWindow.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaRobot,
  FaUpload,
  FaPaperPlane,
  FaFileAlt,
  FaTimes,
  FaStethoscope,
} from "react-icons/fa";
import "./ChatbotLayout.css";

const ChatWindow = ({ selectedChat, onNewChat, onExitChat, onChatUpdate }) => {
  const navigate = useNavigate();
  // Disable scroll for chat/ai page only
  useEffect(() => {
    if (window.location.pathname === "/chat/ai") {
      document.body.classList.add("chat-ai-no-scroll");
      return () => document.body.classList.remove("chat-ai-no-scroll");
    }
  }, []);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // If no chat is selected, create a new chat session first

    if (!selectedChat && typeof onNewChat === "function") {
      // Show user's message immediately
      const userMessage = { sender: "user", text: input };
      setMessages([userMessage]);
      setInput("");
      setLoading(true);
      try {
        // onNewChat should return a Promise that resolves to the new chat object
        const newChat = await onNewChat();
        if (newChat) {
          if (onChatUpdate) onChatUpdate(newChat);
          // Now send the message to the new chat
          const token = localStorage.getItem("token");
          const response = await axios.post(
            "http://localhost:5000/api/chatbot/symptom-analysis",
            { message: userMessage.text, chatId: newChat._id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Fetch updated chat from backend
          const chatRes = await axios.get(
            `http://localhost:5000/api/chatbot/history/${newChat._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const updatedChat = chatRes.data.chat;
          setMessages(updatedChat.messages);
          if (onChatUpdate) onChatUpdate(updatedChat);
        }
      } catch (error) {
        console.error("Error creating new chat and sending message:", error);
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            sender: "ai",
            text: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // If chat is selected, proceed as before
    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/chatbot/symptom-analysis",
        { message: input, chatId: selectedChat ? selectedChat._id : null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Fetch updated chat from backend
      if (selectedChat && selectedChat._id) {
        const chatRes = await axios.get(
          `http://localhost:5000/api/chatbot/history/${selectedChat._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedChat = chatRes.data.chat;
        setMessages(updatedChat.messages);
        // Update chat title after first user message
        const firstUserMsg = updatedChat.messages.find(
          (m) => m.sender === "user"
        );
        if (firstUserMsg) {
          updatedChat.title =
            firstUserMsg.text.substring(0, 30) +
            (firstUserMsg.text.length > 30 ? "..." : "");
        }
        if (onChatUpdate) onChatUpdate(updatedChat);
      } else {
        // Fallback: just add AI message
        const aiMessage = { sender: "ai", text: response.data.reply };
        setMessages((currentMessages) => [...currentMessages, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          sender: "ai",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
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
    formData.append("file", file);
    formData.append("chatId", selectedChat ? selectedChat._id : null);

    const userMessage = {
      sender: "user",
      text: `Analyzing file: ${file.name}...`,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/chatbot/report-analysis",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const aiMessage = { sender: "ai", text: response.data.reply };
      setMessages((currentMessages) => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, something went wrong with the file upload. Please ensure it is a valid PDF.",
      };
      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleBubbleClick = (text) => {
    setInput(text);
  };

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <div className="chat-title">
          {selectedChat ? selectedChat.title : "New Chat"}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="exit-btn"
          aria-label="Close Chatbot"
        >
          <FaTimes />
        </button>
      </div>
      <div className="chat-messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to ConsultAI</h2>
            <p>
              Ask a question about your symptoms or upload a medical report for
              analysis.
            </p>
            <div className="welcome-bubbles">
              <button
                className="bubble"
                onClick={() =>
                  handleBubbleClick("What are the symptoms of a common cold?")
                }
              >
                What are the symptoms of a common cold?
              </button>
              <button
                className="bubble"
                onClick={() =>
                  handleBubbleClick("What does my lab report mean?")
                }
              >
                What does my lab report mean?
              </button>
              <button
                className="bubble"
                onClick={() => handleBubbleClick("How can I manage stress?")}
              >
                How can I manage stress?
              </button>
            </div>
          </div>
        )}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.sender}`}>
              <div className="message-icon">
                {msg.sender === "user" ? <FaUser /> : <FaRobot />}
              </div>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="loading-message message-row">
              <div className="message-icon">
                <FaRobot />
              </div>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "18px 0 0 0",
          }}
        >
          <button
            onClick={() => navigate("/chat")}
            style={{
              background: "linear-gradient(120deg, #10b981 0%, #34d399 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "12px 28px",
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "background 0.2s, transform 0.2s",
            }}
            aria-label="Consult a doctor"
          >
            <FaStethoscope /> Need to consult a doctor? Click here
          </button>
        </div>
      </div>
      <div className="chat-input-area">
        <div className="file-upload-section">
          <label htmlFor="file-upload" className="file-upload-btn">
            <FaFileAlt />
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
          </label>
          {file && (
            <>
              <span className="file-name">{file.name}</span>
              <button onClick={handleFileUpload} className="send-file-btn">
                <FaUpload />
              </button>
            </>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message ConsultAI..."
            className="message-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={loading || !!file}
            aria-label="Send"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="14" cy="14" r="14" fill="#10b981" />
              <path
                d="M8 14L20 14"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M14 8L20 14L14 20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
