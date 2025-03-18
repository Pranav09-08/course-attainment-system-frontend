import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

const CourseCoordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [facultyList, setFacultyList] = useState([]);

  const fetchAllottedCoordinators = async () => {
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
        setCoordinators(response.data);
      } else {
        throw new Error("No course coordinators found.");
      }
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      setError(
        err.response?.data?.msg || err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllottedCoordinators();
  }, []);

  const handleUpdateClick = (coordinator) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const deptId = storedUser?.user?.id; // Use `id` instead of `dept_id`

    console.log("Selected Coordinator:", { ...coordinator, dept_id: deptId }); // Debugging

    setSelectedCoordinator({ ...coordinator, dept_id: deptId }); // Set `dept_id` in state
    setShowModal(true); // Open the modal
  };

  const fetchFaculties = async () => {
    console.log(
      "Fetching faculties for department ID:",
      selectedCoordinator?.dept_id
    ); // Debugging

    if (!selectedCoordinator?.dept_id) {
      console.error("Department ID is missing in selectedCoordinator"); // Debugging
      return;
    }

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
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${selectedCoordinator.dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Faculties API Response:", response.data); // Debugging

      if (Array.isArray(response.data)) {
        setFacultyList(response.data);
      } else {
        console.error("Unexpected API response format:", response.data); // Debugging
        setFacultyList([]);
        setError("No faculty members found.");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError("Failed to fetch faculty list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, academicYr, sem) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this course coordinator?");
  
    if (!isConfirmed) {
      return; // Abort if the user clicks "Cancel"
    }
  
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
      const response = await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/delete-course-coordinator/${courseId}/${academicYr}/${sem}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("✅ Course Coordinator deleted successfully:", response.data);
      alert("✅ Course Coordinator Deleted Successfully!");
      await fetchAllottedCoordinators(); // Refresh the list of course coordinators
    } catch (error) {
      console.error("❌ Error deleting course coordinator:", error);
      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete course coordinator"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyChange = (e) => {
    const selectedFacultyId = e.target.value;
    const selectedFaculty = facultyList.find(
      (faculty) => faculty.faculty_id === parseInt(selectedFacultyId)
    );

    setSelectedCoordinator((prev) => ({
      ...prev,
      faculty_id: selectedFaculty?.faculty_id || "",
      faculty_name: selectedFaculty?.name || "", // Use `name` instead of `faculty_name`
    }));
  };

  const handleUpdate = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to update the faculty for this course coordinator?"
    );

    if (!isConfirmed) {
      return; // Abort if the user clicks "Cancel"
    }

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
      const { course_id, academic_yr, sem, faculty_id } = selectedCoordinator;

      // Make the API call
      const response = await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/update-course-coordinator/${course_id}/${academic_yr}/${sem}`,
        { faculty_id }, // Send only faculty_id in the request body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Faculty updated successfully:", response.data);
      alert("✅ Course Coordinator Updated Successfully!");
      setShowModal(false); // Close the modal
      await fetchAllottedCoordinators(); // Refresh the list of course coordinators
    } catch (error) {
      console.error(
        "❌ Error updating faculty:",
        error.response?.data?.error || error.message
      );
      setError(error.response?.data?.error || "Failed to update faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center text-primary mb-4">📌 Course Coordinators</h2>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : coordinators.length === 0 ? (
        <p className="text-muted text-center">No course coordinators found.</p>
      ) : (
        <Row className="g-4">
          {coordinators.map((coordinator) => (
            <Col md={6} lg={4} key={coordinator.course_id}>
              <Card className="shadow-lg p-3">
                <Card.Body>
                  <h5 className="text-primary font-weight-bold mb-2">
                    {coordinator.course_name}
                  </h5>
                  <hr />
                  <Card.Text>
                    <strong>Course ID:</strong> {coordinator.course_id} <br />
                    <strong>Faculty ID:</strong> {coordinator.faculty_id} <br />
                    <strong>Faculty Name:</strong> {coordinator.faculty_name}{" "}
                    <br />
                    <strong>Class:</strong> {coordinator.class} <br />
                    <strong>Semester:</strong> {coordinator.sem} <br />
                    <strong>Academic Year:</strong> {coordinator.academic_yr}
                  </Card.Text>

                  <Button
                    variant="primary"
                    onClick={() => handleUpdateClick(coordinator)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleDelete(
                        coordinator.course_id,
                        coordinator.academic_yr,
                        coordinator.sem
                      )
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Update Modal */}
      {selectedCoordinator && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          onShow={fetchFaculties}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Course Coordinator</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Faculty</Form.Label>
                <Form.Select
                  name="faculty_id"
                  value={selectedCoordinator.faculty_id}
                  onChange={handleFacultyChange}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.faculty_id} - {faculty.name}{" "}
                      {/* Include faculty name */}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Update"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default CourseCoordinators;
