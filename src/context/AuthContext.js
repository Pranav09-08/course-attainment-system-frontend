import { createContext, useState, useEffect } from "react";
import { login, logout, getCurrentUser } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Login function
  const handleLogin = async (email, password) => {
    try {
      const userData = await login(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  // Logout function
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
