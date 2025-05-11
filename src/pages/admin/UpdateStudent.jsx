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
import LoaderPage from "../../components/LoaderPage"; // Adjust the path as needed

const UpdateStudent = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false); // For update operations
  const [studentCount, setStudentCount] = useState(0);

  const [academicYears, setAcademicYears] = useState([]);
  const [years, setYears] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const department_id = storedUser?.user?.id || "";

  useEffect(() => {
    if (department_id) {
      fetchStudents();
    }
  }, [department_id]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/admin/student/get-students?dept_id=${department_id}`
      );
      const studentsData = response.data;

      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Extract unique values for filters
      const uniqueAcademicYears = [...new Set(studentsData.map((student) => student.academic_yr))];
      const uniqueYears = [...new Set(studentsData.map((student) => student.class.slice(0, 2)))];
      const uniqueDivisions = [
        ...new Set(
          studentsData
            .filter((student) => !selectedYear || student.class.startsWith(selectedYear))
            .map((student) => student.class)
        ),
      ];
      setDivisions(uniqueDivisions);

      setAcademicYears(uniqueAcademicYears);
      setYears(uniqueYears);
      setDivisions(uniqueDivisions);
    } catch (error) {
      console.error("Error fetching students:", error);
      setAlert({
        show: true,
        message: "❌ Failed to fetch students. Please try again.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter students dynamically
  useEffect(() => {
    let filtered = students;

    if (selectedAcademicYear) {
      filtered = filtered.filter((student) => student.academic_yr === selectedAcademicYear);
    }
    if (selectedYear) {
      filtered = filtered.filter((student) => student.class.includes(selectedYear));
    }
    if (selectedDivision) {
      filtered = filtered.filter((student) => student.class.endsWith(selectedDivision));
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.roll_no.toString().includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
    setStudentCount(filtered.length);
  }, [selectedAcademicYear, selectedYear, selectedDivision, searchTerm, students]);

  // Reset filters
  const resetFilters = () => {
    setSelectedAcademicYear("");
    setSelectedYear("");
    setSelectedDivision("");
    setSearchTerm("");
  };

  // Handle opening the modal for editing a student
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setErrors({});
    setShowModal(true);
  };

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};

    // Validate name
    if (!/^[A-Za-z\s]+$/.test(selectedStudent.name)) {
      newErrors.name = "Name must contain only alphabets and spaces.";
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{3,}$/.test(selectedStudent.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(selectedStudent.mobile_no)) {
      newErrors.mobile_no = "Mobile number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle updating a student
  const handleUpdateStudent = async () => {
    setOperationLoading(true);
    try {
      const response = await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/student/update-student/${selectedStudent.roll_no}`,
        { ...selectedStudent, dept_id: department_id }
      );
      console.log("Student updated:", response.data);

      setAlert({ show: true, message: "✅ Student updated successfully!", variant: "success" });

      fetchStudents();
      setShowModal(false);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error updating student:", error);
      setAlert({
        show: true,
        message: "❌ Failed to update student. Please try again.",
        variant: "danger",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle update button click
  const handleUpdateClick = () => {
    if (validateInputs()) {
      setShowConfirmation(true);
    }
  };

  return (
    <Container fluid className="p-4" style={{ position: "relative", minHeight: "80vh" }}>
      {/* Loader for initial loading and operations */}
      <LoaderPage loading={loading || operationLoading} />

      <h2 className="text-center text-primary mb-4">See Students</h2>

      {/* Alert Popup */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      {/* Filters Section */}
      <Row className="mb-4 g-3 d-flex align-items-center">
        {/* Academic Year Filter */}
        <Col xs={12} sm={6} md={3}>
          <Form.Select 
            value={selectedAcademicYear} 
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            disabled={loading || operationLoading}
          >
            <option value="">All Academic Years</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Year Filter */}
        <Col xs={12} sm={6} md={3}>
          <Form.Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={loading || operationLoading}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Division Filter */}
        <Col xs={12} sm={6} md={3}>
          <Form.Select 
            value={selectedDivision} 
            onChange={(e) => setSelectedDivision(e.target.value)}
            disabled={loading || operationLoading}
          >
            <option value="">All Divisions</option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Search Bar */}
        <Col xs={12} sm={6} md={3}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Name or Roll No."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || operationLoading}
            />
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm("")}
              disabled={loading || operationLoading || !searchTerm}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Reset Filters Button */}
      <Row className="mb-3">
        <Col className="text-end">
          <Button 
            variant="warning" 
            onClick={resetFilters}
            disabled={loading || operationLoading}
          >
            Reset Filters
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <h5 className="text-secondary">
            Total Students: <span className="text-primary">{studentCount}</span>
          </h5>
        </Col>
      </Row>

      {/* Students Table */}
      {!loading && !operationLoading && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Class</th>
              <th>Academic Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.roll_no}>
                  <td>{student.roll_no}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.mobile_no}</td>
                  <td>{student.class}</td>
                  <td>{student.academic_yr}</td>
                  <td>
                    <Button 
                      variant="primary" 
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
                <td colSpan="7" className="text-center">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Update Student Modal */}
      <Modal show={showModal} onHide={() => !operationLoading && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateClick();
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.name}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, name: e.target.value })
                  }
                  isInvalid={!!errors.name}
                  disabled={operationLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, email: e.target.value })
                  }
                  isInvalid={!!errors.email}
                  disabled={operationLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.mobile_no}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, mobile_no: e.target.value })
                  }
                  isInvalid={!!errors.mobile_no}
                  disabled={operationLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.mobile_no}
                </Form.Control.Feedback>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={operationLoading}>
                {operationLoading ? "Updating..." : "Update"}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Confirmation Popup */}
      <Modal show={showConfirmation} onHide={() => !operationLoading && setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to update this student's details?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmation(false)}
            disabled={operationLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStudent}
            disabled={operationLoading}
          >
            {operationLoading ? "Updating..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UpdateStudent;