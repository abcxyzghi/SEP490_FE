import axios from "../config/axios";

export const getBuyer = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/exchange-request-buyer');
  return response.data;
};

export const getReceive= async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/with-products/by-receive');
  return response.data;
};

// Call POST API to create an exchange sender
export const createExchangeSender = async (data) => {
  const response = await axios.post('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/sender/create', data);
  return response.data;
};


export const getCollectionOfProfile = async () => {
  try {
    const response = await axios.get(
      "https://mmb-be-dotnet.onrender.com/cs/api/UserCollection/get-all-collection-of-profile"
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách collection:", error);
    throw error; // hoặc return null / một thông báo tùy cách bạn xử lý phía FE
  }
};
export const getAllProductsOfCollection = async (collectionId) => {
  try {
    const response = await axios.get(
      `https://mmb-be-dotnet.onrender.com/cs/api/UserProduct/get-all-product-of-user-collection`,
      {
        params: { collectionId },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm cho collectionId ${collectionId}:`, error);
    throw error;
  }
};
export const exchangeProduct = async (payload) => {
  try {
    console.log(payload)
    const response = await axios.post(
      "https://mmb-be-dotnet.onrender.com/cs/api/Exchange/sender/create", // 🔁 sửa endpoint nếu cần
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu trao đổi:", error);
    throw error;
  }
};

export const ExchangeAccept = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/sender/accept/${id}`);
  return response.data;
};

export const ExchangeReject = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/sender/reject/${id}`);
  return response.data;
};

export const ExchangeCancel = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/recipient/cancel/${id}`);
  return response.data;
};