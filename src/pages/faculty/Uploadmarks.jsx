import React, { useEffect, useState } from "react";
import axios from "axios";

const Uploadmarks = () => {
  const [userData, setUserData] = useState([]); // ✅ Initialize as an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userRole = storedUser?.user?.role;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!storedUser) throw new Error("No user found. Please log in.");
        const { accessToken, user } = storedUser;
        const { id: user_id } = user;

        const API_URL = `https://teacher-attainment-system-backend.onrender.com/faculty_courses/faculty_course_allot/${user_id}`;
        console.log("Fetching from:", API_URL);

        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("Fetched data:", response.data);
        setUserData(Array.isArray(response.data) ? response.data : []); // ✅ Ensure it's an array

      } catch (err) {
        console.error("Error fetching faculty course data:", err);
        setError("Failed to fetch course allotment data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5 p-4 border rounded shadow-sm bg-light">
      <h2 className="text-center mb-4">👤 Course Allotment Information</h2>
      {userData.length > 0 ? (
        userData.map((course, index) => (
          <div key={index} className="profile-info border p-3 mb-3 rounded">
            <p><strong>Course ID:</strong> {course.course_id || "N/A"}</p>
            <p><strong>Faculty ID:</strong> {course.faculty_id || "N/A"}</p>
            <p><strong>Class:</strong> {course.class || "N/A"}</p>
            <p><strong>Sem:</strong> {course.sem || "N/A"}</p>
            <p><strong>Department ID:</strong> {course.dept_id || "N/A"}</p>
            <p><strong>Academic Year:</strong> {course.academic_yr || "N/A"}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-muted">No courses found.</p>
      )}
    </div>
  );
};

export default Uploadmarks;
