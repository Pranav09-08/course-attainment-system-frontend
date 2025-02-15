import React, { useEffect, useState } from "react";
import axios from "axios";
import { CCard, CCardBody, CCardHeader, CCardText, CCardTitle, CCol, CRow } from "@coreui/react";

const Uploadmarks = () => {
  const [userData, setUserData] = useState([]); 
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

        const API_URL = `http://localhost:5001/faculty_courses/faculty_course_allot/${user_id}`;
        console.log("Fetching from:", API_URL);

        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("Fetched data:", response.data);
        setUserData(Array.isArray(response.data) ? response.data : []); 

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
    <div className="container mt-5 p-4 border rounded shadow-sm bg-dark">
      <h2 className="text-center mb-4 text-white">👤 Course Allotment Information</h2>

      {userData.length > 0 ? (
        <CRow>
          {userData.map((course, index) => (
            <CCol sm={6} md={4} key={index}>
              <CCard className="shadow border-0 mb-3">
                <CCardHeader className="bg-primary text-white text-center">
                  📘 {course.class || "N/A"} - Sem {course.sem || "N/A"}
                </CCardHeader>
                <CCardBody>
                  <CCardTitle className="h5 text-center mb-3">📚 Course Details</CCardTitle>
                  <CCardText>
                    <strong>Course ID:</strong> {course.course_id || "N/A"} <br />
                    <strong>Faculty ID:</strong> {course.faculty_id || "N/A"} <br />
                    <strong>Department:</strong> {course.dept_id || "N/A"} <br />
                    <strong>Academic Year:</strong> {course.academic_yr || "N/A"}
                  </CCardText>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      ) : (
        <p className="text-center text-muted">No courses found.</p>
      )}
    </div>
  );
};

export default Uploadmarks;