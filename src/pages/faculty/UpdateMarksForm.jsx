import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Table, Button, Modal, Form, Row, Col, InputGroup, FormControl } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateMarksForm = () => {
  const location = useLocation();
  const { course } = location.state || {};
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]); // For search functionality
  const [searchTerm, setSearchTerm] = useState(""); // For search bar
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [marks, setMarks] = useState({
    u1_co1: "",
    u1_co2: "",
    u2_co3: "",
    u2_co4: "",
    u3_co5: "",
    u3_co6: "",
    i_co1: "",
    i_co2: "",
    end_sem: "",
  });

  useEffect(() => {
    if (course) {
      fetchStudents();
    }
  }, [course]);

  // Fetch students based on class, dept_id, and academic_yr
  const fetchStudents = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/get_student/students",
        {
          class: course.class,
          dept_id: course.dept_id,
          academic_yr: course.academic_yr,
        }
      );
      setStudents(response.data);
      setFilteredStudents(response.data); // Initialize filtered students
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students.");
    }
  };

  // Fetch marks for a specific student and course
  const fetchStudentMarks = async (roll_no) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/update/marks/get_marks/${roll_no}/${course.course_id}/${course.dept_id}/${course.academic_yr}`
      );
      if (response.data) {
        setMarks(response.data);
      }
    } catch (error) {
      console.error("Error fetching marks:", error);
      toast.error("Failed to fetch marks.");
    }
  };

  // Handle opening the modal and fetching marks
  const handleUpdateMarks = (student) => {
    setSelectedStudent(student);
    fetchStudentMarks(student.roll_no);
    setShowModal(true);
  };

  // Handle updating marks
  const handleSaveMarks = async () => {
    // Validate marks
    const validationErrors = [];
    const utMarks = [marks.u1_co1, marks.u1_co2, marks.u2_co3, marks.u2_co4, marks.u3_co5, marks.u3_co6];
    const insemMarks = [marks.i_co1, marks.i_co2];
    const endSemMark = marks.end_sem;

    // Validate UT and In-semester marks (0-15 or "AB")
    utMarks.forEach((mark, index) => {
      if (mark !== "AB" && (isNaN(mark) || mark < 0 || mark > 15)) {
        validationErrors.push(`UT${Math.floor(index / 2) + 1} CO${(index % 2) + 1} must be between 0 and 15 or "AB".`);
      }
    });

    insemMarks.forEach((mark, index) => {
      if (mark !== "AB" && (isNaN(mark) || mark < 0 || mark > 15)) {
        validationErrors.push(`In-sem CO${index + 1} must be between 0 and 15 or "AB".`);
      }
    });

    // Validate End-semester mark (0-70 or "AB")
    if (endSemMark !== "AB" && (isNaN(endSemMark) || endSemMark < 0 || endSemMark > 70)) {
      validationErrors.push("End-semester marks must be between 0 and 70 or 'AB'.");
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    // Update marks
    try {
      await axios.post(
        `http://localhost:5001/update/marks/update_marks/${selectedStudent.roll_no}/${course.course_id}/${course.dept_id}/${course.academic_yr}`,
        marks
      );
      toast.success("Marks updated successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error updating marks:", error);
      toast.error("Failed to update marks.");
    }
  };

  // Handle search by roll_no
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter(
      (student) => student.roll_no.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Update Marks for {course.course_name}
      </h2>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Roll No"
            aria-label="Search"
            aria-describedby="basic-addon2"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="outline-secondary" id="button-addon2">
            Search
          </Button>
        </InputGroup>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.roll_no}>
              <td>{student.roll_no}</td>
              <td>{student.name}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateMarks(student)}
                >
                  Update Marks
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Marks for {selectedStudent?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Roll No</Form.Label>
                  <Form.Control type="text" value={selectedStudent?.roll_no} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={selectedStudent?.name} readOnly />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course ID</Form.Label>
                  <Form.Control type="text" value={course.course_id} readOnly />
                </Form.Group>
              </Col>
            </Row>

            {/* UT1 Marks */}
            <div className="mb-4 p-3 border rounded">
              <h5 className="mb-3">UT1 Marks</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT1 CO1</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u1_co1}
                      onChange={(e) => setMarks({ ...marks, u1_co1: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT1 CO2</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u1_co2}
                      onChange={(e) => setMarks({ ...marks, u1_co2: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* UT2 Marks */}
            <div className="mb-4 p-3 border rounded">
              <h5 className="mb-3">UT2 Marks</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT2 CO3</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u2_co3}
                      onChange={(e) => setMarks({ ...marks, u2_co3: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT2 CO4</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u2_co4}
                      onChange={(e) => setMarks({ ...marks, u2_co4: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* UT3 Marks */}
            <div className="mb-4 p-3 border rounded">
              <h5 className="mb-3">UT3 Marks</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT3 CO5</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u3_co5}
                      onChange={(e) => setMarks({ ...marks, u3_co5: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UT3 CO6</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.u3_co6}
                      onChange={(e) => setMarks({ ...marks, u3_co6: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* In-semester Marks */}
            <div className="mb-4 p-3 border rounded">
              <h5 className="mb-3">In-semester Marks</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>In-sem CO1</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.i_co1}
                      onChange={(e) => setMarks({ ...marks, i_co1: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>In-sem CO2</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.i_co2}
                      onChange={(e) => setMarks({ ...marks, i_co2: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* End-semester Marks */}
            <div className="mb-4 p-3 border rounded">
              <h5 className="mb-3">End-semester Marks</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End-sem</Form.Label>
                    <Form.Control
                      type="text"
                      value={marks.end_sem}
                      onChange={(e) => setMarks({ ...marks, end_sem: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveMarks}>
            Update Marks
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdateMarksForm;