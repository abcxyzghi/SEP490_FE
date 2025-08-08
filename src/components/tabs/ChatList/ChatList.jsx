import React from "react";
import "./ChatList.css";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { useParams } from "react-router-dom";

export default function ChatList({ users, selectedUser, onSelectUser }) {
  const { id } = useParams();
  if (!users || users.length === 0) {
    return <div>No users found.</div>;
  }
  return (
    <div className="chat-list">
      <div className="search-box">
        <div className="search-header">
          <span className="back-arrow">&lt;</span>
          <span className="chat-title">Chat</span>
        </div>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search Collector" />
        </div>
      </div>
      <div className="chat-users">
        {users.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${user.id.toString() === id ? "active" : ""}`}
            onClick={() => onSelectUser(user)}
          >
            <img src={buildImageUrl(user.avatar)} alt={user.name} />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
