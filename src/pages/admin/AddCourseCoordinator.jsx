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
} from "react-bootstrap";

const AddCourseAllotment = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    faculty_id: "",
    class: "",
    sem: "",
    academic_yr: "",
    dept_id: "",
  });

  const getCurrentAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5; // 5 years before current year
    const endYear = currentYear + 5; // 5 years after current year

    let years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user) {
      setFormData((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const payload = {
      ...formData,
      course_id: String(formData.course_id),
      faculty_id: Number(formData.faculty_id),
      academic_yr: Number(formData.academic_yr),
    };

    try {
      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/coordinator/add-course-coordinator",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Course Coordinator Allotted Successfully!");
      setFormData({
        course_id: "",
        faculty_id: "",
        class: "",
        sem: "",
        academic_yr: "",
        dept_id: storedUser?.user?.id || "",
      });
    } catch (error) {
      setError(
        error.response?.data?.details ||
          "Error allotting course-coordinator. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-4">
      <Card style={{ width: "40rem" }} className="shadow-lg p-4">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            📚Allot Course Coordinators
          </Card.Title>

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
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                  >
                    <option value="">Select Class</option>

                    {/* FE Class */}
                    <option value="FE">FE</option>

                    {/* SE, TE, BE Classes based on dept_id */}
                    {formData.dept_id === 1 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`SE${i + 1}`} value={`SE${i + 1}`}>
                          {`SE${i + 1}`}
                        </option>
                      ))}
                    {formData.dept_id === 2 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`SE${i + 5}`} value={`SE${i + 5}`}>
                          {`SE${i + 5}`}
                        </option>
                      ))}
                    {formData.dept_id === 3 &&
                      [...Array(3)].map((_, i) => (
                        <option key={`SE${i + 9}`} value={`SE${i + 9}`}>
                          {`SE${i + 9}`}
                        </option>
                      ))}
                    {formData.dept_id === 4 && (
                      <option value="SE12">SE12</option>
                    )}
                    {formData.dept_id === 5 && (
                      <option value="SE13">SE13</option>
                    )}

                    {formData.dept_id === 1 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`TE${i + 1}`} value={`TE${i + 1}`}>
                          {`TE${i + 1}`}
                        </option>
                      ))}
                    {formData.dept_id === 2 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`TE${i + 5}`} value={`TE${i + 5}`}>
                          {`TE${i + 5}`}
                        </option>
                      ))}
                    {formData.dept_id === 3 &&
                      [...Array(3)].map((_, i) => (
                        <option key={`TE${i + 9}`} value={`TE${i + 9}`}>
                          {`TE${i + 9}`}
                        </option>
                      ))}
                    {formData.dept_id === 4 && (
                      <option value="TE12">TE12</option>
                    )}
                    {formData.dept_id === 5 && (
                      <option value="TE13">TE13</option>
                    )}

                    {formData.dept_id === 1 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`BE${i + 1}`} value={`BE${i + 1}`}>
                          {`BE${i + 1}`}
                        </option>
                      ))}
                    {formData.dept_id === 2 &&
                      [...Array(4)].map((_, i) => (
                        <option key={`BE${i + 5}`} value={`BE${i + 5}`}>
                          {`BE${i + 5}`}
                        </option>
                      ))}
                    {formData.dept_id === 3 &&
                      [...Array(3)].map((_, i) => (
                        <option key={`BE${i + 9}`} value={`BE${i + 9}`}>
                          {`BE${i + 9}`}
                        </option>
                      ))}
                    {formData.dept_id === 4 && (
                      <option value="BE12">BE12</option>
                    )}
                    {formData.dept_id === 5 && (
                      <option value="BE13">BE13</option>
                    )}
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
                  >
                    <option value="">Select Semester</option>
                    <option value="Even">EVEN</option>
                    <option value="Odd">ODD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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
