import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Alert, Spinner } from "react-bootstrap";

const updateCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [formData, setFormData] = useState({
    course_name: "",
    class: "FE",  // Default value
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  // 🔹 Fetch All Courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://teacher-attainment-system-backend.onrender.com/admin/course/get-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📢 API Response:", response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        setCourses(response.data);
        setFilteredCourses(response.data); // Initialize filtered list with all courses
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

  // 🔹 Open Update Modal
  const handleUpdateClick = (course) => {
    setSelectedCourse(course);
    setFormData({
      course_name: course.course_name,
      class: course.class || "FE", // Default to FE if missing
      ut: course.ut || "",
      insem: course.insem || "",
      endsem: course.endsem || "",
      finalsem: course.finalsem || "",
    });
    setShowModal(true);
  };

  // 🔹 Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "course_name" || name === "class" ? value : parseInt(value, 10) || 0  // Convert numbers
    });
  };

  // 🔹 Update Course API
  const handleUpdateSubmit = async () => {
    if (!selectedCourse) return;

    // Ensure numbers are properly converted before sending
    const updatedData = {
      course_name: formData.course_name,
      class: formData.class,
      ut: parseInt(formData.ut, 10) || 0,
      insem: parseInt(formData.insem, 10) || 0,
      endsem: parseInt(formData.endsem, 10) || 0,
      finalsem: parseInt(formData.finalsem, 10) || 0,
    };

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      await axios.put(`https://teacher-attainment-system-backend.onrender.com/admin/course/update-course/${selectedCourse.course_id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Course updated successfully!");
      setShowModal(false);
      fetchCourses(); // Refresh Data
    } catch (error) {
      console.error("❌ Update Error:", error.response?.data || error.message);
      alert("Failed to update course.");
    }
  };

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

  // 🔹 Delete Course
  const handleDelete = async (course_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      await axios.delete(`https://teacher-attainment-system-backend.onrender.com/admin/course/delete-course/${course_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Course deleted successfully!");
      setCourses(courses.filter((course) => course.course_id !== course_id));
      setFilteredCourses(filteredCourses.filter((course) => course.course_id !== course_id)); // Update filtered list
    } catch (error) {
      console.error("❌ Delete Error:", error.response?.data || error.message);
      alert("Failed to delete course.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">All Courses</h2>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Course ID or Course Name"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-center"><Spinner animation="border" /></p>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!loading && filteredCourses.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Class</th>
              <th>Unit Test</th>
              <th>In-Sem</th>
              <th>End-Sem</th>
              <th>Final Sem</th>
              <th>Actions</th>
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
                <td>
                  <Button variant="primary" size="sm" onClick={() => handleUpdateClick(course)}>
                    Update
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(course.course_id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p className="text-center text-muted">No courses found.</p>
      )}

      {/* 🔹 Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
              />
            </Form.Group>

            {/* 🔹 Class Dropdown */}
            <Form.Group>
              <Form.Label>Class</Form.Label>
              <Form.Control as="select" name="class" value={formData.class} onChange={handleChange}>
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </Form.Control>
            </Form.Group>

            {["ut", "insem", "endsem", "finalsem"].map((field) => (
              <Form.Group key={field}>
                <Form.Label>{field.toUpperCase()}</Form.Label>
                <Form.Control
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdateSubmit}>
            Update Course
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default updateCourses;