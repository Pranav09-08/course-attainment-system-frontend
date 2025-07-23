import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Row,
  Col,
  InputGroup,
  FormControl,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage"; // Loader component for full-page spinner
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast"; // Custom toast notification function

const AllottedCourses = () => {
  // State to store fetched course data
  const [allottedCourses, setAllottedCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [operationLoading, setOperationLoading] = useState(false); // For future operations
  const [error, setError] = useState(""); // To show API or logical errors
  const [searchTerm, setSearchTerm] = useState(""); // Course search input
  const [selectedYear, setSelectedYear] = useState(""); // Filter: Academic year
  const [selectedSem, setSelectedSem] = useState(""); // Filter: Semester

  useEffect(() => {
    // Fetches allotted courses for the logged-in department
    const fetchAllottedCourses = async () => {
      setLoading(true);
      setError("");

      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const token = storedUser?.accessToken;
      const dept_id = storedUser?.user?.id;

      if (!token) {
        // Show error toast and exit early if not authenticated
        showToast('error', "Unauthorized: Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Make GET request to fetch courses by department ID
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/allotment/get-allotted-courses/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update state with response or show appropriate message
        if (response.data?.data.length > 0) {
          setAllottedCourses(response.data.data);
        } else {
          showToast('error', "No course allotments found.");
        }
      } catch (err) {
        // Show error toast on failure
        showToast('error', "Failed to fetch course allotments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedCourses();
  }, []);

  // Extract unique academic years and semesters for filter dropdowns
  const uniqueYears = [
    ...new Set(allottedCourses.map((course) => course.academic_yr)),
  ];
  const uniqueSems = [...new Set(allottedCourses.map((course) => course.sem))];

  // Filter logic based on search input and dropdown filters
  const filteredCourses = allottedCourses.filter((course) => {
    return (
      (searchTerm === "" ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedYear === "" || course.academic_yr === selectedYear) &&
      (selectedSem === "" || course.sem === selectedSem)
    );
  });

  return (
    <Container className="mt-4" style={{ position: "relative", minHeight: "80vh" }}>
      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Loader component to block UI during fetch or operations */}
      <LoaderPage loading={loading || operationLoading} />

      <h2 className="text-center text-primary mb-4">📚 My Allotted Courses</h2>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Course Name or ID"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading || operationLoading}
          />
          <Button 
            variant="outline-secondary"
            disabled={loading || operationLoading}
          >
            Search
          </Button>
        </InputGroup>
      </div>

      {/* Filter dropdowns for Academic Year and Semester */}
      <div className="d-flex justify-content-center mb-4">
        <Form.Select
          className="w-25 mx-2"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={loading || operationLoading}
        >
          <option value="">Select Academic Year</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          className="w-25 mx-2"
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
          disabled={loading || operationLoading}
        >
          <option value="">Select Semester</option>
          {uniqueSems.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Error Message UI */}
      {error && !loading && !operationLoading && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Course Cards Section */}
      {!loading && !operationLoading && (
        <>
          {filteredCourses.length === 0 ? (
            <p className="text-muted text-center">
              No courses match your criteria.
            </p>
          ) : (
            <Row className="g-4">
              {filteredCourses.map((course) => (
                <Col md={6} lg={4} key={course.course_id}>
                  <Card className="shadow-lg p-3 h-100">
                    <Card.Body className="d-flex flex-column">
                      <h5 className="text-primary font-weight-bold mb-2">
                        {course.course_name}
                      </h5>
                      <hr />
                      <Card.Text className="flex-grow-1">
                        <strong>Course ID:</strong> {course.course_id} <br />
                        <strong>Course Name:</strong> {course.course_name} <br />
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
          )}
        </>
      )}
    </Container>
  );
};

export default AllottedCourses;
