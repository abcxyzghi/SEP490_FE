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
