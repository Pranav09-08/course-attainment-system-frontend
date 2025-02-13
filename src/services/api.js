import axios from "axios";
import { refreshToken, logout } from "./authServices"; 

const API_URL = "https://teacher-attainment-system-backend.onrender.com";

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to attach token to every request
api.interceptors.request.use(
  async (config) => {
    let storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser?.accessToken) {
      const currentTime = new Date().getTime();

      // Check if token is expired
      if (currentTime > storedUser.expirationTime) {
        console.log("Access token expired, refreshing...");
        const newAccessToken = await refreshToken();

        if (newAccessToken) {
          storedUser = JSON.parse(localStorage.getItem("user")); // Update stored user
        } else {
          logout(); // If refresh fails, log out
          return Promise.reject("Session expired. Logging out...");
        }
      }

      // Attach token to request
      config.headers.Authorization = `Bearer ${storedUser.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
