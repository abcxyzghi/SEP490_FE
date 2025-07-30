import axios from "../config/axios";
import { apiWithFallback } from '../config/axios';

//this api is using for get the request you send to other collector for exchange product
export const getBuyer = async () => {
  const response = await apiWithFallback({
    method: "get",
    url: "/api/Exchange/exchange-request-buyer",
    requiresAuth: true, // bắt buộc để interceptor tự gắn token
  });
  return response.data;
};

//this api is using for get the request that you recived by other collector for exchange
export const getReceive = async () => {
  const response = await apiWithFallback({
    method: "get",
    url: "/api/Exchange/with-products/by-receive",
    requiresAuth: true, // interceptor sẽ tự gắn token
  });
  return response.data;
};

// // Call POST API to create an exchange sender
// export const createExchangeSender = async (data) => {
//   const response = await axios.post('https://mmb-be-dotnet.onrender.com/api/Exchange/sender/create', data);
//   return response.data;
// };

//get the collection of your profile in order to exchange
export const getCollectionOfProfile = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserCollection/get-all-collection-of-profile",
      requiresAuth: true, // để interceptor tự gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách collection:", error);
    throw error;
  }
};

//get all of the products in your collection to exchange with other collector
export const getAllProductsOfCollection = async (collectionId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserProduct/get-all-product-of-user-collection",
      params: { collectionId },
      requiresAuth: true, // tự động gắn token
    });

    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm cho collectionId ${collectionId}:`, error);
    throw error;
  }
};

//function for exchange product
export const exchangeProduct = async (payload) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Exchange/sender/create",
      data: payload,
      requiresAuth: true, // để interceptor tự gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu trao đổi:", error);
    throw error;
  }
};

//api using for collector accept the request of other collector
export const ExchangeAccept = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: `/api/Exchange/sender/accept/${id}`,
      requiresAuth: true, // tự động gắn token trong header
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi chấp nhận yêu cầu trao đổi với id ${id}:`, error);
    throw error;
  }
};

//api using for collector reject collector request
export const ExchangeReject = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: `/api/Exchange/reject/${id}`,
      requiresAuth: true, // để interceptor tự động gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi từ chối yêu cầu trao đổi với id ${id}:`, error);
    throw error;
  }
};

//api using for you to cancel the request if you feel don't want to exchange with other
export const ExchangeCancel = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: `/api/Exchange/recipient/cancel/${id}`,
      requiresAuth: true, // Gắn token từ interceptor
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy yêu cầu trao đổi với id ${id}:`, error);
    throw error;
  }
};