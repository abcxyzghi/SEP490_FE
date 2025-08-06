import { apiWithFallback } from "../config/axios";

export const getFollowers = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/cs/api/Subscription/subscription/Get-all-followers`,
      params:null,
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy get follower:", error);
    throw error;
  }
};
export const getFollowing = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/cs/api/Subscription/subscription/Get-all-following`,
      params:null,
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi theo dõi:", error);
    throw error;
  }
};
export const followUser = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/Subscription/subscription/add-follower",
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
      url: "/cs/api/Subscription/subscription/unfollow",
      params: { userId },
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi unfollow user:", error);
    throw error;
  }
};
