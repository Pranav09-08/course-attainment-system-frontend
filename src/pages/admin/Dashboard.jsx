import React from "react";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <Outlet /> {/* ✅ Ensures nested routes (Profile) render correctly */}
    </div>
  );
};

export default AdminDashboard;
