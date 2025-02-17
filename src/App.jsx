import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes";  // ✅ Import only the routes
// import { getCurrentUser,} from "./services/authServices";
import { setUserRole } from './redux/actions'; // Adjust the path if necessary

import { useDispatch } from "react-redux";

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
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserRole = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        dispatch(setUserRole(storedUser.role)); // Dispatch role to Redux state
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
