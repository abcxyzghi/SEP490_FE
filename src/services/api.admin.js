import { apiWithFallback } from "../config/axios";

// Fetch all users (GET)
export const getAllUsers = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/py/api/admin/user",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Fetch user list failed:", error);
    throw error;
  }
};

// Fetch all moderators (GET)
export const getAllModerators = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/py/api/admin/moderator",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Fetch moderator list failed:", error);
    throw error;
  }
};

// Promote user to moderator (PATCH)
export const promoteToModerator = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/py/api/admin/moderator/promote",
      params: { user_id: userId },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Promote to moderator failed:", error);
    throw error;
  }
};

// Demote moderator to user (PATCH)
export const demoteModerator = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/py/api/adminmoderator/demote",
      params: { user_id: userId },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Demote moderator failed:", error);
    throw error;
  }
};

// Toggle ban/unban user (PATCH)
export const toggleUserActivation = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/py/api/admin/user/tooggle-activation",
      params: { user_id: userId },
      requiresAuth: true,
    });
    // response.data: [true] (unban), [false] (ban)
    return response.data;
  } catch (error) {
    console.error("Toggle user activation failed:", error);
    throw error;
  }
};

// Get revenue (GET)
// filter: 'all' | 'day' | 'month' | 'year'
export const getRevenue = async (filter = "all") => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/py/api/admin/revenue",
      params: { filter },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Fetch revenue failed:", error);
    throw error;
  }
};

// Get revenue fee (GET)
// filter: 'all' | 'day' | 'month' | 'year'
export const getRevenueFee = async (filter = "all") => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/py/api/admin/revenue-fee",
      params: { filter },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Fetch revenue fee failed:", error);
    throw error;
  }
};

// Approve or reject auction (PATCH)
// status: 1 (approve), 0 (reject)
export const approveAuction = async (auctionId, status) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/py/api/admin/auction/approval",
      params: { auction_id: auctionId, status },
      requiresAuth: true,
    });
    // Only return success and error
    return { success: response.data.success, error: response.data.error };
  } catch (error) {
    console.error("Auction approval failed:", error);
    throw error;
  }
};
