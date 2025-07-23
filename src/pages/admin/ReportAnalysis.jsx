import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage"; // Spinner overlay component
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

const ReportAnalysis = () => {
  // ======================= STATE =======================
  const [allottedCourses, setAllottedCourses] = useState([]);   // All allotted courses fetched from API
  const [loading, setLoading] = useState(true);                 // Initial page loading state
  const [operationLoading, setOperationLoading] = useState(false); // For view navigation or other async ops
  const [error, setError] = useState("");                       // Stores API or logic error
  const [searchTerm, setSearchTerm] = useState("");             // User input for search
  const [selectedYear, setSelectedYear] = useState("");         // Filter: academic year
  const [selectedSem, setSelectedSem] = useState("");           // Filter: semester

  const navigate = useNavigate();

  // ======================= FETCH COURSES =======================
  useEffect(() => {
    const fetchAllottedCourses = async () => {
      setLoading(true);
      setError("");

      try {
        // Get auth token and department ID from local storage
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const token = storedUser?.accessToken;
        const dept_id = storedUser?.user?.id;

        if (!token || !dept_id) {
          throw new Error("Unauthorized: Please log in again.");
        }

        // Fetch allotted courses from backend
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/allotment/get-allotted-courses/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.data.length > 0) {
          setAllottedCourses(response.data.data);
        } else {
          throw new Error("No course allotments found.");
        }

      } catch (err) {
        console.error("❌ API Fetch Error:", err);
        setError(
          err.response?.data?.msg || err.message || 
          "Failed to fetch course allotments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllottedCourses();
  }, []);

  // ======================= FILTER LOGIC =======================

  // Deduplicate courses by course_id
  const uniqueCourses = Array.from(
    new Set(allottedCourses.map((course) => course.course_id))
  ).map((course_id) =>
    allottedCourses.find((course) => course.course_id === course_id)
  );

  // Get distinct academic years and semesters for filter dropdowns
  const uniqueYears = [...new Set(uniqueCourses.map(course => course.academic_yr))];
  const uniqueSems = [...new Set(uniqueCourses.map(course => course.sem))];

  // Apply search and filters
  const filteredCourses = uniqueCourses.filter((course) => {
    return (
      (searchTerm === "" ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedYear === "" || course.academic_yr === selectedYear) &&
      (selectedSem === "" || course.sem === selectedSem)
    );
  });

  // ======================= HANDLERS =======================

  // Navigate to analysis page for selected course
  const handleViewAnalysis = (course_id, academic_yr) => {
    setOperationLoading(true);
    navigate(`/admin/attainment-analysis/${course_id}/${academic_yr}`);
  };

  // ======================= RENDER =======================

  return (
    <Container className="mt-4" style={{ position: "relative", minHeight: "80vh" }}>
      
      {/* Full-page overlay loader */}
      <LoaderPage loading={loading || operationLoading} />

      <h2 className="text-center text-primary mb-4">📚 Courses for Report and Analysis</h2>

      {/* ========== Search Bar ========== */}
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

      {/* ========== Filter Dropdowns ========== */}
      <div className="d-flex justify-content-center mb-4">
        <Form.Select
          className="w-25 mx-2"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={loading || operationLoading}
        >
          <option value="">Select Academic Year</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>{year}</option>
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
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </Form.Select>
      </div>

      {/* ========== Course List or Message ========== */}
      {!loading && !operationLoading && (
        <>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filteredCourses.length === 0 ? (
            <p className="text-muted text-center">
              No courses match your criteria.
            </p>
          ) : (
            <Row className="g-4">
              {filteredCourses.map((course) => (
                <Col md={6} lg={4} key={course.course_id}>
                  <Card className="shadow-lg p-3 h-100 d-flex flex-column">
                    <Card.Body className="flex-grow-1">
                      <h5 className="text-primary font-weight-bold mb-2">
                        {course.course_name}
                      </h5>
                      <hr />
                      <Card.Text>
                        <strong>Course ID:</strong> {course.course_id} <br />
                        <strong>Course Name:</strong> {course.course_name} <br />
                        <strong>Academic Year:</strong> {course.academic_yr}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() =>
                          handleViewAnalysis(course.course_id, course.academic_yr)
                        }
                        disabled={operationLoading}
                      >
                        View Analysis
                      </Button>
                    </Card.Footer>
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

export default ReportAnalysis;
