import axios from "../config/axios";

//this api is using for get the request you send to other collector for exchange product
export const getBuyer = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/exchange-request-buyer');
  return response.data;
};

//this api is using for get the request that you recived by other collector for exchange
export const getReceive= async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/with-products/by-receive');
  return response.data;
};

// // Call POST API to create an exchange sender
// export const createExchangeSender = async (data) => {
//   const response = await axios.post('https://mmb-be-dotnet.onrender.com/cs/api/Exchange/sender/create', data);
//   return response.data;
// };

//get the collection of your profile in order to exchange
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
//get all of the products in your collection to exchange with other collector
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

//function for exchange product
export const exchangeProduct = async (payload) => {
  try {
    console.log(payload)
    const response = await axios.post(
      "https://mmb-be-dotnet.onrender.com/cs/api/Exchange/sender/create",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu trao đổi:", error);
    throw error;
  }
};

//api using for collector accept the request of other collector
export const ExchangeAccept = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/Exchange/sender/accept/${id}`);
  return response.data;
};

//api using for collector reject collector request
export const ExchangeReject = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/Exchange/reject/${id}`);
  return response.data;
};

//api using for you to cancel the request if you feel don't want to exchange with other
export const ExchangeCancel = async (id) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/cs/api/Exchange/recipient/cancel/${id}`);
  return response.data;
};