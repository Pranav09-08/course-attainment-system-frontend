import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Badge,
} from "react-bootstrap";

const AddCourseAllotment = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    faculty_id: "",
    class_type: "",
    class: "",
    sem: "",
    academic_yr: "",
    dept_id: "",
  });
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user) {
      setFormData((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);

  const getCurrentAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }

    return years.reverse();
  };

  useEffect(() => {
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

        if (Array.isArray(response.data) && response.data.length > 0) {
          setCourses(response.data);
        } else {
          setError("No courses found.");
        }
      } catch (err) {
        setError("Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!formData.dept_id) return;
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      if (!token) {
        setError("Unauthorized: Please log in again.");
        return;
      }

      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${formData.dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFaculty(response.data);
      } catch (err) {
        setError("Failed to fetch faculty.");
      }
    };

    fetchFaculty();
  }, [formData.dept_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value,
      // Reset divisions when class_type changes
      ...(name === "class_type" && { class: "" }) 
    });
    
    if (name === "class_type") {
      setSelectedDivisions([]);
    }
  };

  const handleDivisionSelect = (e) => {
    const division = e.target.value;
    if (division && !selectedDivisions.includes(division)) {
      setSelectedDivisions([...selectedDivisions, division]);
    }
  };

  const removeDivision = (divisionToRemove) => {
    setSelectedDivisions(selectedDivisions.filter(div => div !== divisionToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    // Validate at least one division is selected for TE/BE
    if ((formData.class_type === "TE" || formData.class_type === "BE") && selectedDivisions.length === 0) {
      setError("Please select at least one division");
      setLoading(false);
      return;
    }

    // For FE/SE, use the single class value
    const divisionsToProcess = (formData.class_type === "TE" || formData.class_type === "BE") 
      ? selectedDivisions 
      : [formData.class];

    try {
      const requests = divisionsToProcess.map(division => {
        const payload = {
          course_id: String(formData.course_id),
          faculty_id: Number(formData.faculty_id),
          class_type: formData.class_type,
          class: division,
          sem: formData.sem,
          academic_yr: Number(formData.academic_yr),
          dept_id: formData.dept_id,
        };

        return axios.post(
          "https://teacher-attainment-system-backend.onrender.com/admin/allotment/add-course-allotment",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      await Promise.all(requests);
      alert("✅ Course Allotment Successful!");
      setFormData({
        course_id: "",
        faculty_id: "",
        class_type: "",
        class: "",
        sem: "",
        academic_yr: "",
        dept_id: storedUser?.user?.id || "",
      });
      setSelectedDivisions([]);
    } catch (error) {
      setError(
        error.response?.data?.details ||
          "Error allotting course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDivisionOptions = () => {
    if (!formData.class_type) return <option value="">Select Class Type first</option>;
    
    if (formData.class_type === "FE") {
      return <option value="FE">FE</option>;
    }

    // For SE/TE/BE, show divisions based on department
    const divisions = [];
    const prefix = formData.class_type; // SE, TE, or BE

    if (formData.dept_id === 1) {
      for (let i = 1; i <= 4; i++) {
        divisions.push(`${prefix}${i}`);
      }
    } else if (formData.dept_id === 2) {
      for (let i = 5; i <= 8; i++) {
        divisions.push(`${prefix}${i}`);
      }
    } else if (formData.dept_id === 3) {
      for (let i = 9; i <= 11; i++) {
        divisions.push(`${prefix}${i}`);
      }
    } else if (formData.dept_id === 4) {
      divisions.push(`${prefix}12`);
    } else if (formData.dept_id === 5) {
      divisions.push(`${prefix}13`);
    }

    return divisions.map((division) => (
      <option key={division} value={division}>
        {division}
      </option>
    ));
  };

  return (
    <Container className="d-flex justify-content-center mt-4">
      <Card style={{ width: "40rem" }} className="shadow-lg p-4">
        <Card.Body>
          <Card.Title className="text-center mb-3">📚 Allot Course</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Course</Form.Label>
              <Form.Select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_id} - {course.course_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Faculty</Form.Label>
              <Form.Select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
              >
                <option value="">Select Faculty</option>
                {faculty.map((fac) => (
                  <option key={fac.faculty_id} value={fac.faculty_id}>
                    {fac.faculty_id} - {fac.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Class Type</Form.Label>
                  <Form.Select
                    name="class_type"
                    value={formData.class_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Class Type</option>
                    <option value="FE">FE</option>
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Division</Form.Label>
                  {(formData.class_type === "TE" || formData.class_type === "BE") ? (
                    <>
                      <Form.Select
                        name="class"
                        value=""
                        onChange={handleDivisionSelect}
                        disabled={!formData.class_type}
                      >
                        <option value="">Select Division to Add</option>
                        {renderDivisionOptions()}
                      </Form.Select>
                      {selectedDivisions.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Selected Divisions:</small>
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {selectedDivisions.map(division => (
                              <Badge 
                                key={division} 
                                bg="primary"
                                className="d-flex align-items-center"
                              >
                                {division}
                                <button 
                                  type="button" 
                                  className="btn-close btn-close-white ms-2" 
                                  aria-label="Close"
                                  style={{ fontSize: '0.5rem' }}
                                  onClick={() => removeDivision(division)}
                                ></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Form.Select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      disabled={!formData.class_type}
                    >
                      <option value="">Select Division</option>
                      {renderDivisionOptions()}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    name="sem"
                    value={formData.sem}
                    onChange={handleChange}
                  >
                    <option value="">Select Semester</option>
                    <option value="EVEN">EVEN</option>
                    <option value="ODD">ODD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
                  <Form.Select
                    name="academic_yr"
                    value={formData.academic_yr}
                    onChange={handleChange}
                  >
                    <option value="">Select Academic Year</option>
                    {getCurrentAcademicYears().map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddCourseAllotment;