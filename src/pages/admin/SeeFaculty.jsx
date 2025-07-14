import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Table, Container, Alert, Form, InputGroup, Button } from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from 'react-toastify';
import { showToast } from '../../components/Toast'; // Your custom toast function
import 'react-toastify/dist/ReactToastify.css'; // Default toast styles

const SeeFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFacultyList, setFilteredFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser || {};
  const { id: dept_id } = user || {};

  useEffect(() => {
    const token = storedUser?.accessToken;
    if (!token) {
      showToast('error','Unauthorized: Please Log in again');
      setLoading(false);
      return;
    }

    const fetchFacultyList = async () => {
      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setFacultyList(response.data);
        setFilteredFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        showToast('error',error.response?.data?.message || "Failed to load faculty list.");
      } finally {
        setLoading(false);
      }
    };

    if (dept_id) {
      fetchFacultyList();
    }
  }, [dept_id, storedUser]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = facultyList.filter(
      (faculty) =>
        faculty.faculty_id.toString().includes(term) ||
        faculty.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredFacultyList(filtered);
  };

  return (
    <Container fluid className="p-4" style={{ position: "relative", minHeight: "80vh" }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* Loader positioned absolutely within the container */}
      <LoaderPage loading={loading} />

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
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {message && (
        <Alert variant="danger" className="text-center">
          {message}
        </Alert>
      )}

      {!loading && (
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
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
                <td colSpan="4" className="text-center text-muted">
                  {facultyList.length === 0 
                    ? "No faculty members found" 
                    : "No matching faculty found"}
                </td>
              </tr>
            ) : (
              filteredFacultyList.map((faculty) => (
                <tr key={faculty.faculty_id}>
                  <td>{faculty.faculty_id}</td>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>{faculty.mobile_no || "N/A"}</td>
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