import { toast } from "react-toastify";
import api from "../config/axios";

export const getOrderHistory = async () => {
  try {
     const token = localStorage.getItem("token");
    const response = await api.get(
      "https://mmb-be-dotnet.onrender.com/api/OrderHistory",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data && response.data.status) {
      return response.data.data;
    } else {
      toast.error("Failed to fetch order history");
      return [];
    }
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching order history");
    return null;
  }
};

