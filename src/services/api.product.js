import { toast } from "react-toastify"
import api from "../config/axios"
import { apiWithFallback } from "../config/axios";
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

export const getProductOnSaleDetail = async (id) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/SellProduct/get-product-on-sale/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching product detail");
    return null;
  }
}

// Buy product on sale API call
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


export const getCollectionDetail = async (id) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/Product/get-product/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching product detail");
    return null;
  }
}

// Create rating only API call
export const createRatingOnly = async ({ sellProductId, rating }) => {
  try {
    const response = await api.post(
      'https://mmb-be-dotnet.onrender.com/api/Comment/create-rating-only',
      { sellProductId, rating }
    );
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error creating rating');
    return null;
  }
};