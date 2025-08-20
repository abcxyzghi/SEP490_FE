import { apiWithFallback } from "../config/axios"; 

export const getallmedalofuser = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserAchievement/get-all-medal-of-user",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch medal list false:", error);
    throw error;
  }
}; 

export const getpublicmedalofuser = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserAchievement/get-all-medal-public-of-user",
      params: { userId: id },
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch public medal list failed:", error);
    throw error;
  }
}; 

export const updateStatusAuction = async (userRewardId) => {
try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/UserAchievement/private-or-public-medal-of-user`,
      params: { userRewardId },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Update status medal failed:", error);
    return null;
  }
}
export const getUserCollectionProgress = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/cs/api/UserAchievement/get-user-collection-completion-achievement-progress",
      // params: { userCollectionId },
      requiresAuth: true, // nếu API yêu cầu authentication
    });

    return response.data;
  } catch (error) {
    console.error("Fetch user collection progress failed:", error);
    throw error;
  }
};