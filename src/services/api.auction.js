
import { toast } from "react-toastify"
import { apiWithFallback, pythonApiWithFallback } from "../config/axios";

export const getAllAuctionOfMod = async () => {
  try {
    const response = await pythonApiWithFallback({
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

export const updateStatusAuction = async (id, status) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/AuctionSettlement/update-status-auction-session`,
      params: { auctionSessionId: id, status },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error Approve/Reject auction");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
}
export const cancelAuction = async (auctionId) => {
  try {
    const response = await pythonApiWithFallback({
      method: "delete",
      url: `/api/auction/auction-cancel`,
      params: { auction_id: auctionId },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.error || "Error cancel auction");
    return {
      errorCode: error.response?.data?.error_code,
      message: error.response?.data?.error
    }
  }
};

// export const confirmAuction = async (auctionId) => {
//   try {
//     const response = await pythonApiWithFallback({
//       method: "post",
//       url: `/api/auction/confirmation`,
//       params: { auction_id: auctionId },
//       requiresAuth: true,
//     });
//     return response.data;
//   } catch (error) {
    
//     console.error(error.response?.data?.error || "Error cancel auction");
//     return {
//       errorCode: error.response?.data?.error_code,
//       message: error.response?.data?.error
//     }
//   }
// };


export const fetchAuctionList = async (filter = "started") => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/all/extend?filter=${filter}`,
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

export const fetchAuctionWinner = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/win-history",
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("Fetch joined auction list failed:", error);
    throw error;
  }
};

export const getAllAuctionResultForMod = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/auction-result",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};
export const updateAuctionSettlement = async (auctionId) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/AuctionSettlement/update-status-auction-session/${auctionId}`,
      params: { auctionId },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error Approve/Reject auction");
    return {
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.error
    };
  }
};
export const checkIsJoinedAuction = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/is-joined-auction`,
      requiresAuth: true,
    });
    console.log("true or false let's find out" + response.data)
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data[0];
    }
  } catch (error) {
    console.error("Check is joined auction failed:", error);
    throw error;
  }
};
export const getAllAuctions = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "api/auction/all?filter=default",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};

  // Call auction bid API
  export const Top5bidAuction = async (auctionId) => {
    try {
      const response = await pythonApiWithFallback({
        method: "get",
        url: "api/auction/bid",
        params: { auction_id: auctionId },
        requiresAuth: true,
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Error placing bid");
      return {
        errorCode: error.response?.data?.error_code,
        message: error.response?.data?.error
      };
    }
  };

  export const AuctionProductDetail = async (auctionId) => {
    try {
      const response = await pythonApiWithFallback({
        method: "get",
        url: "api/auction/product",
        params: { auction_id: auctionId },
        requiresAuth: true,
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Error placing bid");
      return {
        errorCode: error.response?.data?.error_code,
        message: error.response?.data?.error
      };
    }
  };