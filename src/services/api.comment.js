import { toast } from "react-toastify";
import api from "../config/axios";

export const getAllCommentsBySellProduct = async (sellProductId) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/Comment/get-all-comment-by-sellproduct/${sellProductId}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching comments");
    return null;
  }
};

export const getAllRatingsBySellProduct = async (sellProductId) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/Comment/get-all-rating-by-sellproduct/${sellProductId}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching ratings");
    return null;
  }
};
