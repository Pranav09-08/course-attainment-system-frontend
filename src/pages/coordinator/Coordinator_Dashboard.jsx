import React from 'react';
import { Outlet } from 'react-router-dom';


const CoordinatorDashboard = () => {
  return (
    <div>
    <h2>Coordinator Dashboard</h2>
    <Outlet /> {/* ✅ Ensures nested routes (Profile) render correctly */}
  </div>
  );
};

export default CoordinatorDashboard;
