import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

const CourseCoordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const fetchAllottedCoordinators = async () => {
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
        setCoordinators(response.data);
      } else {
        throw new Error("No course coordinators found.");
      }
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      showToast(
        "error",
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
    const deptId = storedUser?.user?.id;
    setSelectedCoordinator({ ...coordinator, dept_id: deptId });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (courseId, academicYr, sem) => {
    setCourseToDelete({ courseId, academicYr, sem });
    setShowDeleteModal(true);
  };

  const fetchFaculties = async () => {
    if (!selectedCoordinator?.dept_id) {
      console.error("Department ID is missing in selectedCoordinator");
      return;
    }

    setModalLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again.");
      setModalLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${selectedCoordinator.dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(response.data)) {
        setFacultyList(response.data);
      } else {
        setFacultyList([]);
        showToast("info", "No faculty members found.");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      showToast("error", "Failed to fetch faculty list. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    setModalLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again.");
      setModalLoading(false);
      return;
    }

    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/delete-course-coordinator/${courseToDelete.courseId}/${courseToDelete.academicYr}/${courseToDelete.sem}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Course Coordinator Deleted Successfully!");
      await fetchAllottedCoordinators();
    } catch (error) {
      console.error("❌ Error deleting course coordinator:", error);
      showToast(
        "error",
        error.response?.data?.error || "Failed to delete course coordinator"
      );
    } finally {
      setModalLoading(false);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  const handleFacultyChange = (e) => {
    const selectedFacultyId = e.target.value;
    const selectedFaculty = facultyList.find(
      (faculty) => faculty.faculty_id.toString() === selectedFacultyId
    );

    setSelectedCoordinator((prev) => ({
      ...prev,
      faculty_id: selectedFacultyId,
      faculty_name: selectedFaculty?.name || "",
    }));
  };

  const confirmUpdate = async () => {
    if (!selectedCoordinator) return;

    setModalLoading(true);
    setError("");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again.");
      setModalLoading(false);
      return;
    }

    try {
      const { course_id, academic_yr, sem, faculty_id } = selectedCoordinator;

      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/coordinator/update-course-coordinator/${course_id}/${academic_yr}/${sem}`,
        { faculty_id: faculty_id.toString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Course Coordinator Updated Successfully!");
      setShowUpdateModal(false);
      await fetchAllottedCoordinators();
    } catch (error) {
      console.error("❌ Error updating faculty:", error);
      showToast(
        "error",
        error.response?.data?.error || "Failed to update faculty"
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Container
      className="mt-4"
      style={{ position: "relative", minHeight: "80vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <LoaderPage loading={loading || modalLoading} />

      <h2 className="text-center text-primary mb-4">📌 Course Coordinators</h2>

      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {!loading && coordinators.length === 0 ? (
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
                    disabled={modalLoading}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleDeleteClick(
                        coordinator.course_id,
                        coordinator.academic_yr,
                        coordinator.sem
                      )
                    }
                    style={{ marginLeft: "10px" }}
                    disabled={modalLoading}
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
          show={showUpdateModal}
          onHide={() => !modalLoading && setShowUpdateModal(false)}
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
                  value={selectedCoordinator.faculty_id?.toString()}
                  onChange={handleFacultyChange}
                  disabled={modalLoading}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option
                      key={faculty.faculty_id}
                      value={faculty.faculty_id.toString()}
                    >
                      {faculty.faculty_id} - {faculty.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button
                variant="primary"
                onClick={confirmUpdate}
                disabled={modalLoading}
              >
                {modalLoading ? "Updating..." : "Update"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !modalLoading && setShowDeleteModal(false)}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="lead">Are you sure you want to delete this course coordinator?</p>
          <p className="text-danger"><strong>This action cannot be undone.</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CourseCoordinators;