
import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";
import { pythonApiWithFallback } from "../config/axios";
export const getAllAuctionOfMod = async () => {
    try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/auction/mod",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};

export const updateStatusAuction = async (id,status) => {
try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/AuctionSettlement/update-status-auction-session`,
      data: { id, status },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error Approve/Reject auction");
    return null;
  }
}



export const fetchAuctionList = async (filter = "started") => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/all?filter=${filter}`,
      requiresAuth: true,
    });
    return response; // mảng 1 chiều
  } catch (error) {
    console.error(`Fetch auction list failed (filter=${filter}):`, error);
    throw error;
  }
};
export const fetchAuctionListStart = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/waiting",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch auction list failed:", error);
    throw error;
  }
}; 

export const fetchMyAuctionList = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/me",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch my auction list failed:", error);
    throw error;
  }
};


export const newAuction = async (auctionData) => {
  const payload = {
    title: auctionData.title,
    descripition: auctionData.description,
    start_time: auctionData.start_time
  };

  console.log("📤 newAuction request body:", payload);

  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/auction/new",
      requiresAuth: true,
      data: payload
    });

    return response.data;
  } catch (error) {
    console.error("Create new auction failed:", error);
    throw error;
  }
};

export const productOfAuction = async (productData) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/auction/product",
      requiresAuth: true,
      data: {
        product_id: productData.product_id,
        auction_session_id: productData.auction_session_id,
        quantity: productData.quantity,
        starting_price: productData.starting_price
      }
    });

    return response.data;
  } catch (error) {
    console.error("Add product to auction failed:", error);
    throw error;
  }
}; 

export const fetchJoinedAuctionList = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/joined-history",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch joined auction list failed:", error);
    throw error;
  }
};
