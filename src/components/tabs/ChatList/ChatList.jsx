import { useChatContext } from "../../../context/ChatContext";
import { buildImageUrl } from "../../../services/api.imageproxy";
import "./ChatList.css";

export default function ChatList() {
  const {
    chatUsers,
    selectedUserId,
    directSelectChat,
    loading
  } = useChatContext();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!chatUsers || chatUsers.length === 0) {
    return <div className="empty-chat-list">No conversations found.</div>;
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
        {chatUsers.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${user.id.toString() === selectedUserId ? "active" : ""}`}
            onClick={() => directSelectChat(user.id)}
          >
            <img
              src={buildImageUrl(user.avatar)}
              alt={user.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
