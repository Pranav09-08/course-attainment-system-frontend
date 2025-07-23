import React, { useState, useEffect } from "react";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage"; // Corrected import path
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast"; // Import toast function

import {
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";

/**
 * AddCourseCoordinator Component - Allows administrators to allot course coordinators to courses
 * 
 * Features:
 * - Dynamic form with course and faculty dropdowns
 * - Auto-populated academic year options
 * - Department-specific faculty loading
 * - Toast notifications for user feedback
 * - Loading states for better UX
 * - Responsive layout with validation
 */
const AddCourseAllotment = () => {
  // State management
  const [courses, setCourses] = useState([]); // Stores list of available courses
  const [faculty, setFaculty] = useState([]); // Stores list of faculty members
  const [formData, setFormData] = useState({
    course_id: "",
    faculty_id: "",
    class: "",
    sem: "",
    academic_yr: "",
    dept_id: "",
  });
  const [loading, setLoading] = useState(false); // For initial data loading
  const [operationLoading, setOperationLoading] = useState(false); // For form submission
  const [error, setError] = useState(""); // Error message storage

  /**
   * Generates current and previous academic years in format "YYYY_YY"
   * @returns {Array} Array of academic year strings
   */
  const getCurrentAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    // Generate academic years for current year and previous 5 years
    for (let i = 0; i <= 5; i++) {
      const year1 = currentYear - i;
      const year2 = year1 + 1;
      years.push(`${year1}_${year2.toString().slice(-2)}`);
    }

    return years.reverse(); // Returns years from oldest to latest
  };

  // Set department ID from logged-in user on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user) {
      setFormData((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);

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
        showToast('info', "Failed to fetch faculty.");
      }
    };

    fetchFaculty();
  }, [formData.dept_id]);

  /**
   * Handles form field changes
   * @param {Object} e - Change event from form inputs
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for course coordinator allotment
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast('error', "Unauthorized: Please log in again.");
      setOperationLoading(false);
      return;
    }

    // Prepare payload with stringified values
    const payload = {
      ...formData,
      course_id: String(formData.course_id),
      faculty_id: String(formData.faculty_id),
      academic_yr: String(formData.academic_yr),
    };

    try {
      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/coordinator/add-course-coordinator",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast('success', "Course Coordinator Allotted Successfully!");
      
      // Reset form on success
      setFormData({
        course_id: "",
        faculty_id: "",
        class: "",
        sem: "",
        academic_yr: "",
        dept_id: storedUser?.user?.id || "",
      });
    } catch (error) {
      showToast('error',
        error.response?.data?.details ||
          "Error allotting course-coordinator. Please try again."
      );
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-4" style={{ position: "relative" }}>
      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Full-page loader for both initial loading and form submission */}
      <LoaderPage loading={loading || operationLoading} />

      <Card style={{ width: "40rem" }} className="shadow-lg p-4">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            📚 Allot Course Coordinators
          </Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && (
            <Form onSubmit={handleSubmit}>
              {/* Course Selection Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Select Course</Form.Label>
                <Form.Select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  disabled={operationLoading}
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

              {/* Faculty Selection Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Select Faculty</Form.Label>
                <Form.Select
                  name="faculty_id"
                  value={formData.faculty_id}
                  onChange={handleChange}
                  disabled={operationLoading}
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((fac) => (
                    <option key={fac.faculty_id} value={fac.faculty_id}>
                      {fac.faculty_id} - {fac.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Class and Semester Selection */}
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      disabled={operationLoading}
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="FE">FE</option>
                      <option value="SE">SE</option>
                      <option value="TE">TE</option>
                      <option value="BE">BE</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Semester</Form.Label>
                    <Form.Select
                      name="sem"
                      value={formData.sem}
                      onChange={handleChange}
                      disabled={operationLoading}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="Even">EVEN</option>
                      <option value="Odd">ODD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Academic Year Selection */}
              <Form.Group className="mb-3">
                <Form.Label>Academic Year</Form.Label>
                <Form.Select
                  name="academic_yr"
                  value={formData.academic_yr}
                  onChange={handleChange}
                  disabled={operationLoading}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {getCurrentAcademicYears().map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Submit Button with loading state */}
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddCourseAllotment;