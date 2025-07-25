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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

/**
 * AddCourseAllotment Component - Allows administrators to allot courses to faculty members
 * 
 * Features:
 * - Dynamic form with dependent dropdowns (class type affects division options)
 * - Multiple division selection for TE/BE classes
 * - Academic year auto-generation
 * - Responsive layout with validation
 * - Toast notifications for success/error feedback
 */
const AddCourseAllotment = () => {
  // State management
  const [courses, setCourses] = useState([]); // Available courses
  const [faculty, setFaculty] = useState([]); // Faculty members
  const [formData, setFormData] = useState({
    course_id: "",
    faculty_id: "",
    class_type: "",
    class: "",
    sem: "",
    academic_yr: "",
    dept_id: "",
  });
  const [selectedDivisions, setSelectedDivisions] = useState([]); // For TE/BE multiple divisions
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Set department ID from logged-in user on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user) {
      setFormData((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);


  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // Generate academic years for current year and previous 5 years
    for (let i = 0; i <= 5; i++) {
      const year1 = currentYear - i;
      const year2 = year1 + 1;
      years.push(`${year1}_${year2.toString().slice(-2)}`);
    }

    return years;
  };

  // Fetch available courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      if (!token) {
        showToast('error', "Unauthorized: Please log in again.");
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
          showToast('info', "No courses found.");
        }
      } catch (err) {
        showToast('error', "Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch faculty when department ID changes
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!formData.dept_id) return;
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      if (!token) {
        showToast('error', "Unauthorized: Please log in again.");
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
        showToast('error', "Failed to fetch faculty.");
      }
    };

    fetchFaculty();
  }, [formData.dept_id]);

  /**
   * Handles form field changes
   * param {Object} e - Change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === "class_type" && { class: "" }), // Reset class when type changes
    });

    if (name === "class_type") {
      setSelectedDivisions([]); // Reset divisions when class type changes
    }
  };

  /**
   * Adds a division to the selected divisions list
   * param {Object} e - Change event from division select
   */
  const handleDivisionSelect = (e) => {
    const division = e.target.value;
    if (division && !selectedDivisions.includes(division)) {
      setSelectedDivisions([...selectedDivisions, division]);
    }
  };

  /**
   * Removes a division from the selected divisions list
   * param {string} divisionToRemove - Division to remove
   */
  const removeDivision = (divisionToRemove) => {
    setSelectedDivisions(
      selectedDivisions.filter((div) => div !== divisionToRemove)
    );
  };

  /**
   * Handles form submission
   * param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast('error', "Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    // Validate TE/BE divisions
    if (
      (formData.class_type === "TE" || formData.class_type === "BE") &&
      selectedDivisions.length === 0
    ) {
      showToast('error', "Please select at least one division");
      setLoading(false);
      return;
    }

    // Determine which divisions to process
    const divisionsToProcess =
      formData.class_type === "TE" || formData.class_type === "BE"
        ? selectedDivisions
        : [formData.class];

    try {
      // Create allotment requests for each division
      const requests = divisionsToProcess.map((division) => {
        const payload = {
          course_id: formData.course_id,
          faculty_id: formData.faculty_id,
          class_type: formData.class_type,
          class: division,
          sem: formData.sem,
          academic_yr: formData.academic_yr,
          dept_id: formData.dept_id,
        };

        return axios.post(
          "https://teacher-attainment-system-backend.onrender.com/admin/allotment/add-course-allotment",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      await Promise.all(requests);
      showToast('success', "Course Allotment Successful!");
      
      // Reset form on success
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
      showToast('error',
        error.response?.data?.details ||
          "Error allotting course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates division options based on class type and department
   * @returns {Array} Array of React option elements
   */
  const renderDivisionOptions = () => {
    if (!formData.class_type)
      return <option value="">Select Class Type first</option>;

    if (formData.class_type === "FE") {
      return <option value="FE">FE</option>;
    }

    const divisions = [];
    const prefix = formData.class_type;

    // Department-specific division mapping
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Card style={{ width: "40rem" }} className="shadow-lg p-4">
        <Card.Body>
          <Card.Title className="text-center mb-3">📚 Allot Course</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Course Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Select Course</Form.Label>
              <Form.Select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_id} - {course.course_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Faculty Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Select Faculty</Form.Label>
              <Form.Select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Faculty</option>
                {faculty.map((fac) => (
                  <option key={fac.faculty_id} value={fac.faculty_id.toString()}>
                    {fac.faculty_id} - {fac.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Class Type and Division Selection */}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Class Type</Form.Label>
                  <Form.Select
                    name="class_type"
                    value={formData.class_type}
                    onChange={handleChange}
                    required
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
                  {formData.class_type === "TE" || formData.class_type === "BE" ? (
                    <>
                      {/* Multiple division selection for TE/BE */}
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
                          <small className="text-muted">
                            Selected Divisions:
                          </small>
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {selectedDivisions.map((division) => (
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
                                  style={{ fontSize: "0.5rem" }}
                                  onClick={() => removeDivision(division)}
                                ></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Single division selection for FE/SE
                    <Form.Select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      disabled={!formData.class_type}
                      required
                    >
                      <option value="">Select Division</option>
                      {renderDivisionOptions()}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Semester and Academic Year Selection */}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    name="sem"
                    value={formData.sem}
                    onChange={handleChange}
                    required
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
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {getAcademicYearOptions().map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Submit Button */}
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