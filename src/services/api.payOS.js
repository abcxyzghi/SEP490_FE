import { apiWithFallback } from "../config/axios";

export const createPayment = async (items) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/PayOS/create-payment",
      data: {
        items, 
      },
      headers: {
        "Content-Type": "application/json",
        "mmb-dev-password": "toilaconchochihuahuacuamakima",
        accept: "text/plain",
      },
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo thanh toán:", error);
    throw error;
  }
};
