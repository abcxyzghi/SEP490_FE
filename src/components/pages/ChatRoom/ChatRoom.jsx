import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "./ChatRoom.css";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
} from "../../../config/socket";
import {
  getMessages,
  getUserById,
  getUserInChat,
} from "../../../services/api.chat";
import ChatList from "../../tabs/ChatList/ChatList";
import ChatWindow from "../../tabs/ChatWindow/ChatWindow";
import { getListChat, getOtherProfile } from "../../../services/api.user";

export default function ChatRoom({ otherUserId = "" }) {
  const [status, setStatus] = useState("Initializing...");
  const [messages, setMessages] = useState([]);
  const hasFetch = useRef(false);
  const [conversationId, setConversationId] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const receivedMessageIds = useRef(new Set());
  const hasConnected = useRef(false);

  const user = useSelector((state) => state.auth.user);
  const myId = user?.user_id;
  const token = localStorage.getItem("token");
  const params = useParams();
  const finalOtherUserId = otherUserId || params.otherUserId || params.id || "";

  function isValidDate(date) {
    const d = new Date(date);
    return date && !isNaN(d.getTime());
  }
  // Log chỉ khi mount lần đầu
  // useEffect(() => {
  //   console.log("🔁 ChatRoom mounted");
  //   console.log("👤 myId:", myId);
  //   console.log("👥 finalOtherUserId:", finalOtherUserId);
  // }, [myId, finalOtherUserId]);

  const fetchMessages = useCallback(async () => {
    try {
      setMyName(user?.username || "Tôi");

      const res = await getUserInChat(token);
      const allConversations = res?.data?.flat() || [];

      const matchedConversation = allConversations.find(
        (convo) =>
          (convo.participant_1 === myId &&
            convo.participant_2 === finalOtherUserId) ||
          (convo.participant_2 === myId &&
            convo.participant_1 === finalOtherUserId)
      );

      if (!matchedConversation) {
        setStatus("Không tìm thấy cuộc trò chuyện");
        return;
      }

      const convId = matchedConversation._id;
      setConversationId(convId);

      const otherId =
        myId === matchedConversation.participant_1
          ? matchedConversation.participant_2
          : matchedConversation.participant_1;

      const userRes = await getUserById(otherId, token);
      const fetchedPartnerName = userRes?.data?.[0] || "Người dùng khác";
      setPartnerName(fetchedPartnerName);

      setStatus(
        `Bạn: ${user?.username || "Tôi"} — Đối phương: ${fetchedPartnerName}`
      );

      const msgRes = await getMessages(convId, 0, 50);
      const rawMessages = (msgRes.data || []).flat();

      const fixedMessages = rawMessages.map((m) => ({
        ...m,
        created_at: isValidDate(m.created_at)
          ? m.created_at
          : new Date().toISOString(),
      }));
      setMessages(fixedMessages);
      fixedMessages.forEach((msg) => {
        const key = msg._id
          ? msg._id
          : `${msg.sender_id}-${msg.content}-${new Date(
            msg.created_at
          ).getTime()}`;
        receivedMessageIds.current.add(key);
      });
    } catch (err) {
      console.error("❌ Lỗi khi setup chat:", err);
      setStatus("Lỗi khi tải dữ liệu");
    }
    console.log("Finish fetch message");
  }, []);

  const setupSocketChat = useCallback(() => {
    if (!conversationId) return;
    try {
      connectWebSocket(
        conversationId,
        myId,
        token,
        (data) => {
          try {
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            parsed.created_at = isValidDate(parsed.created_at)
              ? parsed.created_at
              : new Date().toISOString();

            // Ưu tiên dùng _id nếu có, nếu không thì dùng key cũ
            const key = parsed._id
              ? parsed._id
              : `${parsed.sender_id}-${parsed.content}-${new Date(
                parsed.created_at
              ).getTime()}`;
            if (!receivedMessageIds.current.has(key)) {
              receivedMessageIds.current.add(key);
              setMessages((prev) => [...prev, parsed]);
              // Nếu là tin nhắn của mình vừa gửi thì clear input và cho phép gửi tiếp
              if (parsed.sender_id === myId) {
                setInputMsg("");
                setIsSending(false);
              }
            }
            hasConnected.current = true;
          } catch (err) {
            console.error("❌ Lỗi parse message:", err);
          }
        },
        () =>
          setStatus(
            `Bạn: ${user?.username || "Tôi"} — Đối phương: ${partnerName}`
          ),
        () => setStatus("Đã ngắt kết nối"),
        (err) => {
          console.error("WebSocket error:", err);
          setStatus("Lỗi WebSocket");
        }
      );
    } catch (err) {
      console.error("❌ Lỗi khi setup chat:", err);
      setStatus("Lỗi khi tải dữ liệu");
    }
    console.log("Finish setup socket");
  }, [conversationId, myId, token]);

  useEffect(() => {
    if (hasFetch.current) return;
    if (myId && finalOtherUserId && token) {
      fetchMessages();
      hasFetch.current = true;
    }
  }, [myId, finalOtherUserId, token, fetchMessages]);

  useEffect(() => {
    if (conversationId && myId && token) {
      setupSocketChat();
    }
    return () => {
      disconnectWebSocket();
      hasConnected.current = false;
    };
  }, [conversationId, myId, token, setupSocketChat]);

  const handleSend = () => {
    if (!inputMsg.trim() || isSending) return;
    setIsSending(true);
    sendMessage(inputMsg);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Chỉ scroll xuống khi mình gửi tin nhắn (isMine)
  const prevMessagesLength = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender_id === myId) {
        scrollToBottom();
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, myId]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchUsersWithProfiles = async () => {
      setLoading(true);
      try {
        const idsList = await getListChat(); // giả sử trả về mảng ['1', '2', '3']
        // ids có thể là data.data tùy API trả về
        const ids = idsList.data

        if (!Array.isArray(ids)) {
          console.error("Invalid data format from getListChat");
          setUsers([]);
          setLoading(false);
          return;
        }

        // Gọi getOtherProfile cho từng id
        const usersData = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await getOtherProfile(id);
              console.log(res)
              if (res && res.status) {
                return {
                  id,
                  name: res.data.username,
                  avatar: res.data.profileImage,
                };
              } else {
                return { id, name: "Unknown", avatar: null };
              }
            } catch (error) {
              console.error(`Failed to get profile for id ${id}:`, error);
              return { id, name: "Error", avatar: null };
            }
          })
        );

        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch chat users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithProfiles();
  }, []);

  return (
    <div className="chat-layout">
      {/* ChatList bên trái */}
      <div className="chat-list-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ChatList users={users} />
        )}
      </div>

      {/* ChatWindow bên phải */}
      <div className="chat-window-container">
        <ChatWindow
          messages={messages}
          myId={myId}
          inputMsg={inputMsg}
          setInputMsg={setInputMsg}
          handleSend={handleSend}
          isSending={isSending}

        />
      </div>
    </div>
  );

}
