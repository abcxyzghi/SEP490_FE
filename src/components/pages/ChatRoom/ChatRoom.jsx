import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChatProvider, useChatContext } from "../../../context/ChatContext";
import ChatList from "../../tabs/ChatList/ChatList";
import ChatWindow from "../../tabs/ChatWindow/ChatWindow";
import "./ChatRoom.css";

function ChatRoomContent() {
  const { directSelectChat } = useChatContext();
  const params = useParams();
  const otherUserId = params.otherUserId || params.id || "";

  useEffect(() => {
    if (otherUserId) {
      directSelectChat(otherUserId);
    }
  }, [otherUserId, directSelectChat]);

  return (
    <div className="chat-layout">
      <div className="chat-list-container">
        <ChatList />
      </div>
      <div className="chat-window-container">
        <ChatWindow />
      </div>
    </div>
  );
}

export default function ChatRoom() {
  return (
    <ChatProvider>
      <ChatRoomContent />
    </ChatProvider>
  );
}
