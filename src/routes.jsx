import React from "react";
import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout"; // ✅ Import first!
import ProtectedRoute from "./components/Protectedroutes"; 

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/ProfilePage";
import AdminDashBoard from "./pages/admin/Dashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CoordinatorDashboard from "./pages/coordinator/Coordinator_Dashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<Profile />} />

      {/* Protected Routes with Dashboard Layout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route
          path="admin-dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty-dashboard"
          element={
            <ProtectedRoute roles={["faculty", "coordinator", "admin"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="coordinator-dashboard"
          element={
            <ProtectedRoute roles={["coordinator", "admin"]}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
