import React from 'react';
import { Outlet } from 'react-router-dom';

const TeacherDashboard = () => {
  return (
    <div>
      <h2>Faculty Dashboard</h2>
      <Outlet /> {/* ✅ Ensures nested routes (Profile) render correctly */}
    </div>
  );
};

export default TeacherDashboard;
