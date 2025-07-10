import axios from "axios";


export const addToCart = async ({ sellProductId, mangaBoxId, quantity = 1 }) => {
  try {
    const token = localStorage.getItem("token");
    // Only include non-empty params
    const params = {};
    if (sellProductId) params.SellProductId = sellProductId;
    if (mangaBoxId) params.MangaBoxId = mangaBoxId;
    params.Quantity = quantity; // ✅ thêm dòng này

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

export const clearAllCart = async (type) => {
  try {
    const token = localStorage.getItem("token");

    // Tạo URL có hoặc không có query `type`
    const url = type
      ? `https://mmb-be-dotnet.onrender.com/api/Cart/clear-all-cart?type=${type}`
      : `https://mmb-be-dotnet.onrender.com/api/Cart/clear-all-cart`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Clear all cart failed:", error);
    throw error;
  }
};


export const updateCartQuantity = async ({ Id, quantity }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `https://mmb-be-dotnet.onrender.com/api/Cart/update-quantity`,
      {
        Id,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update cart quantity failed:", error);
    throw error;
  }
};