import { apiWithFallback } from "../config/axios";
import { toast } from "react-toastify"

export const getAllWithdrawTransactionRequest = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/TransactionHistory/withdraw-transaction-request",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching withdraw requests");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    }
  }
}

export const acceptWithdrawRequest = async (transactionId,transactionCode) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/api/TransactionHistory/accept-withdraw-transaction-request",
      params: { transactionId, transactionCode },
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    const backendError = error.response?.data || {
      status: false,
      error: "Unexpected error occurred.",
      errorCode: 500,
    };
    toast.error(backendError.error || "Error create withdraw request");
    return backendError;
  }
};
export const rejectWithdrawRequest = async (transactionId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: "/api/TransactionHistory/reject-withdraw-transaction-request",
      params: { transactionId },
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    const backendError = error.response?.data || {
      status: false,
      error: "Unexpected error occurred.",
      errorCode: 500,
    };
    toast.error(backendError.error || "Error reject withdraw request");
    return backendError;
  }
};
