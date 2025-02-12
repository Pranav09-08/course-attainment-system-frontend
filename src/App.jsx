// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Profile from './pages/ProfilePage';
import AdminDashBoard from "./pages/admin/Dashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CoordinatorDashboard from "./pages/coordinator/Coordinator_Dashboard";
import ProtectedRoute from "./components/Protectedroutes"; // Import ProtectedRoute

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} /> 
      <Route path="/login" element={<LoginPage />} />
      <Route path="/Profile" element={<Profile/>}/>

      {/* Protected Routes */}
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

      {/* Catch-All Route */}
      <Route path="*" element={<h2>404 - Page Not Found 🚫</h2>} />
    </Routes>
  );
};

export default App;
