import React, { useRef, useEffect, useState } from "react";
import "./ChatWindow.css";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { useParams } from "react-router-dom";
import { getOtherProfile } from "../../../services/api.user";

export default function ChatWindow({
  messages,
  myId,
  inputMsg,
  setInputMsg,
  handleSend,
  isSending,
  selectedUser,
}) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!id) {
          console.log('No user ID provided');
          setLoading(false);
          return;
        }

        const res = await getOtherProfile(id);

        if (res && res.status) {

          setProfile(res.data);
        } else {
          console.log('Profile not found');
        }
      } catch (error) {
        console.log('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);
  return (
    <div className="chat-window">
      {profile && (
        <div className="chat-header">
          <img src={buildImageUrl(profile.profileImage)} alt="" className="avatar" />
          <span>{profile.username}</span>
        </div>
      )}


      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === myId;
          return (
            <div
              key={idx}
              className={`message-row ${isMine ? "mine" : "theirs"}`}
            >
              {!isMine && (
                <img src={buildImageUrl(profile.profileImage)} alt="" className="avatar" />
              )}
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="time">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>
      <div className="chat-input-container">
        <div className="chat-input">
          <input
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Message"
            disabled={isSending}
          />
        </div>
        <button onClick={handleSend} disabled={isSending}>
          ✈
        </button>
      </div>
    </div>
  );
}
