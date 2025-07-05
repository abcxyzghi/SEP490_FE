import { toast } from "react-toastify"
import api from "../config/axios"

export const getAllMysteryBoxes = async () => {
   try {
    const response = await api.get("https://mmb-be-dotnet.onrender.com/api/MangaBox/get-all-mystery-box")
    return response.data;
   } catch(error) {
    toast.error(error.response?.data?.error || "Error fetching mystery boxes")
    return null;
   }
}

export const getMysteryBoxDetail = async (id) => {
  try {
    const response = await api.get(`https://mmb-be-dotnet.onrender.com/api/MangaBox/get-mystery-box-detail/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error fetching box detail");
    return null;
  }
}

// Buy mystery box API call
export const buyMysteryBox = async ({ mangaBoxId, quantity }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post(
      "https://mmb-be-dotnet.onrender.com/api/MangaBox/buy-mystery-box",
      { mangaBoxId, quantity },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    );
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error buying mystery box");
    return null;
  }
}
