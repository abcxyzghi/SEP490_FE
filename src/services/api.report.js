import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";

export const getAllReport = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Report/get-all-report",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};

export const updateStatusReport = async (reportId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/api/Report/update-report",
      params: { reportId },
      requiresAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error creating collection");
    return null;
  }
};