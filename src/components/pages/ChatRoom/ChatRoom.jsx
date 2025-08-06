import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-2">Phòng Chat</h2>
      <div className="text-sm text-gray-600 mb-3">{status}</div>

      <div className="w-full max-w-xl flex-1 overflow-y-auto bg-white rounded shadow p-4 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400">Chưa có tin nhắn nào.</p>
        )}
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === myId;
          return (
            <div
              key={msg._id || idx}
              className={`mb-3 p-2 rounded max-w-[70%] ${
                isMine
                  ? "bg-blue-500 text-white ml-auto text-right"
                  : "bg-gray-200 text-black"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs text-gray-300 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>

      <div className="w-full max-w-xl flex">
        <input
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border border-gray-300 rounded-l"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          className={`bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 ${
            isSending ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={isSending}
        >
          {isSending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
