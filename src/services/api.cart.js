import axios from "axios";


export const addToCart = async ({ sellProductId, mangaBoxId }) => {
  try {
    const token = localStorage.getItem("token");
    // Only include non-empty params
    const params = {};
    if (sellProductId) params.SellProductId = sellProductId;
    if (mangaBoxId) params.MangaBoxId = mangaBoxId;
    const response = await axios.post(
      `https://mmb-be-dotnet.onrender.com/api/Cart/add-to-cart`, 
      null, 
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Add to cart failed:", error);
    throw error;
  }
};

export const viewCart = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `https://mmb-be-dotnet.onrender.com/api/Cart/view-cart`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("View cart failed:", error);
    throw error;
  }
};

export const removeFromCart = async ({ sellProductId, mangaBoxId }) => {
  try {
    const token = localStorage.getItem("token");
    const params = {};
    if (sellProductId) params.sellProductId = sellProductId;
    if (mangaBoxId) params.mangaBoxId = mangaBoxId;
    const response = await axios.delete(
      `https://mmb-be-dotnet.onrender.com/api/Cart/remove-from-cart`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Remove from cart failed:", error);
    throw error;
  }
};

export const clearAllCart = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `https://mmb-be-dotnet.onrender.com/api/Cart/clear-all-cart`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Clear all cart failed:", error);
    throw error;
  }
};

