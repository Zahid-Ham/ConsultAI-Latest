// frontend/src/components/ChatFloatingButton.jsx

import React, { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ChatWithAI.css"; // This CSS file will now contain styles for both the floating button and the new chat window

const ChatFloatingButton = () => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleChatToggle = () => {
    navigate("/chat/ai");
  };

  return (
    <div
      className={`chat-ai-float ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleChatToggle}
    >
      <FaRobot className="chat-ai-icon" />
      {hovered && <span className="chat-ai-text">Chat with AI</span>}
    </div>
  );
};

export default ChatFloatingButton;
