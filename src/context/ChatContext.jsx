import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { connectWebSocket, disconnectWebSocket, getWebSocketStatus, sendMessage, updateWebSocketHandlers } from "../config/socket";
import { PATH_NAME } from "../router/Pathname";
import { createConversationsByUserId, getMessages, getUserInChat } from "../services/api.chat";
import { getListChat, getOtherProfile } from "../services/api.user";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

function isValidDate(date) {
  const d = new Date(date);
  return date && !isNaN(d.getTime());
}

export const ChatProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const myId = user?.user_id;
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);

  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const chatEndRef = useRef(null);
  const receivedMessageIds = useRef(new Set());
  const hasConnected = useRef(false);
  const activeConversations = useRef(new Set());
  const hasFetchedMessages = useRef(false);

  const getChatIdFromUrl = useCallback(() => {
    const path = location.pathname;
    const prefix = PATH_NAME.CHAT_ROOM.replace("/*", "");
    const tempId = path.startsWith(prefix) ? path.slice(prefix.length) : "";
    if (tempId && tempId !== '*') {
      return tempId.replace("/", "");
    }
    return null;
  }, [location.pathname]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;

    try {
      const response = await getUserInChat();
      const allConversations = response?.data?.flat() || [];
      setConversations(allConversations);
      return allConversations;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      return [];
    }
  }, [token]);

  const fetchChatUsers = useCallback(async () => {
    if (!token) return [];

    setLoading(true);
    try {
      const idsList = await getListChat();
      const ids = idsList.data;

      if (!Array.isArray(ids)) {
        setChatUsers([]);
        return [];
      }

      const usersData = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await getOtherProfile(id);
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
            return { id, name: "Error", avatar: null };
          }
        })
      );

      setChatUsers(usersData);
      return usersData;
    } catch (error) {
      setChatUsers([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (convId) => {
    if (!convId || !token) return;

    setLoading(true);
    try {
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
          : `${msg.sender_id}-${msg.content}-${new Date(msg.created_at).getTime()}`;
        receivedMessageIds.current.add(key);
      });

      hasFetchedMessages.current = true;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPartnerProfile = useCallback(async (userId) => {
    if (!userId || !token) return;

    try {
      const res = await getOtherProfile(userId);
      if (res && res.status) {
        setPartnerProfile(res.data);
        return res.data;
      }
    } catch (err) {
      console.error("Failed to fetch partner profile:", err);
    }
    return null;
  }, [token]);

  const setupSocketChat = useCallback(() => {
    if (!conversationId || !myId || !token) return;

    try {
      const wsStatus = getWebSocketStatus();

      if (wsStatus.isConnected && wsStatus.currentConversation === conversationId) {
        updateWebSocketHandlers({
          message: handleIncomingMessage,
          open: () => setStatus(`Connected with ${partnerProfile?.username || "user"}`),
          close: () => setStatus("Disconnected"),
          error: (err) => {
            console.error("WebSocket error:", err);
            setStatus("WebSocket Error");
          }
        });

        setStatus(`Connected with ${partnerProfile?.username || "user"}`);
        hasConnected.current = true;
        activeConversations.current.add(conversationId);
        return;
      }

      activeConversations.current.add(conversationId);

      connectWebSocket(
        conversationId,
        myId,
        token,
        handleIncomingMessage,
        () => setStatus(`Connected with ${partnerProfile?.username || "user"}`),
        () => setStatus("Disconnected"),
        (err) => {
          console.error("WebSocket error:", err);
          setStatus("WebSocket Error");
        }
      );

      hasConnected.current = true;
    } catch (err) {
      console.error("Error setting up chat:", err);
      setStatus("Error loading data");
    }
  }, [conversationId, myId, token, partnerProfile]);

  const handleIncomingMessage = useCallback((data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      parsed.created_at = isValidDate(parsed.created_at)
        ? parsed.created_at
        : new Date().toISOString();

      const key = parsed._id
        ? parsed._id
        : `${parsed.sender_id}-${parsed.content}-${new Date(
          parsed.created_at
        ).getTime()}`;

      if (!receivedMessageIds.current.has(key)) {
        receivedMessageIds.current.add(key);
        setMessages((prev) => [...prev, parsed]);

        if (parsed.sender_id === myId) {
          setInputMsg("");
          setIsSending(false);
        }
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  }, [myId]);

  const handleSendMessage = useCallback(() => {
    if (!inputMsg.trim() || isSending || !conversationId) return;

    setIsSending(true);
    sendMessage(inputMsg);
  }, [inputMsg, isSending, conversationId]);

  const selectUser = useCallback(async (userId) => {
    if (!userId || !myId || !token) return;

    try {
      let currentConversations = conversations;
      if (currentConversations.length === 0) {
        currentConversations = await getUserInChat();
        currentConversations = currentConversations?.data?.flat() || [];
      }

      let convId = null;
      const existingConv = currentConversations.find(
        (conv) =>
          (conv.participant_1 === myId && conv.participant_2 === userId) ||
          (conv.participant_2 === myId && conv.participant_1 === userId)
      );

      if (existingConv) {
        convId = existingConv._id;
      } else {
        try {
          const createResponse = await createConversationsByUserId(userId);
          convId = createResponse?.data?._id;
        } catch (error) {
          console.error("Failed to create conversation:", error);
        }
      }

      if (!convId) {
        return;
      }
      setMessages([]);
      receivedMessageIds.current = new Set();

      setConversationId(convId);
      await fetchPartnerProfile(userId);
      hasFetchedMessages.current = false;
      await fetchMessages(convId);
    } catch (err) {
      console.error("Error in selectUser:", err);
    }
  }, [myId, token, conversations, fetchPartnerProfile, fetchMessages]);

  const directSelectChat = useCallback((userId) => {
    if (!userId || userId === selectedUserId) return;
    const newPath = PATH_NAME.CHAT_ROOM.replace('*', `${userId}`);
    window.history.pushState({ userId }, "", newPath);
    setSelectedUserId(userId);
  }, [selectedUserId]);

  const navigateToChat = directSelectChat;
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const initializeChat = async () => {
      try {
        const response = await getUserInChat();
        if (!isMounted) return;

        const allConversations = response?.data?.flat() || [];
        setConversations(allConversations);

        const idsList = await getListChat();
        if (!isMounted) return;

        const ids = idsList.data;
        if (Array.isArray(ids)) {
          const usersPromises = ids.map(async (id) => {
            try {
              const res = await getOtherProfile(id);
              if (res && res.status) {
                return {
                  id,
                  name: res.data.username,
                  avatar: res.data.profileImage,
                };
              }
              return { id, name: "Unknown", avatar: null };
            } catch (error) {
              return { id, name: "Error", avatar: null };
            }
          });

          const usersData = await Promise.all(usersPromises);
          if (isMounted) {
            setChatUsers(usersData);
          }
        }

        if (!isMounted) return;

        const urlUserId = getChatIdFromUrl();
        if (urlUserId && urlUserId !== selectedUserId) {
          setSelectedUserId(urlUserId);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
      disconnectWebSocket();
      hasConnected.current = false;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const urlUserId = getChatIdFromUrl();
      if (urlUserId && urlUserId !== selectedUserId) {
        setSelectedUserId(urlUserId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getChatIdFromUrl, selectedUserId]);

  useEffect(() => {
    if (selectedUserId && myId && token) {
      const runSelectUser = async () => {
        try {
          await selectUser(selectedUserId);
        } catch (error) {
          console.error("Error selecting user:", error);
        }
      };

      runSelectUser();
    }
  }, [selectedUserId, myId, token]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchConversationMessages = async () => {
      setMessages([]);
      receivedMessageIds.current = new Set();
      hasFetchedMessages.current = false;

      try {
        const msgRes = await getMessages(conversationId, 0, 50);
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
            : `${msg.sender_id}-${msg.content}-${new Date(msg.created_at).getTime()}`;
          receivedMessageIds.current.add(key);
        });
        hasFetchedMessages.current = true;
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchConversationMessages();
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && myId && token) {
      setupSocketChat();
      return;
    }

    return () => {
    };
  }, [conversationId, myId, token, setupSocketChat]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const contextValue = {
    messages,
    conversations,
    chatUsers,
    selectedUserId,
    conversationId,
    partnerProfile,
    inputMsg,
    isSending,
    loading,
    status,
    myId,
    chatEndRef,
    setInputMsg,
    handleSendMessage,
    selectUser,
    directSelectChat,
    navigateToChat,
    fetchMessages,
    fetchConversations,
    fetchChatUsers,
    getChatIdFromUrl,
    scrollToBottom,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
