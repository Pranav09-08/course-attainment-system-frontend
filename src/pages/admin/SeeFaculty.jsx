import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Table, Container, Spinner, Alert, Form, InputGroup, Button } from "react-bootstrap";

const SeeFaculty = () => {
  const [facultyList, setFacultyList] = useState([]); // Original faculty list
  const [filteredFacultyList, setFilteredFacultyList] = useState([]); // Filtered faculty list
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser;
  const { id: dept_id } = user;

  useEffect(() => {
    const token = storedUser?.accessToken;
    if (!token) {
      setMessage("No token found, please login!");
      setLoading(false);
      return;
    }

    const fetchFacultyList = async () => {
      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`
        );
        console.log("Faculty list fetched:", response.data);
        setFacultyList(response.data);
        setFilteredFacultyList(response.data); // Initialize filtered list with all faculty
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to load faculty list.");
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, [dept_id]);

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter faculty list based on search term
    const filtered = facultyList.filter(
      (faculty) =>
        faculty.faculty_id.toString().includes(term) || // Search by faculty_id
        faculty.name.toLowerCase().includes(term.toLowerCase()) // Search by name
    );

    setFilteredFacultyList(filtered);
  };

  return (
    <Container fluid className="p-4">
      <h2 className="text-center text-primary mb-4">Faculty List</h2>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Faculty ID or Name"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading faculty list...</p>
        </div>
      ) : message ? (
        <Alert variant="danger" className="text-center">
          {message}
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacultyList.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No faculty found matching your search.
                </td>
              </tr>
            ) : (
              filteredFacultyList.map((faculty) => (
                <tr key={faculty.faculty_id}>
                  <td>{faculty.faculty_id}</td>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>{faculty.mobile_no}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SeeFaculty;