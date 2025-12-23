import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // FIX: Use direct axios instead of api.js
import {
  FaTimes,
  FaUser,
  FaRobot,
  FaUpload,
  FaPaperPlane,
  FaFileAlt,
  FaCloud,
} from "react-icons/fa";
import "./Chatbot.css";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hardcoded Backend URL (Bypassing api.js to ensure it works)
  const BACKEND_URL = "https://consultai-backend.onrender.com/api";

  // Cloudinary dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cloudFiles, setCloudFiles] = useState([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [errorCloud, setErrorCloud] = useState(null);
  const [uploadTab, setUploadTab] = useState("computer");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    const userMessage = { sender: "user", text: input };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // FIX: Explicit full URL + manual token header
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/chatbot/symptom-analysis`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { sender: "ai", text: response.data.reply };
      setMessages((currentMessages) => [...currentMessages, aiMessage]);
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

  // Fetch Cloudinary files
  useEffect(() => {
    if (uploadDialogOpen && uploadTab === "cloud") {
      setLoadingCloud(true);
      setErrorCloud(null);

      const userStr = localStorage.getItem("user");
      let userId = null;
      try {
        const u = userStr ? JSON.parse(userStr) : null;
        userId = u?._id || null;
      } catch (e) {
        userId = null;
      }

      if (userId) {
        const token = localStorage.getItem("token");
        axios
          .get(`${BACKEND_URL}/cloudinary/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
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
  }, [uploadDialogOpen, uploadTab]);

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const userMessage = {
      sender: "user",
      text: `Analyzing file: ${file.name}...`,
    };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/chatbot/report-analysis`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = { sender: "ai", text: response.data.reply };
      setMessages((currentMessages) => [...currentMessages, aiMessage]);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, something went wrong with the file upload.",
      };
      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setLoading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectCloudFile = async (publicId) => {
    if (!publicId) return;
    setUploadDialogOpen(false);
    try {
      const selectedFile = cloudFiles.find((f) => f.public_id === publicId);
      if (!selectedFile) throw new Error("File not found");

      const displayMessage = input.trim()
        ? `${input.trim()} [Cloudinary file: ${
            selectedFile.original_filename || selectedFile.public_id
          }]`
        : `Cloudinary file attached: ${
            selectedFile.original_filename || selectedFile.public_id
          }`;

      const userMessageObj = { sender: "user", text: displayMessage };
      setMessages((currentMessages) => [...currentMessages, userMessageObj]);
      setLoading(true);

      const payload = {
        publicId,
        fileUrl: selectedFile.url,
        fileName: selectedFile.original_filename,
        fileType: selectedFile.resource_type,
        userMessage: input.trim(),
        chatId: null,
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/chatbot/report-analysis-cloudinary`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiReply = response.data.reply;
      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: "ai", text: aiReply },
      ]);
      setInput("");
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

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3 className="text-white font-semibold">ConsultAI Chatbot</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-red-500 focus:outline-none"
        >
          <FaTimes size={18} />
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className={`message-icon ${msg.sender}`}>
              {msg.sender === "user" ? <FaUser /> : <FaRobot />}
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
          <label className="flex items-center justify-center p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400">
            <FaFileAlt size={20} />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <button
            type="button"
            title="Share a file"
            className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
            onClick={() => setUploadDialogOpen(true)}
          >
            <FaUpload size={16} />
          </button>
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
          <button
            type="submit"
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
            disabled={loading || !!file}
          >
            <FaPaperPlane size={16} />
          </button>
        </form>
      </div>

      {/* Keeping the upload dialog JSX same as before */}
      {uploadDialogOpen && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h2>Upload Medical Report</h2>
              <button
                className="close-modal-btn"
                onClick={() => setUploadDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="upload-modal-tabs">
              <button
                className={uploadTab === "computer" ? "active" : ""}
                onClick={() => setUploadTab("computer")}
              >
                <FaUpload /> Upload from Computer
              </button>
              <button
                className={uploadTab === "cloud" ? "active" : ""}
                onClick={() => setUploadTab("cloud")}
              >
                <FaCloud /> Cloudinary
              </button>
            </div>
            <div className="upload-modal-content">
              {uploadTab === "computer" ? (
                <div className="upload-computer-section">
                  <input
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setUploadDialogOpen(false);
                    }}
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
                      {cloudFiles.length > 0 ? (
                        cloudFiles.map((f) => (
                          <li
                            key={f.public_id}
                            onClick={() => handleSelectCloudFile(f.public_id)}
                            style={{
                              cursor: "pointer",
                              padding: "8px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {f.original_filename || f.public_id}
                          </li>
                        ))
                      ) : (
                        <li>No files found.</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
