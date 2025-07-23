import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

const UpdateCourseAllotment = () => {
  const [allotments, setAllotments] = useState([]);
  const [selectedAllotment, setSelectedAllotment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [facultyList, setFacultyList] = useState([]);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [allotmentToDelete, setAllotmentToDelete] = useState(null);

  useEffect(() => {
    fetchAllotments();
  }, []);

  useEffect(() => {
    if (selectedAllotment?.dept_id) {
      fetchFaculties();
    }
  }, [selectedAllotment]);

  const fetchAllotments = async () => {
    setLoading(true);
    setError("");
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = storedUser?.accessToken;
    const dept_id = storedUser?.user?.id;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/get-allotted-courses/${dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(response.data?.data)) {
        setAllotments(response.data.data);
      } else {
        setAllotments([]);
        showToast("error", "No course allotments found.");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      showToast(
        "error",
        "Failed to fetch course allotments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (allotment) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const deptId = storedUser?.user?.id;
    setSelectedAllotment({
      ...allotment,
      dept_id: deptId,
      originalFacultyId: allotment.faculty_id,
    });
    setShowModal(true);
  };

  const fetchFaculties = async () => {
    if (!selectedAllotment?.dept_id) return;

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
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${selectedAllotment.dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(response.data)) {
        setFacultyList(response.data);
      } else {
        setFacultyList([]);
        showToast("error", "No faculty members found.");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      showToast("error", "Failed to fetch faculty list. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleFacultyChange = (e) => {
    const selectedFacultyId = e.target.value;
    const selectedFaculty = facultyList.find(
      (faculty) => faculty.faculty_id === selectedFacultyId
    );

    setSelectedAllotment((prev) => ({
      ...prev,
      faculty_id: selectedFaculty?.faculty_id || "",
      faculty_name: selectedFaculty?.name || "",
    }));
  };

  const handleDeleteClick = (allotment) => {
    setAllotmentToDelete(allotment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!allotmentToDelete) return;

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
      const { course_id, academic_yr, sem } = allotmentToDelete;

      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/delete-course-allotment/${course_id}/${academic_yr}/${sem}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Course Allotment Deleted Successfully!");
      fetchAllotments();
    } catch (error) {
      console.error("Error deleting course allotment:", error);
      showToast(
        "error",
        error.response?.data?.error || "Failed to delete course allotment"
      );
    } finally {
      setModalLoading(false);
      setShowDeleteConfirm(false);
      setAllotmentToDelete(null);
    }
  };

  const handleUpdate = () => {
    setShowUpdateConfirm(true);
  };

  const confirmUpdate = async () => {
    setShowUpdateConfirm(false);
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
      const {
        course_id,
        academic_yr,
        sem,
        faculty_id,
        class: className,
        dept_id,
        originalFacultyId,
      } = selectedAllotment;

      if (faculty_id === originalFacultyId) {
        showToast("info", "No changes detected");
        setShowModal(false);
        return;
      }

      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/update-course-allotment/${course_id}/${academic_yr}/${sem}`,
        {
          faculty_id,
          className,
          deptId: dept_id,
          existingFacultyId: originalFacultyId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", " Faculty updated successfully!");
      setShowModal(false);
      fetchAllotments();
    } catch (error) {
      console.error("Error updating faculty:", error);

      const msg = error.response?.data?.error;

      if (msg?.includes("exact course and class combination")) {
        showToast(
          "error",
          "This faculty is already assigned to this course and class."
        );
      } else if (msg?.includes("not found")) {
        showToast("error", "Original course allocation not found.");
      } else {
        showToast("error", msg || "Failed to update faculty");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const uniqueYears = [
    ...new Set(allotments.map((course) => course.academic_yr)),
  ];
  const uniqueSems = [...new Set(allotments.map((course) => course.sem))];

  const filteredCourses = allotments.filter((course) => {
    return (
      (searchTerm === "" ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedYear === "" || course.academic_yr === selectedYear) &&
      (selectedSem === "" || course.sem === selectedSem)
    );
  });

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

      <h2 className="text-center text-primary mb-4">
        📌Update Allotted Courses
      </h2>

      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Course Name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading || modalLoading}
          />
          <Button variant="outline-secondary" disabled>
            Search
          </Button>
        </InputGroup>
      </div>

      <div className="d-flex justify-content-center mb-4">
        <Form.Select
          className="w-25 mx-2"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={loading || modalLoading}
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
          disabled={loading || modalLoading}
        >
          <option value="">Select Semester</option>
          {uniqueSems.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </Form.Select>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !modalLoading && filteredCourses.length === 0 ? (
        <p className="text-muted text-center">
          No courses match your criteria.
        </p>
      ) : (
        <Row className="g-4">
          {filteredCourses.map((allotment) => (
            <Col md={6} lg={4} key={allotment.id}>
              <Card className="shadow-lg p-3 h-100">
                <Card.Body>
                  <h5 className="text-primary font-weight-bold mb-2">
                    {allotment.course_name}
                  </h5>
                  <hr />
                  <Card.Text>
                    <strong>Course ID:</strong> {allotment.course_id} <br />
                    <strong>Faculty ID:</strong> {allotment.faculty_id} <br />
                    <strong>Faculty Name:</strong> {allotment.faculty_name}{" "}
                    <br />
                    <strong>Class:</strong> {allotment.class} <br />
                    <strong>Semester:</strong> {allotment.sem} <br />
                    <strong>Academic Year:</strong> {allotment.academic_yr}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateClick(allotment)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(allotment)}
                    className="ms-2"
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

      {/* Update Course Allotment Modal */}
      {selectedAllotment && (
        <Modal
          show={showModal}
          onHide={() => !modalLoading && setShowModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Course Allotment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Faculty</Form.Label>
                <Form.Select
                  name="faculty_id"
                  value={selectedAllotment.faculty_id}
                  onChange={handleFacultyChange}
                  disabled={modalLoading}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.faculty_id} - {faculty.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleUpdate}
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
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this course allotment?
          {allotmentToDelete && (
            <div className="mt-3">
              <strong>Course:</strong> {allotmentToDelete.course_name} (
              {allotmentToDelete.course_id})<br />
              <strong>Faculty:</strong> {allotmentToDelete.faculty_name} (
              {allotmentToDelete.faculty_id})
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={modalLoading}
          >
            {modalLoading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Confirmation Modal */}
      <Modal
        show={showUpdateConfirm}
        onHide={() => !modalLoading && setShowUpdateConfirm(false)}
        size="sm"
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white"
          style={{ padding: "0.75rem 1rem" }}
        >
          <Modal.Title style={{ fontSize: "1.1rem" }}>
            Confirm Update
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1rem", fontSize: "0.95rem" }}>
          Are you sure you want to update this faculty assignment?
        </Modal.Body>

        <Modal.Footer style={{ padding: "0.75rem" }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowUpdateConfirm(false)}
            disabled={modalLoading}
            size="sm"
            style={{ fontSize: "0.85rem", minWidth: "80px" }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmUpdate}
            disabled={modalLoading}
            size="sm"
            style={{ fontSize: "0.85rem", minWidth: "100px" }}
          >
            {modalLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UpdateCourseAllotment;
