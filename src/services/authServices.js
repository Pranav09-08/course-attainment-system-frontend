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




// Refresh Token API
// export const refreshToken = async () => {
//   try {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser?.refreshToken) {
//       logout();
//       return null;
//     }

//     const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: storedUser.refreshToken });

//     if (response.status === 200 && response.data.accessToken) {
//       const newExpirationTime = new Date().getTime() + response.data.expiresIn * 1000;
//       const updatedUser = { 
//         ...storedUser, 
//         accessToken: response.data.accessToken, 
//         expirationTime: newExpirationTime 
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//       return response.data.accessToken;
//     }
//   } catch (error) {
//     console.error("Token refresh error:", error);
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       logout();
//     }
//     return null;
//   }
// };
