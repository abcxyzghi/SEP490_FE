import { toast } from "react-toastify";
import api from "../config/axios";

//this api is using to get the user order they have bought in the past
export const getOrderHistory = async () => {
  try {
     const token = localStorage.getItem("token");
    const response = await api.get(
      "https://mmb-be-dotnet.onrender.com/cs/api/OrderHistory",
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

//this api allow collector to get all of the report that they have send to the system
export const getReportofUser = async () => {
  try {
     const token = localStorage.getItem("token");
    const response = await api.get(
      "https://mmb-be-dotnet.onrender.com/cs/api/Report/get-all-report-of-user",
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

//this api will get the transaction that user have made such as top up money or draw out money
export const getTransaction = async () => {
  try {
     const token = localStorage.getItem("token");
    const response = await api.get(
      "https://mmb-be-dotnet.onrender.com/cs/api/TransactionHistory/transaction-history",
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
