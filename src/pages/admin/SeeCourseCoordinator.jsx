import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, Table, Spinner, Alert } from "react-bootstrap";

const AllottedCourses = () => {
  const [allottedCourses, setAllottedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllottedCourses = async () => {
      setLoading(true);
      setError("");

      try {
        // ✅ Get User Data from LocalStorage
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const token = storedUser?.accessToken;
        const dept_id = storedUser?.user?.id;

        if (!token || !dept_id) {
          throw new Error("Unauthorized: Please log in again.");
        }

        // ✅ API Request
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/get-course-coordinators/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          setAllottedCourses(response.data);
        } else {
          throw new Error("No course allotments found.");
        }
      } catch (err) {
        console.error("❌ API Fetch Error:", err);
        setError(err.response?.data?.msg || err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedCourses();
  }, []);

  return (
    <Container className="d-flex justify-content-center mt-4">
      <Card style={{ width: "60rem" }} className="shadow-lg p-4">
        <Card.Body>
          <Card.Title className="text-center mb-3">📚 Allotted Courses</Card.Title>

          {/* ✅ Show Error Message */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* ✅ Show Loading Spinner */}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : allottedCourses.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead className="table-primary">
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Class</th>
                  <th>Semester</th>
                  <th>Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {allottedCourses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.course_id}</td>
                    <td>{course.course_name}</td>
                    <td>{course.faculty_id}</td>
                    <td>{course.faculty_name}</td>
                    <td>{course.class}</td>
                    <td>{course.sem}</td>
                    <td>{course.academic_yr}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No course allotments found.</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllottedCourses;
