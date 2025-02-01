import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/admin/Dashboard';
import CoordinatorDashboard from './pages/coordinator/Coordinator_Dashboard';
import Login from './pages/LoginPage';

const App = () => {
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<div>Home Page is only visible</div>} />
    //     <Route path="/admin" element={<AdminDashboard />} />
    //     <Route path="/coordinator" element={<CoordinatorDashboard />} />
    //     {/* Add more routes as needed */}
    //   </Routes>
    // </Router>
    <Login/>
  );
};

export default App;
