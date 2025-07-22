import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Alert,
  InputGroup,
  Form,
  Button,
  Container,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage"; // Full-page loader
import { ToastContainer } from "react-toastify";
import { showToast } from "../../components/Toast"; // Custom toast handler
import "react-toastify/dist/ReactToastify.css"; // Toast styling

const AllCourses = () => {
  // State variables
  const [courses, setCourses] = useState([]); // Full course list
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered list for search
  const [loading, setLoading] = useState(true); // Loader state
  const [error, setError] = useState(""); // Error message
  const [searchTerm, setSearchTerm] = useState(""); // Current search input

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      // Abort if token is missing
      if (!token) {
        showToast("error", "Unauthorized: Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // API call to fetch courses
        const response = await axios.get(
          "https://teacher-attainment-system-backend.onrender.com/admin/course/get-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("📢 API Response:", response.data); // Debug log

        // Sort courses by class: SE → TE → BE
        if (Array.isArray(response.data) && response.data.length > 0) {
          const sortedCourses = response.data.sort((a, b) => {
            const classOrder = { SE: 1, TE: 2, BE: 3 };
            return classOrder[a.class] - classOrder[b.class];
          });

          setCourses(sortedCourses);
          setFilteredCourses(sortedCourses);
        } else {
          showToast("info", "No courses found");
        }
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        showToast("error", "Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle user search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter based on course_id or course_name
    const filtered = courses.filter(
      (course) =>
        course.course_id.toString().includes(term) ||
        course.course_name.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredCourses(filtered);
  };

  return (
    <Container className="mt-5">
      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Loader overlay */}
      <LoaderPage loading={loading} />

      {/* Page title */}
      <h2 className="text-center mb-4">All Courses</h2>

      {/* Search bar */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Course ID or Course Name"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          </InputGroup>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Display course data in table format */}
      {!loading && filteredCourses.length > 0 ? (
        <Table striped bordered hover responsive className="shadow">
          <thead className="table-dark">
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Class</th>
              <th>Unit Test</th>
              <th>In-Sem</th>
              <th>End-Sem</th>
              <th>Final Sem</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_id}</td>
                <td>{course.course_name}</td>
                <td>{course.class}</td>
                <td>{course.ut}</td>
                <td>{course.insem}</td>
                <td>{course.endsem}</td>
                <td>{course.finalsem}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        // No course match message
        !loading && (
          <p className="text-center text-muted">No courses found.</p>
        )
      )}
    </Container>
  );
};

export default AllCourses;
