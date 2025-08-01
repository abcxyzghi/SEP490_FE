import { pythonApiWithFallback } from "../config/axios";


export const getUserInChat = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/py/api/chatbox/conversation/me",
      requiresAuth: true, 
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getUserInChat:", error);
    throw error;
  }
};

export const getMessages = async (conversationId, skip = 0, limit = 10) => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/py/api/chatbox/messages",
      params: {
        id: conversationId,
        skip,
        limit,
      },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getMessages:", error);
    throw error;
  }
};

export const createConversationsByUserId = async (userId) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/py/api/chatbox/conversation/${userId}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getConversationsByUserId:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/py/api/chatboxconversation/user/${userId}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getUserById:", error);
    throw error;
  }
};