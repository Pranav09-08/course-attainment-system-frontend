// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // Only import Routes and Route
import HomePage from "./pages/HomePage"; // Import HomePage component
import LoginPage from "./pages/LoginPage"; // Import LoginPage component
import AdminDashBoard from './pages/admin/Dashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CoordinatorDashboard from './pages/coordinator/Coordinator_Dashboard'

const App = () => {
  return (
    <Routes>
      {/* Define routes */}
      <Route path="/" element={<HomePage />} /> {/* Home page route */}
      <Route path="/login" element={<LoginPage />} /> {/* Login page route */}
      <Route path="/admin-dashboard" element={<AdminDashBoard/>}/> {/*Admin Dashboard*/}
      <Route path="/faculty-dashboard" element={<FacultyDashboard/>}/> {/*Admin Dashboard*/}
      <Route path="/coordinator-dashboard" element={<CoordinatorDashboard/>}/> {/*Admin Dashboard*/}
    </Routes>
  );
};

export default App;