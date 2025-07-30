import axios from "axios";
import { apiWithFallback } from '../config/axios';

//api using for add to cart
export const addToCart = async ({ sellProductId, mangaBoxId, quantity = 1 }) => {
  try {
    const params = {};
    if (sellProductId) params.SellProductId = sellProductId;
    if (mangaBoxId) params.MangaBoxId = mangaBoxId;
    params.Quantity = quantity;

    const response = await apiWithFallback({
      method: "post",
      url: "/api/Cart/add-to-cart",
      params,
      requiresAuth: true, // Cho phép interceptor gắn token tự động nếu dùng flag này
    });

    return response.data;
  } catch (error) {
    console.error("Add to cart failed:", error);
    throw error;
  }
};

//api using for user can view their cart after they add product or mysterybox successfully
export const viewCart = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Cart/view-cart",
      requiresAuth: true, // Cho phép interceptor gắn token tự động
    });

    return response.data;
  } catch (error) {
    console.error("View cart failed:", error);
    throw error;
  }
};

//api using for user can remove product or mysterybox from their cart if they not wish to buy anymore
export const removeFromCart = async ({ sellProductId, mangaBoxId }) => {
  try {
    const params = {};
    if (sellProductId) params.sellProductId = sellProductId;
    if (mangaBoxId) params.mangaBoxId = mangaBoxId;

    const response = await apiWithFallback({
      method: "delete",
      url: "/api/Cart/remove-from-cart",
      params,
      requiresAuth: true, // Tự động gắn token từ interceptor
    });

    return response.data;
  } catch (error) {
    console.error("Remove from cart failed:", error);
    throw error;
  }
};


// api for clearing the cart product or box cart
export const clearAllCart = async (type) => {
  try {
    const response = await apiWithFallback({
      method: "delete",
      url: "/api/Cart/clear-all-cart",
      params: type ? { type } : {},
      requiresAuth: true, // tự động gắn Bearer token
    });

    return response.data;
  } catch (error) {
    console.error("Clear all cart failed:", error);
    throw error;
  }
};

//api using for update quantity of product or mysterybox in cart
export const updateCartQuantity = async ({ Id, quantity }) => {
  try {
    const response = await apiWithFallback({
      method: "put",
      url: "/api/Cart/update-quantity",
      data: { Id, quantity },
      requiresAuth: true, // Tự động gắn token
    });

    return response.data;
  } catch (error) {
    console.error("Update cart quantity failed:", error);
    throw error;
  }
};
