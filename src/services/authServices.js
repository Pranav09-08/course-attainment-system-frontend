import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://teacher-attainment-system-backend.onrender.com";

// Login API Call
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    if (response.data.accessToken) {
      const expirationTime = new Date().getTime() + response.data.expiresIn * 1000;
      localStorage.setItem("user", JSON.stringify({ ...response.data, expirationTime }));
    }
    
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Login failed. Please try again.");
  }
};


// Logout function
export const logout = () => {
  localStorage.removeItem("user");
  const navigate = useNavigate();
  navigate("/login");  // ✅ Redirect to login page
};

// Get the current user
export const getCurrentUser = async () => {
  let storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) return null;

  const currentTime = new Date().getTime();
  if (currentTime > storedUser.expirationTime) {
    console.log("Access token expired, refreshing...");
    const newAccessToken = await refreshToken();

    if (!newAccessToken) {
      logout();
      return null;
    }

    // Fetch updated user after refresh
    storedUser = JSON.parse(localStorage.getItem("user"));
  }

  return storedUser;
};
