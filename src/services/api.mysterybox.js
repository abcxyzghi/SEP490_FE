import { toast } from "react-toastify"

import { apiWithFallback } from '../config/axios';

//this api using to get all of the mysterybox that have in the system for collector
export const getAllMysteryBoxes = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/MangaBox/get-all-mystery-box",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching mystery boxes");
    return null;
  }
};
//this api using for getting the detial of the mysterybox 
export const getMysteryBoxDetail = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/MangaBox/get-mystery-box-detail/${id}`,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching box detail");
    return null;
  }
};

// Buy mystery box API call
export const buyMysteryBox = async ({ mangaBoxId, quantity }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/MangaBox/buy-mystery-box",
      data: { mangaBoxId, quantity },
      requiresAuth: true, // ← gắn token tự động
    });

    return response.data;
  } catch (error) {
    const backendError = error.response?.data || {
      status: false,
      error: "Unexpected error occurred.",
      errorCode: 500,
    };
    toast.error(backendError.error || "Error buying product on sale");
    return backendError;
  }
};

export const createNewMysteryBox = async (formData) => {
  try {
    // Debugging: Log FormData content before API call
    console.log('FormData content:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await apiWithFallback({
      method: "post",
      url: "/api/MangaBox/create-new-box",
      data: formData,
      requiresAuth: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('API Response:', response); // Debugging API response
    return response.data;
  } catch (error) {
    console.error('Error creating new mystery box:', error); // Log error details
    toast.error(error.response?.data?.error || "Error creating new mystery box");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    }
  }
};


export const addProductForBox = async (boxId, products) => {
  console.log("📦 boxId:", boxId);
  console.log("📦 formattedProducts:", products);

  try {
    const formattedProducts = products.map(product => {
      const rawChance = typeof product.chance === "string"
        ? product.chance.replace(",", ".")
        : product.chance;

      const parsedChance = Number(rawChance);
      return {
        productId: product.productId,
        chance: isNaN(parsedChance) ? 0 : parsedChance,
      };
    });
    const response = await apiWithFallback({
      method: "post",
      url: "/api/MangaBox/add-product-for-box",
      params: { boxId }, // Đây là query string chứ không phải body
      data: formattedProducts, // body là mảng, không phải { boxId, products }
      requiresAuth: true,
    });

    if (!response || !response.status) {
      console.error("API failed:", response);
      console.log("✅ API Response:", response);
    }
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error adding products to box");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    }
  }
};

