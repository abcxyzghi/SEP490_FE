import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";

export const getAllCollection = async () => {
    try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Collection/get-all-collection",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
}
export const createCollection = async (collectionName) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Collection/crete-new-collection",
      data: JSON.stringify(collectionName),
      requiresAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error creating collection");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
};