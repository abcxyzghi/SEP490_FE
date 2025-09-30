import { apiWithFallback } from '../config/axios'; 

export const getFavoriteList = async () => {
  const response = await apiWithFallback({
    method: "get",
    url: "/api/ProductFavorite/get-all-product-favorite",
    requiresAuth: true, // bắt buộc để interceptor tự gắn token
  });
  return response.data;
}; 

export const addFavourite = async (userProductId) => {
  try {
    console.log(userProductId)
    const requestConfig = {
      method: "post",
      url: `/api/ProductFavorite/add-product-favorite`,
      params: { userProductId },
      requiresAuth: true, // để interceptor tự gắn token
    };

    console.log("📡 addFavourite request:", requestConfig);

    const response = await apiWithFallback(requestConfig);

    console.log("✅ addFavourite response:", response);

    return response.data;
  } catch (error) {
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
};
export const removeFavourite = async (favoriteId) => {
  const response = await apiWithFallback({
    method: "delete",
    url: `/cs/api/ProductFavorite/remove-favorite-product`,
    params: { favoriteId }, // gửi query string ?favoriteId=...
    requiresAuth: true, // interceptor tự gắn token
  });
  return response.data;
};
export const getFavoriteImages = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/cs/api/ProductFavorite/get-image-product-favorite",
      requiresAuth: true, // nếu API yêu cầu authentication
    });

    return response.data;
  } catch (error) {
    console.error("Fetch favorite product images failed:", error);
    throw error;
  }
};
