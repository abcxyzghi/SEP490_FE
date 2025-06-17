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
