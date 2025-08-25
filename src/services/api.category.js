import { apiWithFallback } from "../config/axios";

export const getCatergory = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Collection/get-all-collection",
      requiresAuth: true, 
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi getCatergory:", error);
    throw error;
  }
};