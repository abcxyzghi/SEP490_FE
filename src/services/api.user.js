import axios from '../config/axios';

export const getProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/User/get-profile');
  return response.data;
};

export const getOtherProfile = async (id) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/User/get-other-profile?id=${id}`);
  return response.data;
};

export const getAllProductOnSaleOfUser = async (userId) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/SellProduct/get-all-product-on-sale-of-user/${userId}`);
  return response.data;
};

export const getAllCollectionOfProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/UserCollection/get-all-collection-of-profile');
  return response.data;
};

export const getAllProductOfUserCollection = async (collectionId) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/UserProduct/get-all-product-of-user-collection?collectionId=${collectionId}`);
  return response.data;
};

export const getAllBoxOfProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/UserBox/get-all-box-of-profile');
  return response.data;
};

export const openUserBox = async (userBoxId) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/api/UserBox/open-box/${userBoxId}`);
  return response.data;
};

// Create sell product API
export const createSellProduct = async ({ userProductId, quantity, description, price }) => {
  const response = await axios.post('https://mmb-be-dotnet.onrender.com/api/SellProduct/create-sell-product', {
    UserProductId: userProductId,
    quantity,
    description,
    price
  });
  return response.data;
};

// Create report API
export const createReport = async ({ sellProductId, sellerId, title, content }) => {
  const response = await axios.post('https://mmb-be-dotnet.onrender.com/api/Report/create-report', {
    sellProductId,
    sellerId,
    title,
    content
  });
  return response.data;
};
