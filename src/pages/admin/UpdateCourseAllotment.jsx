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
  const [facultyList, setFacultyList] = useState([]);

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

  const handleUpdateClick = async (allotment) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const deptId = storedUser?.user?.id; // Use `id` instead of `dept_id`

    console.log("Selected Allotment:", { ...allotment, dept_id: deptId }); // Debugging

    setSelectedAllotment({ ...allotment, dept_id: deptId }); // Set `dept_id` in state

    // Fetch faculties before opening the modal
    setLoading(true);
    try {
      await fetchFaculties(); // Wait for faculties to be fetched
      setShowModal(true); // Open the modal after fetching faculties
    } catch (error) {
      console.error("Error fetching faculties:", error);
      setError("Failed to fetch faculty list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    if (!selectedAllotment?.dept_id) {
      console.error("Department ID is missing in selectedAllotment"); // Debugging
      return;
    }

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
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${selectedAllotment.dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Faculties API Response:", response.data); // Debugging

      if (Array.isArray(response.data)) {
        setFacultyList(response.data);
      } else {
        console.error("Unexpected API response format:", response.data); // Debugging
        setFacultyList([]);
        setError("No faculty members found.");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError("Failed to fetch faculty list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyChange = (e) => {
    const selectedFacultyId = e.target.value;
    const selectedFaculty = facultyList.find(
      (faculty) => faculty.faculty_id === parseInt(selectedFacultyId)
    );

    setSelectedAllotment((prev) => ({
      ...prev,
      faculty_id: selectedFaculty?.faculty_id || "",
      faculty_name: selectedFaculty?.name || "", // Use `name` instead of `faculty_name`
    }));
  };

  const handleDeleteClick = async (allotment) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this course allotment?"
    );

    if (!isConfirmed) {
      return; // Abort if the user clicks "Cancel"
    }

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
      const { course_id, academic_yr, sem } = allotment;

      // Make the API call
      const response = await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/delete-course-allotment/${course_id}/${academic_yr}/${sem}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Course allotment deleted successfully:", response.data);
      alert("✅ Course Allotment Deleted Successfully!");
      fetchAllotments(); // Refresh the list of allotted courses
    } catch (error) {
      console.error(
        "❌ Error deleting course allotment:",
        error.response?.data?.error || error.message
      );
      setError(
        error.response?.data?.error || "Failed to delete course allotment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to update the faculty for this course allotment?"
    );

    if (!isConfirmed) {
      return; // Abort if the user clicks "Cancel"
    }

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
      const { course_id, academic_yr, sem, faculty_id } = selectedAllotment;

      // Make the API call
      const response = await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/allotment/update-course-allotment/${course_id}/${academic_yr}/${sem}`,
        { faculty_id }, // Send only faculty_id in the request body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Faculty updated successfully:", response.data);
      alert("✅ Course Allotment Updated Successfully!");
      setShowModal(false); // Close the modal
      fetchAllotments(); // Refresh the list of allotted courses
    } catch (error) {
      console.error(
        "❌ Error updating faculty:",
        error.response?.data?.error || error.message
      );
      setError(error.response?.data?.error || "Failed to update faculty");
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
                    className="ms-2" // Add margin to separate from the "Update" button
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
      {selectedAllotment && facultyList.length > 0 && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.faculty_id} - {faculty.name}{" "}
                      {/* Include faculty name */}
                    </option>
                  ))}
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