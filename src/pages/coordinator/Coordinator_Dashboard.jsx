import React from 'react';
import Profile from '../ProfilePage';

const CoordinatorDashboard = () => {
  return (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <Profile/>
      <h1 className="text-white text-2xl font-bold">Welcome to Coordinator Dashboard!</h1>
    </div>
  );
};

export default CoordinatorDashboard;
