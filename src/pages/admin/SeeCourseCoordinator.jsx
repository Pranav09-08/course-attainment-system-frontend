import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Alert, InputGroup, Form, Button } from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";

const AllottedCourseCoordinator = () => {
  const [allottedCourses, setAllottedCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllottedCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const token = storedUser?.accessToken;
        const dept_id = storedUser?.user?.id;

        if (!token || !dept_id) {
          throw new Error("Unauthorized: Please log in again.");
        }

        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/get-course-coordinators/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          setAllottedCourses(response.data);
          setFilteredCourses(response.data);
        } else {
          throw new Error("No Allotted CourseCoordinator found.");
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

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = allottedCourses.filter(
      (course) =>
        course.course_id.toLowerCase().includes(term.toLowerCase()) ||
        course.course_name.toLowerCase().includes(term.toLowerCase()) ||
        course.faculty_id.toString().includes(term) ||
        course.faculty_name.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredCourses(filtered);
  };

  return (
    <Container className="mt-5">
      {/* Full-page loader */}
      <LoaderPage loading={loading} />

      <h2 className="text-center mb-4">Allotted Course Coordinators</h2>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Course ID, Name, or Faculty"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
            >
              Clear
            </Button>
          </InputGroup>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Courses Table */}
      {!loading && filteredCourses.length > 0 ? (
        <Table striped bordered hover responsive className="shadow">
          <thead className="table-dark">
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
            {filteredCourses.map((course, index) => (
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
        !loading && (
          <p className="text-center text-muted">No allotted course coordinators found.</p>
        )
      )}
    </Container>
  );
};

export default AllottedCourseCoordinator;