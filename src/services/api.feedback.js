import { toast } from "react-toastify";
import api from "../config/axios";
import { apiWithFallback } from '../config/axios';

export const createRating = async (data) => {
  try {
    const response = await api.post('rating', data);
    return response.data;

  } catch (error) {
    toast.error(error.response.data);
  }
}

export const createReport = async (data) => {
  try {
    const response = await api.post('report', data);
    return response.data;

  } catch (error) {
    toast.error(error.response.data);
  }
}