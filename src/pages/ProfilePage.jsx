import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem("user")); // ✅ Moved here for reusability
  const userRole = storedUser?.user?.role; // ✅ Get role directly

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!storedUser) throw new Error("No user found. Please log in.");
        const { accessToken, user } = storedUser;
        const { id: user_id } = user;

        const API_ROUTES = {
          admin: `https://teacher-attainment-system-backend.onrender.com/profile/admin/${user_id}`,
          coordinator: `https://teacher-attainment-system-backend.onrender.com/profile/coordinator/${user_id}`,
          faculty: `https://teacher-attainment-system-backend.onrender.com/profile/faculty/${user_id}`,
        };

        const response = await axios.get(API_ROUTES[userRole], {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("Fetched user data:", response.data); // Debugging line
        setUserData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5 p-4 border rounded shadow-sm bg-light" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">👤 Profile Information</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {userData?.dept_name || userData?.name || "N/A"}</p>
        <p><strong>ID:</strong> {userData?.dept_id || userData?.faculty_id ||  "N/A"}</p>
        <p><strong>Email:</strong> {userData?.email || "N/A"}</p>
        <p><strong>Role:</strong> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p> {/* ✅ Use local role */}
      </div>
    </div>
  );
};

export default Profile;
