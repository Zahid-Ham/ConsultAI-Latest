// frontend/src/components/ChatSidebar.jsx

import React from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import "./ChatHistorySidebar.css";

const ChatHistorySidebar = ({
  chats,
  onSelectChat,
  onNewChat,
  selectedChat,
  onDeleteChat,
}) => {
  return (
    <div className="chat-history-sidebar">
      {/* New Chat Button */}
      <div className="new-chat-btn" onClick={onNewChat}>
        <FaPlus />
        <span>New Chat</span>
      </div>

      {/* Chat List */}
      <ul className="chat-list">
        {chats && chats.length > 0 ? (
          chats.map((chat) => (
            <li
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className={`chat-item${
                selectedChat && selectedChat._id === chat._id ? " active" : ""
              }`}
            >
              <span className="chat-title">{chat.title}</span>
              <div className="chat-actions">
                <FaTrashAlt
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteChat) onDeleteChat(chat._id);
                  }}
                />
              </div>
            </li>
          ))
        ) : (
          <p className="no-chats-msg">No chats yet.</p>
        )}
      </ul>
    </div>
  );
};

export default ChatHistorySidebar;
