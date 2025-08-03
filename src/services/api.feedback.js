import { toast } from "react-toastify";
import { apiWithFallback } from '../config/axios';

export const getFeedbackOfSellProduct = async (sellProductID) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/cs/api/Feedback/Get-feedback-of-sell-product`,
      params: { sellProductID },
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy feedback sản phẩm:", error);
    throw error;
  }
};
export const createFeedback = async ({ Exchange_infoId, Content, Rating }) => {
  try {
    console.log("[createFeedback] Bắt đầu gửi feedback với dữ liệu:", {
      Exchange_infoId,
      Content,
      Rating
    });

    const formData = new FormData();
    formData.append("Exchange_infoId", Exchange_infoId);
    formData.append("Content", Content);
    formData.append("Rating", Rating);

    console.log("[createFeedback] FormData đã tạo:", 
      [...formData.entries()] // hiển thị các cặp key-value trong formData
    );

    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/Feedback/Create-feedback",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requiresAuth: true, // interceptor sẽ tự gắn token
    });

    console.log("✅ [createFeedback] API trả về:", response);

    return response.data;
  } catch (error) {
    console.error("❌ [createFeedback] Lỗi khi tạo feedback:", error);

    // hiện thông báo lỗi từ backend nếu có
    toast.error(error.response?.data?.error || "Lỗi khi gửi feedback");

    throw error;
  }
};
