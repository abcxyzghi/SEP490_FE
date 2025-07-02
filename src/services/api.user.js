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
