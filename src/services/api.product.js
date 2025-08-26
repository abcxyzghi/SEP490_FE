import { toast } from "react-toastify";
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
    const response = await apiWithFallback({
      method: "get",
      url: `/api/SellProduct/get-product-on-sale/${id}`,
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
    const response = await apiWithFallback({
      method: "post",
      url: "/api/SellProduct/buy-sell-product",
      data: { sellProductId, quantity },
      requiresAuth: true, // tự động gắn token từ interceptor
    });

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
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Product/get-product/${id}`,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching product detail");
    return null;
  }
};

// // Create rating only API call
// export const createRatingOnly = async ({ sellProductId, rating }) => {
//   try {
//     const response = await api.post(
//       'https://mmb-be-dotnet.onrender.com/api/Comment/create-rating-only',
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
  try {
    const response = await apiWithFallback({
      method: "put",
      url: `/api/SellProduct/turn-on/off-sell-product`,
      params: { sellProductId: id },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Lỗi bật/tắt bán sản phẩm");
    return null;
  }
};

//This api is use for update the sell product after they have turn to isSale === false
export const updateSellProduct = async ({ id, description, price, updatedAt }) => {
  try {
    const response = await apiWithFallback({
      method: "put",
      url: "/api/SellProduct/update-sell-product",
      data: { id, description, price, updatedAt },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error updating sell product");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    }
  }
};
export const block_unblock_product = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/Product/block-unlock-product?id=${id}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error blocking/unblocking product");
    return null;
  }
};
export const getAllProduct = async () => {
try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Product/get-product",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};
export const createProduct = async (product) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Product/create-new-product-for-system",
      data: product,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error creating product");
    return null;
  }
};
export const cancelSellProduct = async (sellProductId) => {
  try {
    const response = await apiWithFallback({
      method: "patch", 
      url: "/api/SellProduct/cancel-sell-product",
      params: { sellProductId }, 
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
     toast.error(error.response?.data?.error || "Error remove product on sale");
    return null;
  }
};


export const getAllProducts = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/Product/get-product",
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
} 

export const checknewupdatequantity = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/UserProduct/checked-new-update-quantity-user-product?id=${id}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.error || "Error checking new update quantity");
    return null;
  }
};