import { toast } from "react-toastify";
import { apiWithFallback } from '../config/axios';

//get the comment by the product when ever user see
export const getAllCommentsBySellProduct = async (sellProductId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Comment/get-all-comment-by-sellproduct/${sellProductId}`,
    });

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching comments");
    return null;
  }
};

//get the rating of an product
export const getAllRatingsBySellProduct = async (sellProductId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Comment/get-all-rating-by-sellproduct/${sellProductId}`,
    });

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching ratings");
    return null;
  }
};

//write an comment on an product
export const createComment = async ({ sellProductId, content }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Comment/create-comment",
      data: { sellProductId, content },
      requiresAuth: true, // Tự động gắn Bearer token
    });

    return response.data;
  } catch (error) {
    console.log(error);
    toast.error(
      error.response?.data?.error || error.message || "Error creating comment"
    );
    return null;
  }
};


//api help user can rate the product they have bought for the first time
export const createRate = async ({ sellProductId, rating }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Comment/create-rating-only",
      data: { sellProductId, rating },
      requiresAuth: true, // tự gắn Bearer token nếu có
    });

    return response.data;
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.error || error.message || "Error creating rating");
    return null;
  }
};

//this api will get all the badwords then will be censor on the ui with looking like this '*****'
let badwordsCache = null;
let badwordsCacheTimestamp = null;
const BADWORDS_CACHE_TTL = 5 * 60 * 1000; // 5 phút

export const getAllBadwords = async () => {
  const now = Date.now();

  // Nếu còn hạn cache thì trả luôn
  if (badwordsCache && badwordsCacheTimestamp && (now - badwordsCacheTimestamp < BADWORDS_CACHE_TTL)) {
    return badwordsCache;
  }

  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Comment/get-all-badwords",
    });
    // Đảm bảo phản hồi hợp lệ mới cache

    if (response?.data.data && Array.isArray(response.data.data)) {
      badwordsCache = response.data.data;
      badwordsCacheTimestamp = now;
      return response.data.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching bad words:", error);
    toast.error(error.response?.data?.error || error.message || "Error fetching bad words");
    return badwordsCache || []; // fallback: trả về cache cũ nếu có
  }
};
