
import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";
import { pythonApiWithFallback } from "../config/axios";
export const getAllAuctionOfMod = async () => {
    try {
    const response = await apiWithFallback({
      method: "get",
      url: "https://api.mmb.io.vn/py/api/auction/mod",
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
    return response.data; // mảng 1 chiều
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


