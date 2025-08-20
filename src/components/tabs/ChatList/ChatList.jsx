import { useState, useMemo } from "react";
import { useChatContext } from "../../../context/ChatContext";
import { buildImageUrl } from "../../../services/api.imageproxy";
import "./ChatList.css";
import SearchIcon from "../../../assets/Icon_fill/Search_alt_fill.svg";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";

export default function ChatList() {
  const {
    chatUsers,
    selectedUserId,
    directSelectChat,
    loading
  } = useChatContext();

  const [searchText, setSearchText] = useState("");
  const [imgSrcMap, setImgSrcMap] = useState({});
  const [imgErrorCountMap, setImgErrorCountMap] = useState({});
  const [useBackupImgMap, setUseBackupImgMap] = useState({});

  const getImgSrc = (user) => {
    if (imgSrcMap[user.id]) return imgSrcMap[user.id];
    if (user.avatar) return buildImageUrl(user.avatar, useBackupImgMap[user.id]);
    return ProfileHolder;
  };

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!chatUsers) return [];
    const lower = searchText.toLowerCase();
    return chatUsers.filter((u) =>
      u.name?.toLowerCase().includes(lower)
    );
  }, [chatUsers, searchText]);


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
      {/* Chat list's search bar */}
      <div className="chat-search-box">
        <div className="chat-search-header">
          {/* <span className="back-arrow">&lt;</span> */}
          <span className="chat-title">Chats</span>
        </div>
        <div className="chat-search-input-wrapper">
          <span className="chat-search-icon">
            <img src={SearchIcon} alt="Search" />
          </span>
          <input
            type="text"
            placeholder="Search Collector"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* User chat list */}
      <div className="chat-users">
        {filteredUsers.length === 0 ? (
          <div className="no-results text-center text-white">No matches found</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`chat-user ${user.id.toString() === selectedUserId ? "active" : ""}`}
              onClick={() => directSelectChat(user.id)}
            >
              <img
                src={getImgSrc(user)}
                alt={user.name}
                onError={() => {
                  setImgErrorCountMap((prev) => ({
                    ...prev,
                    [user.id]: (prev[user.id] || 0) + 1
                  }));
                  if ((imgErrorCountMap[user.id] || 0) === 0 && user.avatar) {
                    setUseBackupImgMap((prev) => ({
                      ...prev,
                      [user.id]: true
                    }));
                    setImgSrcMap((prev) => ({
                      ...prev,
                      [user.id]: buildImageUrl(user.avatar, true)
                    }));
                  } else {
                    setImgSrcMap((prev) => ({
                      ...prev,
                      [user.id]: ProfileHolder
                    }));
                  }
                }}
              />
              <span>{user.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
