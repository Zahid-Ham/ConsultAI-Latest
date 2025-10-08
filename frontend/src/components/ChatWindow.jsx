// frontend/src/components/ChatWindow.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FaUser,
  FaRobot,
  FaFileAlt,
  FaTimes,
  FaStethoscope,
  FaUpload,
  FaCloud,
} from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import "./ChatbotLayout.css";
import ReportDisplay from './ReportDisplay';
import './ReportDisplay.css';

// Upload Modal Dialog Component
const UploadFileDialog = ({
  open,
  onClose,
  onUploadFromComputer,
  onSelectCloudFile,
  cloudFiles,
  loadingCloud,
  errorCloud,
  tab,
  setTab,
}) => {
  const [selectedCloudFile, setSelectedCloudFile] = useState(null);
  if (!open) return null;
  
  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h2>Upload Medical Report</h2>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="upload-modal-tabs">
          <button
            className={tab === "computer" ? "active" : ""}
            onClick={() => setTab("computer")}
          >
            <FaUpload /> Upload from Computer
          </button>
          <button
            className={tab === "cloud" ? "active" : ""}
            onClick={() => setTab("cloud")}
          >
            <FaCloud /> Cloudinary
          </button>
        </div>
        <div className="upload-modal-content">
          {tab === "computer" ? (
            <div className="upload-computer-section">
              <input
                type="file"
                onChange={(e) => onUploadFromComputer(e.target.files[0])}
                className="upload-file-input"
              />
              <p>Choose a medical report or document to analyze.</p>
            </div>
          ) : (
            <div className="upload-cloud-section">
              {loadingCloud ? (
                <p>Loading files...</p>
              ) : errorCloud ? (
                <p>{errorCloud}</p>
              ) : (
                <ul className="cloud-file-list">
                  {cloudFiles && cloudFiles.length > 0 ? (
                    cloudFiles.map((file) => (
                      <li
                        key={file.public_id}
                        className={
                          selectedCloudFile === file.public_id ? "selected" : ""
                        }
                        onClick={() => setSelectedCloudFile(file.public_id)}
                      >
                        <span>{file.original_filename || file.public_id}</span>
                      </li>
                    ))
                  ) : (
                    <li>No files found in Cloudinary.</li>
                  )}
                </ul>
              )}
              <button
                className="select-cloud-btn"
                disabled={!selectedCloudFile}
                onClick={() => onSelectCloudFile(selectedCloudFile)}
              >
                Analyze Selected File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatWindow = ({ selectedChat, onNewChat, onChatUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
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

  // Cloudinary dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cloudFiles, setCloudFiles] = useState([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [errorCloud, setErrorCloud] = useState(null);
  const [uploadTab, setUploadTab] = useState("computer");

  // Fetch Cloudinary files when dialog opens and tab is 'cloud'
  useEffect(() => {
    if (uploadDialogOpen && uploadTab === "cloud") {
      setLoadingCloud(true);
      setErrorCloud(null);
      const token = localStorage.getItem("token");
      if (user && user._id) {
        axios
          .get(`http://localhost:5000/api/cloudinary/user/${user._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          .then((res) => {
            setCloudFiles(res.data.files || []);
            setLoadingCloud(false);
          })
          .catch((err) => {
            setErrorCloud("Failed to load cloud files.");
            setLoadingCloud(false);
          });
      } else {
        setCloudFiles([]);
        setLoadingCloud(false);
      }
    }
  }, [uploadDialogOpen, uploadTab, user]);

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
    if (input.trim() === "" && !file) return;

    // If we have a file attached, process it with the text message
    if (file) {
      await handleFileUpload(input.trim());
      setInput("");
      return;
    }

    // If no chat is selected, create a new chat session first
    if (!selectedChat && typeof onNewChat === "function") {
      const userMessage = { sender: "user", text: input };
      setMessages([userMessage]);
      setInput("");
      setLoading(true);
      try {
        const newChat = await onNewChat();
        if (newChat) {
          if (onChatUpdate) onChatUpdate(newChat);
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:5000/api/chatbot/symptom-analysis",
            { message: userMessage.text, chatId: newChat._id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
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

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/chatbot/symptom-analysis",
        { message: input, chatId: selectedChat ? selectedChat._id : null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (selectedChat && selectedChat._id) {
        const chatRes = await axios.get(
          `http://localhost:5000/api/chatbot/history/${selectedChat._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedChat = chatRes.data.chat;
        setMessages(updatedChat.messages);
        if (onChatUpdate) onChatUpdate(updatedChat);
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

  const handleFileUpload = async (userMessage = "") => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    if (selectedChat && selectedChat._id) {
        formData.append("chatId", selectedChat._id);
    } else {
        formData.append("chatId", ''); 
    }
    formData.append("userMessage", userMessage);

    const displayMessage = userMessage
      ? `${userMessage} [Attached file: ${file.name}]`
      : `File attached: ${file.name}`;
      
    const userMessageObj = {
      sender: "user",
      text: displayMessage,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessageObj]);
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

      const { chatId } = response.data;

      const chatRes = await axios.get(
        `http://localhost:5000/api/chatbot/history/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedChat = chatRes.data.chat;

      setMessages(updatedChat.messages);

      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }

    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, there was an error analyzing your report.",
      };
      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle upload from computer via dialog
  const handleUploadFromComputer = async (selectedFile) => {
    if (!selectedFile) return;
    setUploadDialogOpen(false);
    setFile(selectedFile);
  };

  // Handle cloud file selection
  const handleSelectCloudFile = async (publicId) => {
    if (!publicId) return;
    setUploadDialogOpen(false);
    
    try {
      const token = localStorage.getItem("token");
      const selectedFile = cloudFiles.find((f) => f.public_id === publicId);
      if (!selectedFile) throw new Error("File not found");

      // Show user message indicating file is being processed
      const displayMessage = input.trim()
        ? `${input.trim()} [Cloudinary file: ${selectedFile.original_filename || selectedFile.public_id}]`
        : `Cloudinary file attached: ${selectedFile.original_filename || selectedFile.public_id}`;
      
      const userMessageObj = {
        sender: "user",
        text: displayMessage,
      };
      
      setMessages(prevMessages => [...prevMessages, userMessageObj]);
      setLoading(true);

      // Prepare data for cloudinary file analysis
      const payload = {
        publicId,
        fileUrl: selectedFile.url,
        fileName: selectedFile.original_filename,
        fileType: selectedFile.resource_type,
        userMessage: input.trim(),
        chatId: selectedChat && selectedChat._id ? selectedChat._id : '',
      };

      const response = await axios.post(
        "http://localhost:5000/api/chatbot/report-analysis-cloudinary",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { chatId } = response.data;

      const chatRes = await axios.get(
        `http://localhost:5000/api/chatbot/history/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedChat = chatRes.data.chat;

      setMessages(updatedChat.messages);
      setInput("");

      if (onChatUpdate) {
        onChatUpdate(updatedChat);
      }

    } catch (error) {
      console.error("Error analyzing cloud file:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, there was an error analyzing your cloud file.",
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
              <div className="message-content">
                {(() => {
                  if (msg.sender === 'user') {
                    return <p>{msg.text}</p>;
                  }
                  if (msg.sender === 'ai' && msg.text) {
                    if (typeof msg.text === 'object' && msg.text !== null) {
                      return <ReportDisplay data={msg.text} />;
                    }
                    try {
                      const parsedData = JSON.parse(msg.text);
      
                      if (typeof parsedData === 'object' && parsedData !== null && parsedData.keyTakeaways) {
                        return <ReportDisplay data={parsedData} />;
                      }
                    } catch (e) {
                      // Not JSON, fall through to Markdown renderer
                    }
                    return (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(msg.text)}</ReactMarkdown>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
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
          <label 
            className="file-upload-btn"
            onClick={() => setUploadDialogOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <FaFileAlt />
          </label>
          {file && (
            <>
              <span className="file-name">{file.name}</span>
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="remove-file-btn"
                title="Remove file"
              >
                <FaTimes />
              </button>
            </>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={file ? "Add a message about this file..." : "Message ConsultAI..."}
            className="message-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={loading}
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
      
      <UploadFileDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadFromComputer={handleUploadFromComputer}
        onSelectCloudFile={handleSelectCloudFile}
        cloudFiles={cloudFiles}
        loadingCloud={loadingCloud}
        errorCloud={errorCloud}
        tab={uploadTab}
        setTab={setUploadTab}
      />
    </div>
  );
};

export default ChatWindow;