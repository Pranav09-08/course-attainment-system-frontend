// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const ProtectedRoute = ({ children, roles }) => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.user.role)) {
    return <h2>🚫 Access Denied!</h2>;
  }

  return children;
};

export default ProtectedRoute;
