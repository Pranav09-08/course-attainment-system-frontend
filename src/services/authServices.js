// src/services/authService.js
import axios from "axios";

const API_URL = "https://teacher-attainment-system-backend.onrender.com"; 

// Login API Call
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  if (response.data.accessToken) {
    // Store token and user in localStorage
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout (Remove token)
export const logout = () => {
  localStorage.removeItem("user");
};

// Get current user (with token)
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
