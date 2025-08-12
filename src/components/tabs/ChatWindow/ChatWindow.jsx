import { useEffect, useRef } from "react";
import { useChatContext } from "../../../context/ChatContext";
import { buildImageUrl } from "../../../services/api.imageproxy";
import "./ChatWindow.css";
import SendIcon from "../../../assets/Icon_fill/Send_fill.svg";

export default function ChatWindow() {
  const {
    messages,
    myId,
    inputMsg,
    setInputMsg,
    handleSendMessage,
    isSending,
    partnerProfile,
    chatEndRef,
    loading,
    status,
    scrollToBottom
  } = useChatContext();

  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, scrollToBottom]);

  if (loading) {
    return <div className="chat-window special">
      <div className="empty-state">
        <p>Loading conversations...</p>
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div></div>;
  }

  if (!partnerProfile) {
    return (
      <div className="chat-window special">
        <div className="chat-header special">

          <h2>Welcome to Chat</h2>
        </div>
        <div className="empty-state">
          <p>Select a conversation to start chatting</p>
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window oxanium-regular">
      <div className="chat-header">
        <img
          src={buildImageUrl(partnerProfile.profileImage)}
          alt=""
          className="chat-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/40";
          }}
        />
        <span>{partnerProfile.username}</span>
        {status && <div className="chat-status">{status}</div>}
      </div>

      <div className="chat-messages" onClick={() => document.querySelector('.chat-input input')?.focus()}>
        {messages.length === 0 ? (
          <div className="chat-no-messages">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender_id === myId;
            return (
              <div
                key={msg._id || idx}
                className={`message-row ${isMine ? "mine" : "theirs"}`}
              >
                {!isMine && partnerProfile && (
                  <img
                    src={buildImageUrl(partnerProfile.profileImage)}
                    alt=""
                    className="chat-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/40";
                    }}
                  />
                )}
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span className="chat-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isSending) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={isSending || !partnerProfile}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isSending || !inputMsg.trim() || !partnerProfile}
        >
          {isSending ? <span className="loading loading-bars loading-md"></span> : <img src={SendIcon} alt="Send" className="chat-send-icon"/>}
        </button>
      </div>
    </div>
  );
}
