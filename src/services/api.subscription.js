import { apiWithFallback } from "../config/axios";

export const getFollowers = async (myUserId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Subscription/subscription/get-all-followers`,
      params: { myUserId },
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy followers:", error);
    throw error;
  }
};


export const getFollowing = async (myUserId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Subscription/subscription/get-all-following`,
      params: { myUserId },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy following:", error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Subscription/subscription/add-follower",
      data: { userId },
      requiresAuth: true, // đảm bảo token được đính kèm
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi follow user:", error);
    throw error;
  }
};
export const unfollowUser = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "delete",
      url: "/api/Subscription/subscription/unfollow",
      params: { userId },
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi unfollow user:", error);
    throw error;
  }
};
