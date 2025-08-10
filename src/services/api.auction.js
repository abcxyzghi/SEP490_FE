import { toast } from "react-toastify"
import { apiWithFallback } from "../config/axios";

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