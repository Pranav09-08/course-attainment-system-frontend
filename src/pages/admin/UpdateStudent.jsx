import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Form,
  InputGroup,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Modal,
  Alert,
} from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

const UpdateStudent = () => {
  // State variables
  const [allStudents, setAllStudents] = useState([]); // All students loaded from API
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered list based on user input
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSem, setSelectedSem] = useState("ALL");
  const [loading, setLoading] = useState(true); // Page loading state
  const [operationLoading, setOperationLoading] = useState(false); // Operations (refresh/update) loading
  const [error, setError] = useState(null);

  // Modal related states
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // User & auth info from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const department_id = storedUser?.user?.id || "";
  const token = storedUser?.accessToken;

  // Generate last 5 academic years for dropdown
  const generateAcademicYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 5; i++) {
      const year = currentYear - i;
      years.push(`${year}_${(year + 1).toString().slice(-2)}`);
    }
    return years;
  };

  const academicYears = generateAcademicYears();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    academicYears[0]
  );

  // Validate name format (only letters and spaces, min 2 chars)
  const validateName = (name) => /^[A-Za-z\s]{2,}$/.test(name);

  // Fetch student data when department or academic year changes
  useEffect(() => {
    if (department_id) {
      fetchAllStudents();
    }
  }, [department_id, selectedAcademicYear]);

  // Fetch students for both odd and even semester
  const fetchAllStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oddSemResponse, evenSemResponse] = await Promise.all([
        axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/student/get-students`,
          {
            params: {
              dept_id: department_id,
              sem: "ODD",
              academic_yr: selectedAcademicYear,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `https://teacher-attainment-system-backend.onrender.com/admin/student/get-students`,
          {
            params: {
              dept_id: department_id,
              sem: "EVEN",
              academic_yr: selectedAcademicYear,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      const combinedStudents = [
        ...(oddSemResponse.data || []),
        ...(evenSemResponse.data || []),
      ];

      setAllStudents(combinedStudents);
      setFilteredStudents(combinedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast(
        "error",
        error.response?.data?.error ||
          "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on class, semester, and search
  useEffect(() => {
    let filtered = [...allStudents];

    if (selectedClass) {
      filtered = filtered.filter(
        (student) => student.class.toUpperCase() === selectedClass.toUpperCase()
      );
    }

    if (selectedSem !== "ALL") {
      filtered = filtered.filter(
        (student) => student.sem.toUpperCase() === selectedSem
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.roll_no.toString().toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  }, [selectedClass, selectedSem, searchTerm, allStudents]);

  // Reset filters
  const resetFilters = () => {
    setSelectedClass("");
    setSelectedSem("ALL");
    setSearchTerm("");
  };

  // Refresh student data from API
  const handleRefresh = async () => {
    setOperationLoading(true);
    await fetchAllStudents();
    setOperationLoading(false);
    showToast("info", "Data refreshed");
  };

  // Change selected academic year
  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
    resetFilters();
  };

  // Open modal for editing a student
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Handle student update API call
  const handleUpdateStudent = async () => {
    setOperationLoading(true);
    try {
      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/student/update-student/${selectedStudent.roll_no}`,
        {
          ...selectedStudent,
          sem: selectedStudent.sem,
          academic_yr: selectedAcademicYear,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Student updated successfully!");
      fetchAllStudents();
      setShowModal(false);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error updating student:", error);
      showToast(
        "error",
        error.response?.data?.error || "Failed to update student"
      );
    } finally {
      setOperationLoading(false);
    }
  };

  // Validate before showing confirmation modal
  const handleUpdateClick = () => {
    if (!selectedStudent.name || !selectedStudent.roll_no) {
      showToast("warning", "Name and Roll No are required");
      return;
    }

    if (!validateName(selectedStudent.name)) {
      showToast(
        "warning",
        "Name should contain only letters and spaces (minimum 2 characters)"
      );
      return;
    }

    setShowConfirmation(true);
  };

  // Determine elective columns visibility based on selected class
  const showElective1 = !selectedClass || ["TE", "BE"].includes(selectedClass);
  const showElective2 = !selectedClass || selectedClass === "BE";

  return (
  <Container fluid className="p-4" style={{ position: "relative", minHeight: "80vh" }}>
    {/* Toast Container */}
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    <LoaderPage loading={loading} />

    <h2 className="text-center text-primary mb-4">Update Students</h2>

    {error && (
      <Alert variant="danger" onClose={() => setError(null)} dismissible>
        {error}
      </Alert>
    )}

    {/* Academic Year Selection */}
    <Row className="mb-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Academic Year</Form.Label>
          <Form.Control
            as="select"
            value={selectedAcademicYear}
            onChange={handleAcademicYearChange}
            disabled={loading}
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Col>
      <Col md={8} className="d-flex align-items-end justify-content-end">
        <Button
          variant="primary"
          onClick={handleRefresh}
          disabled={loading || operationLoading}
          className="me-2"
        >
          {operationLoading ? (
            <>
              <Spinner as="span" size="sm" animation="border" />
              <span className="ms-2">Refreshing...</span>
            </>
          ) : (
            "Refresh Data"
          )}
        </Button>
      </Col>
    </Row>

    {/* Filters Section */}
    <Row className="mb-4 g-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Class</Form.Label>
          <Form.Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading}
          >
            <option value="">All Classes</option>
            <option value="FE">FE</option>
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Semester</Form.Label>
          <Form.Select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            disabled={loading}
          >
            <option value="ALL">All Semesters</option>
            <option value="ODD">ODD</option>
            <option value="EVEN">EVEN</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Search</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Name or Roll No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm || loading}
            >
              Clear
            </Button>
          </InputGroup>
        </Form.Group>
      </Col>
    </Row>

    {/* Reset Button */}
    <Row className="mb-3">
      <Col className="text-end">
        <Button
          variant="warning"
          onClick={resetFilters}
          disabled={loading || (!selectedClass && selectedSem === "ALL" && !searchTerm)}
        >
          Reset Filters
        </Button>
      </Col>
    </Row>

    {/* Students Count */}
    <Row className="mb-3">
      <Col>
        <h5 className="text-secondary">
          Showing: <span className="text-primary">{filteredStudents.length}</span> students
          {allStudents.length !== filteredStudents.length && (
            <span className="text-muted"> (of {allStudents.length} total)</span>
          )}
        </h5>
      </Col>
    </Row>

    {/* Students Table */}
    {!loading && (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Seat No</th>
              <th>Semester</th>
              {showElective1 && <th>Elective 1</th>}
              {showElective2 && <th>Elective 2</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={`${student.roll_no}-${student.sem}`}>
                  <td>{student.roll_no}</td>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.seat_no || "-"}</td>
                  <td>{student.sem.toUpperCase()}</td>
                  {showElective1 && <td>{student.el1 || "-"}</td>}
                  {showElective2 && <td>{student.el2 || "-"}</td>}
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditClick(student)}
                      disabled={operationLoading}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6 + (showElective1 ? 1 : 0) + (showElective2 ? 1 : 0)} className="text-center">
                  {allStudents.length === 0 ? "No students found" : "No matching students found"}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    )}

    {/* Update Student Modal */}
    <Modal show={showModal} onHide={() => !operationLoading && setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Update Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedStudent && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Roll No</Form.Label>
              <Form.Control type="text" value={selectedStudent.roll_no} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={selectedStudent.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                    setSelectedStudent({
                      ...selectedStudent,
                      name: value,
                    });
                  }
                }}
                isInvalid={selectedStudent.name && !validateName(selectedStudent.name)}
                disabled={operationLoading}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid name (letters and spaces only, minimum 2 characters)
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Seat No</Form.Label>
              <Form.Control
                type="text"
                value={selectedStudent.seat_no || ""}
                onChange={(e) => setSelectedStudent({
                  ...selectedStudent,
                  seat_no: e.target.value,
                })}
                disabled={operationLoading}
              />
            </Form.Group>

            {(selectedStudent.class === "TE" || selectedStudent.class === "BE") && (
              <Form.Group className="mb-3">
                <Form.Label>Elective 1</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.el1 || ""}
                  onChange={(e) => setSelectedStudent({
                    ...selectedStudent,
                    el1: e.target.value,
                  })}
                  disabled={operationLoading}
                />
              </Form.Group>
            )}

            {selectedStudent.class === "BE" && (
              <Form.Group className="mb-3">
                <Form.Label>Elective 2</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.el2 || ""}
                  onChange={(e) => setSelectedStudent({
                    ...selectedStudent,
                    el2: e.target.value,
                  })}
                  disabled={operationLoading}
                />
              </Form.Group>
            )}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowModal(false)}
          disabled={operationLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdateClick}
          disabled={operationLoading || !validateName(selectedStudent?.name)}
        >
          {operationLoading ? (
            <>
              <Spinner as="span" size="sm" animation="border" />
              <span className="ms-2">Updating...</span>
            </>
          ) : (
            "Update"
          )}
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Confirmation Modal */}
    <Modal
      show={showConfirmation}
      onHide={() => !operationLoading && setShowConfirmation(false)}
      size="sm"
    >
      <Modal.Header
        closeButton
        className="bg-primary text-white"
        style={{ padding: "0.75rem 1rem" }}
      >
        <Modal.Title style={{ fontSize: "1.1rem" }}>Confirm Update</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "1rem", fontSize: "0.95rem" }}>
        Are you sure you want to update this student's details?
      </Modal.Body>

      <Modal.Footer style={{ padding: "0.75rem" }}>
        <Button
          variant="outline-secondary"
          onClick={() => setShowConfirmation(false)}
          disabled={operationLoading}
          size="sm"
          style={{ fontSize: "0.85rem", minWidth: "80px" }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdateStudent}
          disabled={operationLoading}
          size="sm"
          style={{ fontSize: "0.85rem", minWidth: "100px" }}
        >
          {operationLoading ? (
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

export default UpdateStudent;
