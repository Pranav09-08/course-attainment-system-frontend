import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Alert, Spinner } from "react-bootstrap";

const UpdateCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    class: "FE", // Default value
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "",
  });
  const [errors, setErrors] = useState({}); // State for validation errors

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
      const response = await axios.get(
        "https://teacher-attainment-system-backend.onrender.com/admin/course/get-courses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📢 API Response:", response.data);

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

  // 🔹 Open Update Modal
  const handleUpdateClick = (course) => {
    setSelectedCourse(course);
    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      class: course.class || "FE", // Default to FE if missing
      ut: course.ut || "",
      insem: course.insem || "",
      endsem: course.endsem || "",
      finalsem: course.finalsem || "",
    });
    setErrors({}); // Clear previous errors
    setShowModal(true);
  };

  // 🔹 Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate input on change
    validateField(name, value);

    // Update form data
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };

      // Calculate finalsem if insem or endsem changes
      if (name === "insem" || name === "endsem") {
        const insem = parseInt(updatedData.insem, 10) || 0;
        const endsem = parseInt(updatedData.endsem, 10) || 0;
        updatedData.finalsem = insem + endsem;
      }

      return updatedData;
    });
  };

  // 🔹 Validate a single field
  const validateField = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "course_id":
        if (!value.trim()) {
          errorMessage = "Course ID is required.";
        } else if (!/^[A-Za-z0-9]+$/.test(value)) {
          errorMessage = "Course ID should contain only alphabets and numbers.";
        }
        break;

      case "course_name":
        if (!value.trim()) {
          errorMessage = "Course Name is required.";
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          errorMessage = "Course Name should contain only alphabets and spaces.";
        }
        break;

      case "ut":
      case "insem":
      case "endsem":
        if (!/^\d*$/.test(value)) {
          errorMessage = "Only positive integers are allowed.";
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  // 🔹 Validate the entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate Course ID
    if (!formData.course_id.trim()) {
      newErrors.course_id = "Course ID is required.";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.course_id)) {
      newErrors.course_id = "Course ID should contain only alphabets and numbers.";
    }

    // Validate Course Name
    if (!formData.course_name.trim()) {
      newErrors.course_name = "Course Name is required.";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.course_name)) {
      newErrors.course_name = "Course Name should contain only alphabets and spaces.";
    }

    // Validate Unit Test, In-Semester, and End-Semester Marks
    ["ut", "insem", "endsem"].forEach((field) => {
      if (!/^\d+$/.test(formData[field])) {
        newErrors[field] = "Only positive integers are allowed.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // 🔹 Update Course API
  const handleUpdateSubmit = async () => {
    if (!selectedCourse) return;

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Ensure numbers are properly converted before sending
    const updatedData = {
      course_id: formData.course_id,
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

      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/course/update-course/${selectedCourse.course_id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

    // Sort filtered courses by class: SE -> TE -> BE
    const sortedFilteredCourses = filtered.sort((a, b) => {
      const classOrder = { SE: 1, TE: 2, BE: 3 };
      return classOrder[a.class] - classOrder[b.class];
    });

    setFilteredCourses(sortedFilteredCourses);
  };

  // 🔹 Delete Course
  const handleDelete = async (course_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/course/delete-course/${course_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

      {loading && (
        <p className="text-center">
          <Spinner animation="border" />
        </p>
      )}
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
            {/* Course ID (Read-only) */}
            <Form.Group>
              <Form.Label>Course ID</Form.Label>
              <Form.Control
                type="text"
                name="course_id"
                value={formData.course_id}
                readOnly // Make it non-editable
              />
            </Form.Group>

            {/* Course Name */}
            <Form.Group>
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                isInvalid={!!errors.course_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.course_name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Class Dropdown */}
            <Form.Group>
              <Form.Label>Class</Form.Label>
              <Form.Control
                as="select"
                name="class"
                value={formData.class}
                onChange={handleChange}
              >
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </Form.Control>
            </Form.Group>

            {/* Unit Test, In-Semester, End-Semester */}
            {["ut", "insem", "endsem"].map((field) => (
              <Form.Group key={field}>
                <Form.Label>{field.toUpperCase()}</Form.Label>
                <Form.Control
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  isInvalid={!!errors[field]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[field]}
                </Form.Control.Feedback>
              </Form.Group>
            ))}

            {/* Final Semester (Read-only) */}
            <Form.Group>
              <Form.Label>Final Semester</Form.Label>
              <Form.Control
                type="text"
                name="finalsem"
                value={formData.finalsem}
                readOnly // Make it uneditable
              />
            </Form.Group>
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

export default UpdateCourses;