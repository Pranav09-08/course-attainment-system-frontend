import React from 'react';

const Navbar = () => {
  return (
    <nav>
      <h1>Teacher Attainment System</h1>
      <ul>
        <li><a href="/login">Login</a></li>
        <li><a href="/teacher/dashboard">Teacher Dashboard</a></li>
        <li><a href="/coordinator/dashboard">Coordinator Dashboard</a></li>
        <li><a href="/admin/dashboard">Admin Dashboard</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
