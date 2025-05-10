import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, InputGroup, Form, Button, Container } from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage"; // Adjust the import path as needed

const AllCourses = () => {
  const [courses, setCourses] = useState([]); // Original courses list
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(""); // Reset error before fetching

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      if (!token) {
        setError("Unauthorized: Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://teacher-attainment-system-backend.onrender.com/admin/course/get-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("📢 API Response:", response.data); // Debugging

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Sort courses by class: SE -> TE -> BE
          const sortedCourses = response.data.sort((a, b) => {
            const classOrder = { SE: 1, TE: 2, BE: 3 };
            return classOrder[a.class] - classOrder[b.class];
          });

          setCourses(sortedCourses);
          setFilteredCourses(sortedCourses); // Initialize filtered list with sorted courses
        } else {
          setError("No courses found.");
        }
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        setError("Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter courses based on search term
    const filtered = courses.filter(
      (course) =>
        course.course_id.toString().includes(term) || // Search by course_id
        course.course_name.toLowerCase().includes(term.toLowerCase()) // Search by course_name
    );

    setFilteredCourses(filtered);
  };

  return (
    <Container className="mt-5">
      {/* Loader Component */}
      <LoaderPage loading={loading} />

      <h2 className="text-center mb-4">All Courses</h2>

      {/* Search Bar */}
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
        !loading && (
          <p className="text-center text-muted">No courses found.</p>
        )
      )}
    </Container>
  );
};

export default AllCourses;