// frontend/src/components/chat/PatientDoctorChat.jsx

import React, { useState, useEffect, useRef } from "react";
// FIX: Use 'api' instead of 'axios'
import api from "../../utils/api";
import { useAuthContext } from "../../contexts/AuthContext";
import { useSocketContext } from "../../contexts/SocketContext";
import "../../assets/css/ChatStyles.css";
import "../../assets/css/ChatWindow.css";
import { FaPaperPlane, FaTrash, FaUpload, FaCloud } from "react-icons/fa";

// Premium Upload Modal Dialog
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
  user, // Pass user prop to component
}) => {
  const [selectedCloudFile, setSelectedCloudFile] = useState(null);

  // FIX: Handle Cloudinary loading here or pass it down
  // For simplicity, we assume parent handles logic or we use props
  // But wait, the previous code had useEffect HERE. Let's fix that.

  if (!open) return null;
  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h2>Share a File</h2>
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
              <p>Choose any file to share with your chat partner.</p>
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
                Share Selected File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientDoctorChat = () => {
  const { user } = useAuthContext();
  const { socket } = useSocketContext();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the upload dialog
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
      // Use new endpoint to fetch only files uploaded by the current user
      if (user && user._id) {
        // FIX: Use api.get (no localhost)
        api
          .get(`/cloudinary/user/${user._id}`)
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

  const messagesEndRef = useRef(null);

  const fetchDoctors = async () => {
    try {
      // FIX: Use api.get (removes localhost and auto-attaches token)
      const response = await api.get("/doctors/verified");
      setDoctors(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching verified doctors:", error);
      if (error.response && error.response.status === 404) {
        setError("No verified doctors found.");
      } else {
        setError("Failed to fetch doctors.");
      }
    }
  };

  const fetchConversations = async () => {
    try {
      // FIX: Use api.get
      const response = await api.get("/chat/conversations");
      setConversations(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to fetch conversations.");
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // FIX: Use api.get
      const response = await api.get(`/chat/messages/${conversationId}`);
      setMessages(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to fetch messages.");
    }
  };

  // File upload logic
  const handleUploadFromComputer = async (file) => {
    if (!file || !selectedConversation) return;
    setUploadDialogOpen(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", selectedConversation._id);
      formData.append("senderId", user._id);

      // FIX: Use api.post and force multipart headers
      await api.post("/chat/messages/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      alert("File upload failed");
    }
  };

  const handleSelectCloudFile = async (publicId) => {
    if (!publicId || !selectedConversation) return;
    setUploadDialogOpen(false);
    try {
      const selectedFile = cloudFiles.find((f) => f.public_id === publicId);
      if (!selectedFile) throw new Error("File not found");

      // FIX: Use api.post
      await api.post("/chat/messages/cloudinary", {
        publicId,
        conversationId: selectedConversation._id,
        senderId: user._id,
        fileUrl: selectedFile.url,
        fileName: selectedFile.original_filename,
        fileType: selectedFile.resource_type,
      });
    } catch (err) {
      alert("Cloud file share failed");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (user.role === "patient") {
          await fetchDoctors();
        } else if (user.role === "doctor") {
          await fetchConversations();
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(
            "Failed to load data. Please check your network connection."
          );
        }
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // ... existing imports

  const PatientDoctorChat = () => {
    const { user } = useAuthContext();
    const { socket } = useSocketContext();

    // ... existing state variables ...

    // REPLACE THIS useEffect BLOCK
    useEffect(() => {
      if (socket && user?._id) {
        // 1. Define the register function
        const registerUser = () => {
          console.log("Registering user with socket:", user._id);
          socket.emit("register", user._id);
        };

        // 2. Register immediately on mount
        registerUser();

        // 3. Register AGAIN whenever the socket reconnects (CRITICAL FIX)
        socket.on("connect", registerUser);

        // 4. Setup message listeners
        const handleReceiveMessage = (message) => {
          setMessages((prevMessages) => {
            if (!prevMessages.find((msg) => msg._id === message._id)) {
              return [...prevMessages, message];
            }
            return prevMessages;
          });
        };

        const handleDeleteUpdate = (messageId) => {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== messageId)
          );
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messageDeleted", handleDeleteUpdate);

        // 5. Cleanup
        return () => {
          socket.off("connect", registerUser); // Stop listening to connect on unmount
          socket.off("receiveMessage", handleReceiveMessage);
          socket.off("messageDeleted", handleDeleteUpdate);
        };
      }
    }, [socket, user]); // Dependency array remains the same

    // ... rest of your component code ...

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    const handleSelectConversation = async (conv) => {
      setSelectedConversation(conv);
      await fetchMessages(conv._id);
    };

    const handleSelectDoctor = async (doctor) => {
      try {
        // FIX: Use api.post
        const response = await api.post("/chat/conversations", {
          recipientId: doctor._id,
        });

        const conv = response.data.data;
        setSelectedConversation(conv);
        await fetchMessages(conv._id);
      } catch (error) {
        console.error("Error starting conversation:", error);
        setError("Failed to start a new conversation.");
      }
    };

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedConversation) return;

      const messageData = {
        conversationId: selectedConversation._id,
        senderId: user._id,
        text: newMessage,
      };

      try {
        // FIX: Use api.post
        await api.post("/chat/messages", messageData);
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message.");
      }
    };

    const handleDeleteMessage = async (messageId) => {
      if (window.confirm("Are you sure you want to delete this message?")) {
        try {
          // FIX: Use api.delete
          await api.delete(`/chat/messages/${messageId}`);
          socket.emit("deleteMessage", messageId);
        } catch (error) {
          console.error("Error deleting message:", error);
          setError("Failed to delete message.");
        }
      }
    };

    const renderPatientView = () => (
      <div className="conversation-list">
        <h2>Doctors</h2>
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className={`conversation-item`}
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div className="conversation-item-info">
                <h3>Dr. {doctor.name}</h3>
                <p className="last-message">{doctor.specialization}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No doctors found.</p>
        )}
      </div>
    );

    const renderDoctorView = () => (
      <div className="conversation-list">
        <h2>Patients</h2>
        {conversations && conversations.length > 0 ? (
          conversations.map((conv) => {
            const patient = conv.participants.find((p) => p.role === "patient");
            if (!patient) return null;
            return (
              <div
                key={conv._id}
                className={`conversation-item ${
                  selectedConversation?._id === conv._id ? "active" : ""
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conversation-item-info">
                  <h3>{patient.name}</h3>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-data">No conversations yet.</p>
        )}
      </div>
    );

    const renderChatWindow = () => {
      if (!selectedConversation) {
        return (
          <div className="chat-window empty-chat-window">
            <p>
              Select a {user.role === "patient" ? "doctor" : "patient"} to start
              chatting.
            </p>
          </div>
        );
      }

      const otherUser = selectedConversation.participants.find(
        (p) => p._id !== user._id
      );
      if (!otherUser) {
        return (
          <div className="chat-window empty-chat-window">
            <p>Conversation partner not found.</p>
          </div>
        );
      }

      return (
        <div className="chat-window">
          <div className="chat-header">
            <h3>{otherUser.name}</h3>
          </div>
          <div className="chat-messages-container">
            <div className="chat-messages">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message-bubble ${
                      message.sender._id === user._id ? "sent" : "received"
                    }`}
                  >
                    {/* File message rendering */}
                    {message.fileUrl ? (
                      <div className="file-message-card premium-file-card">
                        <div className="file-message-icon">
                          {message.fileType === "pdf" ||
                          (message.fileName &&
                            message.fileName.toLowerCase().endsWith(".pdf")) ? (
                            <span
                              role="img"
                              aria-label="PDF"
                              style={{ fontSize: "2rem" }}
                            >
                              📄
                            </span>
                          ) : message.fileType &&
                            message.fileType.startsWith("image") ? (
                            <img
                              src={message.fileUrl}
                              alt={message.fileName || "file"}
                              style={{
                                maxWidth: "60px",
                                maxHeight: "60px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                              }}
                            />
                          ) : (
                            <span
                              role="img"
                              aria-label="File"
                              style={{ fontSize: "2rem" }}
                            >
                              📎
                            </span>
                          )}
                        </div>
                        <div className="file-message-info">
                          <div
                            className="file-message-name"
                            style={{
                              fontWeight: "bold",
                              color: "#4B3AE6",
                              fontSize: "1rem",
                            }}
                          >
                            {message.fileName || "Shared file"}
                          </div>
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-message-download-btn"
                            style={{
                              background: "#4B3AE6",
                              color: "#fff",
                              borderRadius: "6px",
                              padding: "6px 16px",
                              marginTop: "6px",
                              textDecoration: "none",
                              fontWeight: "500",
                              boxShadow: "0 2px 8px rgba(75,58,230,0.12)",
                            }}
                          >
                            Open / Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="message-content">{message.text}</div>
                    )}
                    {message.sender._id === user._id && (
                      <div className="message-actions">
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="delete-btn"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">Start the conversation!</p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <form className="message-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="message-input"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="button"
              className="upload-btn"
              title="Share a file"
              onClick={() => setUploadDialogOpen(true)}
            >
              <FaUpload />
            </button>
            <button type="submit" className="send-btn">
              <FaPaperPlane />
            </button>
          </form>
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
            user={user}
          />
        </div>
      );
    };

    if (loading) {
      return <div className="chat-container">Loading...</div>;
    }

    if (error) {
      return <div className="chat-container">{error}</div>;
    }

    return (
      <div className="chat-container">
        <div className="chat-page-layout">
          {user?.role === "patient" ? renderPatientView() : renderDoctorView()}
          {renderChatWindow()}
        </div>
      </div>
    );
  };
};
export default PatientDoctorChat;
