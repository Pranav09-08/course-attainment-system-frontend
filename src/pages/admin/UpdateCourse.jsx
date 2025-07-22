import { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Table,
  Alert,
  InputGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../components/Toast";
import "react-toastify/dist/ReactToastify.css";

// Component to view, update, and delete all courses
const UpdateCourses = () => {
  // State declarations
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    class: "FE",
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "",
  });
  const [errors, setErrors] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch courses on initial render
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch all courses from backend
  const fetchCourses = async () => {
    setLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again.");
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

      if (Array.isArray(response.data) && response.data.length > 0) {
        // Sort courses by class order
        const sortedCourses = response.data.sort((a, b) => {
          const classOrder = { SE: 1, TE: 2, BE: 3 };
          return classOrder[a.class] - classOrder[b.class];
        });

        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
      } else {
        showToast("info", "No courses found.");
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      showToast("error", "Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Triggered when 'Update' is clicked on a course row
  const handleUpdateClick = (course) => {
    setSelectedCourse(course);
    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      class: course.class || "FE",
      ut: course.ut || "",
      insem: course.insem || "",
      endsem: course.endsem || "",
      finalsem: course.finalsem || "",
    });
    setErrors({});
    setShowModal(true);
  };

  // Handles change in form inputs and updates finalsem if needed
  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Auto-calculate finalsem
      if (name === "insem" || name === "endsem") {
        const insem = parseInt(updatedData.insem, 10) || 0;
        const endsem = parseInt(updatedData.endsem, 10) || 0;
        updatedData.finalsem = insem + endsem;
      }

      return updatedData;
    });
  };

  // Validates individual input field
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
          errorMessage =
            "Course Name should contain only alphabets and spaces.";
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

  // Validates the whole form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_id.trim()) {
      newErrors.course_id = "Course ID is required.";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.course_id)) {
      newErrors.course_id =
        "Course ID should contain only alphabets and numbers.";
    }

    if (!formData.course_name.trim()) {
      newErrors.course_name = "Course Name is required.";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.course_name)) {
      newErrors.course_name =
        "Course Name should contain only alphabets and spaces.";
    }

    ["ut", "insem", "endsem"].forEach((field) => {
      if (!/^\d+$/.test(formData[field])) {
        newErrors[field] = "Only positive integers are allowed.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit updated course data to backend
  const handleUpdateSubmit = async () => {
    if (!selectedCourse) return;
    if (!validateForm()) return;

    setModalLoading(true);
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

      showToast("success", "Course updated successfully!");
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error("❌ Update Error:", error.response?.data || error.message);
      showToast("error", "Failed to update course.");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (course_id) => {
    setCourseToDelete(course_id);
    setShowDeleteModal(true);
  };

  // Confirm and perform delete
  const confirmDelete = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/course/delete-course/${courseToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("success", "Course deleted successfully!");
      setCourses(
        courses.filter((course) => course.course_id !== courseToDelete)
      );
      setFilteredCourses(
        filteredCourses.filter((course) => course.course_id !== courseToDelete)
      );
    } catch (error) {
      console.error("❌ Delete Error:", error.response?.data || error.message);
      showToast("error", "Failed to delete course.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  // Handle search bar filtering
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = courses.filter(
      (course) =>
        course.course_id.toString().includes(term) ||
        course.course_name.toLowerCase().includes(term.toLowerCase())
    );

    const sortedFilteredCourses = filtered.sort((a, b) => {
      const classOrder = { SE: 1, TE: 2, BE: 3 };
      return classOrder[a.class] - classOrder[b.class];
    });

    setFilteredCourses(sortedFilteredCourses);
  };

  // JSX render
  return (
    <Container
      fluid
      className="p-4"
      style={{ position: "relative", minHeight: "80vh" }}
    >
      {/* Toast and loader */}
      <ToastContainer position="top-right" autoClose={3000} />
      <LoaderPage loading={loading || modalLoading || deleteLoading} />

      <h2 className="text-center mb-4">All Courses</h2>

      {/* Search bar */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Course ID or Course Name"
              value={searchTerm}
              onChange={handleSearch}
              disabled={loading || modalLoading || deleteLoading}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm || loading || modalLoading || deleteLoading}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Error display */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Courses Table */}
      {!loading && !modalLoading && !deleteLoading && (
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
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  {courses.length === 0
                    ? "No courses found"
                    : "No matching courses found"}
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.course_id}>
                  <td>{course.course_id}</td>
                  <td>{course.course_name}</td>
                  <td>{course.class}</td>
                  <td>{course.ut}</td>
                  <td>{course.insem}</td>
                  <td>{course.endsem}</td>
                  <td>{course.finalsem}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateClick(course)}
                      disabled={modalLoading || deleteLoading}
                    >
                      Update
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(course.course_id)}
                      disabled={modalLoading || deleteLoading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Update Course Modal */}
      <Modal
        show={showModal}
        onHide={() => !modalLoading && setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Course ID</Form.Label>
              <Form.Control
                type="text"
                name="course_id"
                value={formData.course_id}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                isInvalid={!!errors.course_name}
                disabled={modalLoading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.course_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Class</Form.Label>
              <Form.Control
                as="select"
                name="class"
                value={formData.class}
                onChange={handleChange}
                disabled={modalLoading}
              >
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </Form.Control>
            </Form.Group>

            {["ut", "insem", "endsem"].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{field.toUpperCase()}</Form.Label>
                <Form.Control
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  isInvalid={!!errors[field]}
                  disabled={modalLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[field]}
                </Form.Control.Feedback>
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>Final Semester</Form.Label>
              <Form.Control
                type="text"
                name="finalsem"
                value={formData.finalsem}
                readOnly
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpdateSubmit}
            disabled={modalLoading}
          >
            {modalLoading ? "Updating..." : "Update Course"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        size="sm" // Added size="sm" to make the modal smaller
      >
        <Modal.Header closeButton className="bg-primary text-white">
          {" "}
          {/* Changed bg-danger to bg-primary */}
          <Modal.Title style={{ fontSize: "1.1rem" }}>
            Confirm Deletion
          </Modal.Title>{" "}
          {/* Adjusted font size */}
        </Modal.Header>
        <Modal.Body style={{ padding: "1rem" }}>
          {" "}
          {/* Reduced padding */}
          <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            {" "}
            {/* Adjusted font size and spacing */}
            Are you sure you want to delete this course?
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: "0" }}>
            {" "}
            {/* Adjusted font size and spacing */}
            <strong>This action cannot be undone.</strong>
          </p>
        </Modal.Body>
        <Modal.Footer style={{ padding: "0.75rem" }}>
          {" "}
          {/* Reduced padding */}
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
            size="sm" // Added size="sm" for smaller button
            style={{ fontSize: "0.8rem" }} // Adjusted font size
          >
            Cancel
          </Button>
          <Button
            variant="danger" // Kept danger variant for the delete button
            onClick={confirmDelete}
            disabled={deleteLoading}
            size="sm" // Added size="sm" for smaller button
            style={{ fontSize: "0.8rem" }} // Adjusted font size
          >
            {deleteLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UpdateCourses;
