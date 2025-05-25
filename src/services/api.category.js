import { toast } from "react-toastify";
import api from "../config/axios";

export const getCategories= async () => {
    try{
     const response = await api.get("category")
     return response.data;
    }catch(error){
     toast.error(error.response.data)
    }
 }