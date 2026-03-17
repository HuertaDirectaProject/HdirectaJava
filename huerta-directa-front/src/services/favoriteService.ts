import axios from "axios";
import { API_URL } from "../config/api";

// We need withCredentials to send the session cookie
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export const favoriteService = {
  addFavorite: async (productId: number) => {
    const response = await axiosInstance.post(`/favorites/${productId}`);
    return response.data;
  },

  removeFavorite: async (productId: number) => {
    const response = await axiosInstance.delete(`/favorites/${productId}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await axiosInstance.get(`/favorites`);
    return response.data;
  },
};
