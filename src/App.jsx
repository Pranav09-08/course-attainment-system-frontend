import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import { setUserRole } from './redux/actions'; 
import { useDispatch } from "react-redux";
import { ToastContainer } from 'react-toastify'; // Add this import
import 'react-toastify/dist/ReactToastify.css'; // Add this CSS import

import '@coreui/coreui/dist/css/coreui.min.css';
import '@coreui/icons/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/react-fontawesome";
import "@fortawesome/free-solid-svg-icons";
import "@fortawesome/free-brands-svg-icons";

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserRole = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        dispatch(setUserRole(storedUser.role));
        setUser(storedUser);
      }
      setLoading(false);
    };

    loadUserRole();
  }, [dispatch]);

  useEffect(() => {
    if (user?.role) {
      const role = user.role;
      const roleToRoute = {
        admin: "/admin-dashboard",
        coordinator: "/coordinator-dashboard",
        faculty: "/faculty-dashboard",
      };
      navigate(roleToRoute[role] || "/faculty-dashboard");
    }
  }, [user, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AppRoutes />
      <ToastContainer /> {/* Add this component */}
    </>
  );
};

export default App;