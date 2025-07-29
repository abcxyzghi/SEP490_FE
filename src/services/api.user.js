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
  const response = await axios.post('https://mmb-be-dotnet.onrender.com/cs/api/Report/create-report', {
    sellProductId,
    sellerId,
    title,
    content
  });

  return response.data;
}; 

//this api is using for change password of an user
export const ChangePassword = async ({ userId, curentPassword, newPassword, confirmPassword }) => {
  const response = await axios.put('https://mmb-be-dotnet.onrender.com/cs/api/User/profile/change-password', {
    userId,
    curentPassword,
    newPassword,
    confirmPassword
  });
  return response.data;
}; 


//this api is using for updating user profile
export const updateProfile = async (data, isFormData = false) => {
  try {
    let config = {};
    let body = data;

    if (!isFormData) {
      body = {
        urlImage: data.urlImage,
        phoneNumber: data.phoneNumber,
        accountBankName: data.accountBankName,
        bankNumber: data.bankNumber,
        bankid: data.bankid
      };
    }

 
    const response = await axios.post(
      'https://mmb-be-dotnet.onrender.com/cs/api/User/profile/update-profile',
      body,
      config
    );

   
    return response;
  } catch (error) {
    // 👇 Log error
    console.error('[updateProfile] Error:', error);

    if (error.response) {
      console.error('[updateProfile] Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    throw error;
  }
};

//this api is using for get your own profile
export const getBankID= async () => {
  const response = await axios.get('https://api.vietqr.io/v2/banks');
  return response.data;
};
