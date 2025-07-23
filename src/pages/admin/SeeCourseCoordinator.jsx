import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast"; // Toast for notifications
import {
  Container,
  Card,
  Row,
  Col,
  InputGroup,
  Form,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage"; // Loader spinner for full page

const AllottedCourseCoordinator = () => {
  // State variables for storing API data and UI control
  const [allottedCourses, setAllottedCourses] = useState([]); // Raw fetched data
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered data based on search
  const [loading, setLoading] = useState(true); // Controls loader
  const [error, setError] = useState(""); // Error state for display
  const [searchTerm, setSearchTerm] = useState(""); // Search input state

  useEffect(() => {
    // Fetch allotted course coordinators on component mount
    const fetchAllottedCourses = async () => {
      setLoading(true);
      setError("");

      try {
        // Retrieve user info from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const token = storedUser?.accessToken;
        const dept_id = storedUser?.user?.id;

        // Abort if token or dept_id is missing
        if (!token || !dept_id) {
          throw new Error("Unauthorized: Please log in again.");
        }

        // API call to get coordinator data
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/get-course-coordinators/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Handle response
        if (Array.isArray(response.data) && response.data.length > 0) {
          setAllottedCourses(response.data);
          setFilteredCourses(response.data);
        } else {
          throw new Error("No Allotted Course Coordinators found.");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        showToast(
          "error",
          err.response?.data?.msg || err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedCourses();
  }, []);

  // Search handler to filter courses by ID, name, or faculty
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = allottedCourses.filter(
      (course) =>
        course.course_id.toLowerCase().includes(term.toLowerCase()) ||
        course.course_name.toLowerCase().includes(term.toLowerCase()) ||
        course.faculty_id.toLowerCase().includes(term.toLowerCase()) ||
        course.faculty_name.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredCourses(filtered);
  };

  return (
    <Container
      className="mt-4"
      style={{ position: "relative", minHeight: "80vh" }}
    >
      {/* Toast container for feedback messages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      {/* Loader shown during API fetch */}
      <LoaderPage loading={loading} />

      {/* Page title */}
      <h2 className="text-center text-primary mb-4">
        Allotted Course Coordinators
      </h2>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Course ID, Name, or Faculty"
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading}
          />
          <Button
            variant="outline-secondary"
            onClick={() => {
              setSearchTerm("");
              setFilteredCourses(allottedCourses);
            }}
            disabled={!searchTerm || loading}
          >
            Clear
          </Button>
        </InputGroup>
      </div>

      {/* Display error if any */}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {/* Cards Grid */}
      {!loading && filteredCourses.length > 0 ? (
        <Row className="g-4">
          {filteredCourses.map((course, index) => (
            <Col md={6} lg={4} key={index}>
              <Card className="shadow-lg p-3 h-100">
                <Card.Body className="d-flex flex-column">
                  <h5 className="text-primary font-weight-bold mb-2">
                    {course.course_name}
                  </h5>
                  <hr />
                  <Card.Text className="flex-grow-1">
                    <strong>Course ID:</strong> {course.course_id} <br />
                    <strong>Faculty ID:</strong> {course.faculty_id} <br />
                    <strong>Faculty Name:</strong> {course.faculty_name} <br />
                    <strong>Class:</strong> {course.class} <br />
                    <strong>Semester:</strong> {course.sem} <br />
                    <strong>Academic Year:</strong> {course.academic_yr}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        !loading && (
          <p className="text-center text-muted">
            {/* No allotted course coordinators found. */}
          </p>
        )
      )}
    </Container>
  );
};

export default AllottedCourseCoordinator;
