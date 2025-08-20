import { useChatContext } from "../../../context/ChatContext";
import { buildImageUrl } from "../../../services/api.imageproxy";
import "./ChatList.css";
import SearchIcon from "../../../assets/Icon_fill/Search_alt_fill.svg";

export default function ChatList() {
  const {
    chatUsers,
    selectedUserId,
    directSelectChat,
    loading
  } = useChatContext();

  if (loading) {
    return <div className="chat-list loading2">
      {/* Khi loading thì chỉ cần class này */}
    </div>;
  }

  if (!chatUsers || chatUsers.length === 0) {
    return <div className="chat-list">No conversations found.</div>;
  }

  return (
    <div className="chat-list oxanium-regular">
      <div className="search-box">
        <div className="search-header">
          <span className="back-arrow">&lt;</span>
          <span className="chat-title">Chat</span>
        </div>
        <div className="search-input-wrapper">
          <span className="search-icon">
            <img src={SearchIcon} alt="Search" />
          </span>
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
