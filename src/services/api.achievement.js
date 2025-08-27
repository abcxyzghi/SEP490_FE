import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";

export const getAchievementDetail = async (collectionId) => {
    console.log("Fetching achievement detail for collection ID:", collectionId);
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Achievement/get-achievement-with-reward-of-collection`,
      params: { collectionId }
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching box detail");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
};

export const createAchievement = async (collectionId,name_Achievement) => {
  try {
    console.log("Creating achievement for collection:", collectionId, name_Achievement);
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Achievement/Create-achievement-of-collection",
      params:{
        collectionId,
        name_Achievement
      },
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
export const createRewardOfAchievement = async (collectionId, conditions, file, quantityBox) => {
  try {
    const formData = new FormData();
    formData.append("Conditions", conditions);
    formData.append("Url_image", file); // file: File object
    formData.append("Quantity_box", quantityBox);

    const response = await apiWithFallback({
      method: "post",
      url: "/api/Achievement/Create-reward-of-achivement",
      params: {
        collectionId
      },
      data: formData,
      requiresAuth: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error creating reward");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
};
