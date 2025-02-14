import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes";  // ✅ Import only the routes
import { getCurrentUser } from "./services/authServices";

import '@coreui/coreui/dist/css/coreui.min.css';
import '@coreui/icons/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      } else {
        const user = await getCurrentUser();
        setUser(user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.user?.role) {
      const role = user.user.role;
      const roleToRoute = {
        admin: "/admin-dashboard",
        coordinator: "/coordinator-dashboard",
        faculty: "/faculty-dashboard",
      };
      navigate(roleToRoute[role] || "/faculty-dashboard");
    }
  }, [user, navigate]);

  if (loading) return <div>Loading...</div>;

  return <AppRoutes />;
};

export default App;
