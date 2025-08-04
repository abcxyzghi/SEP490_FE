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