import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser } from "../services/authServices"; // Import getCurrentUser

const ProtectedRoute = ({ children, roles }) => {
  const userRole = useSelector((state) => state.userRole);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        dispatch({ type: "SET_USER_ROLE", payload: user.role });
      }
      setLoading(false);
    };
  
    if (!userRole) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userRole, dispatch]);
  

  if (loading) return null; // Prevents redirect before fetching user

  if (!userRole) return <Navigate to="/login" replace />;
  if (!roles.includes(userRole)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
