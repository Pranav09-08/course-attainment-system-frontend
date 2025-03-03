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
  Spinner,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";

const UpdateCourseAllotment = () => {
  const [allotments, setAllotments] = useState([]);
  const [selectedAllotment, setSelectedAllotment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSem, setSelectedSem] = useState("");

  useEffect(() => {
    fetchAllotments();
  }, []);

  const fetchAllotments = async () => {
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
        "https://teacher-attainment-system-backend.onrender.com/admin/allotment/get-allotted-courses",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (Array.isArray(response.data?.data)) {
        setAllotments(response.data.data);
      } else {
        setAllotments([]);
        setError("No course allotments found.");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch course allotments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (allotment) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const deptId = storedUser?.user?.dept_id;

    setSelectedAllotment({ ...allotment, dept_id: deptId });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAllotment((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
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
      const updatedAllotment = {
        ...selectedAllotment,
        dept_id: storedUser?.user?.dept_id,
      };

      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/update-course-allotment/${selectedAllotment.id}`,
        updatedAllotment,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Course Allotment Updated Successfully!");
      setShowModal(false);
      fetchAllotments();
    } catch (error) {
      setError("Error updating allotment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Unique Years & Semesters for Filtering
  const uniqueYears = [
    ...new Set(allotments.map((course) => course.academic_yr)),
  ];
  const uniqueSems = [...new Set(allotments.map((course) => course.sem))];

  // Filtered Courses
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
    <Container className="mt-4">
      <h2 className="text-center text-primary mb-4">📌 Allotted Courses</h2>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Course Name or ID"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary">Search</Button>
        </InputGroup>
      </div>

      {/* Filter UI */}
      <div className="d-flex justify-content-center mb-4">
        <Form.Select
          className="w-25 mx-2"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
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
        >
          <option value="">Select Semester</option>
          {uniqueSems.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredCourses.length === 0 ? (
        <p className="text-muted text-center">
          No courses match your criteria.
        </p>
      ) : (
        <Row className="g-4">
          {filteredCourses.map((allotment) => (
            <Col md={6} lg={4} key={allotment.id}>
              <Card className="shadow-lg p-3">
                <Card.Body>
                  <h5 className="text-primary font-weight-bold mb-2">
                    {allotment.course_name}
                  </h5>
                  <hr />
                  <Card.Text>
                    <strong>Course ID:</strong> {allotment.course_id} <br />
                    <strong>Faculty ID:</strong> {allotment.faculty_id} <br />
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
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Update Modal */}
      {selectedAllotment && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Course Allotment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Class</Form.Label>
                <Form.Select
                  name="class"
                  value={selectedAllotment.class}
                  onChange={handleChange}
                >
                  {/* FE Class */}
                  <option value="FE">FE</option>

                  {/* SE, TE, BE Classes based on dept_id */}
                  {FormData.dept_id === 1 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`SE${i + 1}`} value={`SE${i + 1}`}>
                        {`SE${i + 1}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 2 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`SE${i + 5}`} value={`SE${i + 5}`}>
                        {`SE${i + 5}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 3 &&
                    [...Array(3)].map((_, i) => (
                      <option key={`SE${i + 9}`} value={`SE${i + 9}`}>
                        {`SE${i + 9}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 4 && (
                    <option value="SE12">SE12</option>
                  )}
                  {selectedAllotment.dept_id === 5 && (
                    <option value="SE13">SE13</option>
                  )}

                  {selectedAllotment.dept_id === 1 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`TE${i + 1}`} value={`TE${i + 1}`}>
                        {`TE${i + 1}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 2 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`TE${i + 5}`} value={`TE${i + 5}`}>
                        {`TE${i + 5}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 3 &&
                    [...Array(3)].map((_, i) => (
                      <option key={`TE${i + 9}`} value={`TE${i + 9}`}>
                        {`TE${i + 9}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 4 && (
                    <option value="TE12">TE12</option>
                  )}
                  {selectedAllotment.dept_id === 5 && (
                    <option value="TE13">TE13</option>
                  )}

                  {selectedAllotment.dept_id === 1 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`BE${i + 1}`} value={`BE${i + 1}`}>
                        {`BE${i + 1}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 2 &&
                    [...Array(4)].map((_, i) => (
                      <option key={`BE${i + 5}`} value={`BE${i + 5}`}>
                        {`BE${i + 5}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 3 &&
                    [...Array(3)].map((_, i) => (
                      <option key={`BE${i + 9}`} value={`BE${i + 9}`}>
                        {`BE${i + 9}`}
                      </option>
                    ))}
                  {selectedAllotment.dept_id === 4 && (
                    <option value="BE12">BE12</option>
                  )}
                  {selectedAllotment.dept_id === 5 && (
                    <option value="BE13">BE13</option>
                  )}
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

export default UpdateCourseAllotment;
