import { toast } from "react-toastify"
import api from "../config/axios"
import { apiWithFallback } from "../config/axios";
import axios from "axios";
// export const getProduct = async () => {
//    try{
//     const response = await api.get("product")
//     return response.data;
//    }catch(error){
//     toast.error(error.response.data)
//    }
// }

// export const createProduct = async (product) => {
//     try{
//      const response = await api.post("product", product)
//      return response.data;
//     }catch(error){
//      toast.error(error.response.data)
//     }
//  }

// export const updateProduct = async ({id,product}) => {
//    try{
//    const response = await api.put(`product/${id}`, product);
//    return response.data;
//    }catch(error){
//    toast.error(error.response.data)
//    }
// };

// export const deleteProduct = async (id) => {
//    try{
//    const response = await api.delete(`product/${id}`);
//    return response.data;
//    }catch(error){
//    toast.error(error.response.data);
//    return null;
//    }
// };

// export const getAllProductsOnSale = async () => {
//   try {
//     const response = await api.get("/api/SellProduct/get-all-product-on-sale");
//     return response.data;
//   } catch (error) {
//     toast.error(error.response?.data?.error || "Error fetching products on sale");
//     return null;
//   }
// }

//api using for get all of product on sale
export const getAllProductsOnSale = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/SellProduct/get-all-product-on-sale",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
}

//api using for get product on sale detail
export const getProductOnSaleDetail = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/SellProduct/get-product-on-sale/${id}`,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching product detail");
    return null;
  }
}

// This api is for Buy product on sale
export const buyProductOnSale = async ({ sellProductId, quantity }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post(
      "https://mmb-be-dotnet.onrender.com/api/SellProduct/buy-sell-product",
      { sellProductId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const backendError = error.response?.data || {
      status: false,
      error: "Unexpected error occurred.",
      errorCode: 500,
    };
    toast.error(backendError.error || "Error buying product on sale");    
    return backendError;
  }
};

//this api is using for get detail of an collection
export const getCollectionDetail = async (id) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/Product/get-product/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching product detail");
    return null;
  }
}

// // Create rating only API call
// export const createRatingOnly = async ({ sellProductId, rating }) => {
//   try {
//     const response = await api.post(
//       'https://mmb-be-dotnet.onrender.com/cs/api/Comment/create-rating-only',
//       { sellProductId, rating }
//     );
//     return response.data;
//   } catch (error) {
//     toast.error(error.response?.data?.error || 'Error creating rating');
//     return null;
//   }
// };

//this api using for changing the status of product for update
export const TurnOnOffProductOnSale = async (id) => {
   const token = localStorage.getItem("token");
  const response = await axios.put(
    `https://mmb-be-dotnet.onrender.com/cs/api/SellProduct/turn-on/off-sell-product?sellProductId=${id}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

//This api is use for update the sell product after they have turn to isSale === false
export const updateSellProduct = async ({ id, description, price, updatedAt }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.put(
      "https://mmb-be-dotnet.onrender.com/cs/api/SellProduct/update-sell-product",
      { id, description, price, updatedAt },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error updating sell product");
    return null;
  }
}; 