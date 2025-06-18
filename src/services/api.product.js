import { toast } from "react-toastify"
import api from "../config/axios"

export const getProduct = async () => {
   try{
    const response = await api.get("product")
    return response.data;
   }catch(error){
    toast.error(error.response.data)
   }
}

export const createProduct = async (product) => {
    try{
     const response = await api.post("product", product)
     return response.data;
    }catch(error){
     toast.error(error.response.data)
    }
 }

export const updateProduct = async ({id,product}) => {
   try{
   const response = await api.put(`product/${id}`, product);
   return response.data;
   }catch(error){
   toast.error(error.response.data)
   }
};

export const deleteProduct = async (id) => {
   try{
   const response = await api.delete(`product/${id}`);
   return response.data;
   }catch(error){
   toast.error(error.response.data);
   return null;
   }
};

export const getAllProductsOnSale = async () => {
  try {
    const response = await api.get("https://mmb-be-dotnet.onrender.com/api/SellProduct/get-all-product-on-sale");
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