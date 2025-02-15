// AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/Protectedroutes";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/ProfilePage";
import AdminDashBoard from "./pages/admin/Dashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CoordinatorDashboard from "./pages/coordinator/Coordinator_Dashboard";
import CourseAttainment from './pages/coordinator/Attainmentinfo';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 🔹 Admin Dashboard */}
      {/* Wrap in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/admin-dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashBoard /></ProtectedRoute>} />
        <Route path="/admin-dashboard/profile" element={<ProtectedRoute roles={["admin"]}><Profile /></ProtectedRoute>} />
      </Route>


      {/* 🔹 Faculty Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/faculty-dashboard" element={<ProtectedRoute roles={["faculty", "coordinator", "admin"]}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty-dashboard/profile" element={<ProtectedRoute roles={["faculty", "coordinator", "admin"]}><Profile /></ProtectedRoute>} />
      </Route>

      {/* 🔹 Coordinator Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/coordinator-dashboard" element={<ProtectedRoute roles={["coordinator", "admin"]}><CoordinatorDashboard /></ProtectedRoute>} />
        <Route path="/attainment/:courseId/:academicYear" element={<ProtectedRoute roles={["coordinator", "admin"]}><CourseAttainment /></ProtectedRoute>} />
        <Route path="/coordinator-dashboard/profile" element={<ProtectedRoute roles={["faculty", "coordinator", "admin"]}><Profile /></ProtectedRoute>} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<h2>404 - Page Not Found 🚫</h2>} />
    </Routes>
  );
};

export default AppRoutes;
