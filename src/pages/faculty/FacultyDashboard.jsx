import React from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../ProfilePage";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Profile />
      <h1>Welcome to the Teacher Dashboard</h1>
      <button onClick={() => navigate("/upload-marks")}>Add Marks</button>
    </div>
  );
};

export default TeacherDashboard;
