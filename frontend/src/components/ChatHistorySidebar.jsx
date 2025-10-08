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
          chats.map((chat) => {
            const defaultTitle = !chat.title || /^New Chat/i.test(chat.title);
            let derivedTitle = chat.title;
            if (defaultTitle) {
              if (chat.messages && chat.messages.length > 0) {
                const first = chat.messages[0].text || '';
                const text = typeof first === 'string' ? first : JSON.stringify(first);
                const fileMatch = text.match(/(?:File attached:|Cloud file attached:)\s*([^\.\n]+)/i);
                if (fileMatch && fileMatch[1]) {
                  derivedTitle = fileMatch[1].trim();
                } else if (text.trim().length > 0) {
                  derivedTitle = text.trim().substring(0, 30) + (text.trim().length > 30 ? '...' : '');
                } else {
                  derivedTitle = 'New Chat';
                }
              } else {
                derivedTitle = 'New Chat';
              }
            }

            return (
              <li
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`chat-item${
                  selectedChat && selectedChat._id === chat._id ? ' active' : ''
                }`}
              >
                <span className="chat-title">{derivedTitle}</span>
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
            );
          })
        ) : (
          <p className="no-chats-msg">No chats yet.</p>
        )}
      </ul>
    </div>
  );
};

export default ChatHistorySidebar;
