import axios from '../config/axios';

//this api is using for get your own profile
export const getProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/User/get-profile');
  return response.data;
};

//this api is using for getting other profile
export const getOtherProfile = async (id) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/User/get-other-profile?id=${id}`);
  return response.data;
};

//this api is using for getting product that user are currently selling
export const getAllProductOnSaleOfUser = async (userId) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/SellProduct/get-all-product-on-sale-of-user/${userId}`);
  return response.data;
};

//this api is using for get all collection of your profile
export const getAllCollectionOfProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/UserCollection/get-all-collection-of-profile');
  return response.data;
};

//this api is using for get all product in the collection of your profile
export const getAllProductOfUserCollection = async (collectionId) => {
  const response = await axios.get(`https://mmb-be-dotnet.onrender.com/api/UserProduct/get-all-product-of-user-collection?collectionId=${collectionId}`);
  return response.data;
};

//this api is using for get all box of an user they are owned
export const getAllBoxOfProfile = async () => {
  const response = await axios.get('https://mmb-be-dotnet.onrender.com/api/UserBox/get-all-box-of-profile');
  return response.data;
};

//this api is using for user can randomly open the mysterybox then recived the product in an randomly way
export const openUserBox = async (userBoxId) => {
  const response = await axios.post(`https://mmb-be-dotnet.onrender.com/api/UserBox/open-box/${userBoxId}`);
  return response.data;
};

// this api is Create sell product for collector
export const createSellProduct = async ({ userProductId, quantity, description, price }) => {
  const response = await axios.post('https://mmb-be-dotnet.onrender.com/api/SellProduct/create-sell-product', {
    UserProductId: userProductId,
    quantity,
    description,
    price
  });
  return response.data;
};

// this api is using for report seller and product
export const createReport = async ({ sellProductId, sellerId, title, content }) => {
  console.log("📤 createReport payload:", {
    sellProductId,
    sellerId,
    title,
    content
  });

  const response = await axios.post('https://mmb-be-dotnet.onrender.com/cs/api/Report/create-report', {
    sellProductId,
    sellerId,
    title,
    content
  });

  return response.data;
};
