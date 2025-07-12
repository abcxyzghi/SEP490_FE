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


