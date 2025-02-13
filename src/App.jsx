import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import '@coreui/coreui/dist/css/coreui.min.css';
import '@coreui/icons/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./pages/LoginPage";
import Profile from './pages/ProfilePage';
import AdminDashBoard from "./pages/admin/Dashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CoordinatorDashboard from "./pages/coordinator/Coordinator_Dashboard";
import ProtectedRoute from "./components/Protectedroutes";
import DashboardLayout from "./layout/DashboardLayout";
import { getCurrentUser } from "./services/authServices";

const App = () => {


  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from localStorage on initial render
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getCurrentUser();  // ✅ Await async function
      setUser(storedUser);
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Redirect logged-in users to their respective dashboards
  useEffect(() => {
    if (user && user.user && user.user.role) {
      switch (user.user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "coordinator":
          navigate("/coordinator-dashboard");
          break;
        default:
          navigate("/faculty-dashboard");
      }
    }
  }, [user, navigate]);

  if (loading) return <div>Loading...</div>; // ✅ Prevent unnecessary redirects



  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<Profile />} />

      {/* Dashboard with Sidebar and Header */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute roles={["faculty", "coordinator", "admin"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinator-dashboard"
          element={
            <ProtectedRoute roles={["coordinator", "admin"]}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-All Route */}
      <Route path="*" element={<h2>404 - Page Not Found 🚫</h2>} />
    </Routes>
  );
};

export default App;
