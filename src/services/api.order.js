import { toast } from "react-toastify";
import { apiWithFallback } from '../config/axios';

//this api is using to get the user order they have bought in the past
export const getOrderHistory = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/OrderHistory",
      requiresAuth: true, // sẽ tự động gắn Bearer token
    });

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
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Report/get-all-report-of-user",
      requiresAuth: true, // để tự động gắn Bearer token
    });

    if (response.data?.status) {
      return response.data.data;
    } else {
      toast.error("Failed to fetch user report");
      return [];
    }
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching user report");
    return null;
  }
};

//this api will get the transaction that user have made such as top up money or draw out money
export const getTransaction = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/TransactionHistory/transaction-history",
      requiresAuth: true,
    });

    if (response.data?.status) {
      return response.data.data;
    } else {
      toast.error("Failed to fetch transaction history");
      return [];
    }
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching transaction history");
    return null;
  }
};

