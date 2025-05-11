import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Table, Alert, InputGroup, Container, Row, Col } from "react-bootstrap";
import "../../styles/SeeFaculty.css";
import LoaderPage from "../../components/LoaderPage"; // Adjust path as needed

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFacultyList, setFilteredFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false); // For update/delete operations
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser || {};
  const { id: dept_id } = user || {};
  const token = storedUser?.accessToken;

  useEffect(() => {
    if (!token) {
      setMessage("No token found, please login!");
      setLoading(false);
      return;
    }

    const fetchFacultyList = async () => {
      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFacultyList(response.data);
        setFilteredFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to load faculty list.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, [dept_id, token]);

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedFaculty((prevFaculty) => ({
      ...prevFaculty,
      [name]: value,
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "name":
        if (!/^[A-Za-z\s]+$/.test(value)) {
          errorMessage = "Name should contain only alphabets and spaces.";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Please enter a valid email address.";
        }
        break;
      case "mobile_no":
        if (!/^\d{10}$/.test(value)) {
          errorMessage = "Mobile number should contain exactly 10 digits.";
        }
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^[A-Za-z\s]+$/.test(selectedFaculty?.name || "")) {
      newErrors.name = "Name should contain only alphabets and spaces.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{3,}$/.test(selectedFaculty?.email || "")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(selectedFaculty?.mobile_no || "")) {
      newErrors.mobile_no = "Mobile number should contain exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!token) {
      window.alert("No token found, please login!");
      return;
    }

    setOperationLoading(true);
    try {
      await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/update-faculty/${selectedFaculty.faculty_id}`,
        {
          name: selectedFaculty.name,
          email: selectedFaculty.email,
          mobile_no: selectedFaculty.mobile_no,
          dept_id: dept_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.alert("Faculty details updated successfully!");
      setShowModal(false);

      // Refetch faculty list
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFacultyList(response.data);
      setFilteredFacultyList(response.data);
    } catch (error) {
      console.error("Error updating faculty:", error);
      window.alert(`Failed to update faculty: ${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this faculty?");
    if (!confirmDelete) return;

    setOperationLoading(true);
    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/delete-faculty/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refetch faculty list
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFacultyList(response.data);
      setFilteredFacultyList(response.data);
      alert("Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty.");
    } finally {
      setOperationLoading(false);
    }
  };

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
      {/* Loader for initial loading and operations */}
      <LoaderPage loading={loading || operationLoading} />

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

      {message && <Alert variant="danger" className="text-center">{message}</Alert>}

      {!loading && !operationLoading && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacultyList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  {facultyList.length === 0 ? "No faculty found" : "No matching faculty found"}
                </td>
              </tr>
            ) : (
              filteredFacultyList.map((faculty) => (
                <tr key={faculty.faculty_id}>
                  <td>{faculty.faculty_id}</td>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>{faculty.mobile_no || "N/A"}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleFacultySelect(faculty)}
                      disabled={operationLoading}
                    >
                      Update
                    </Button>{" "}
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(faculty.faculty_id)}
                      disabled={operationLoading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => !operationLoading && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedFaculty?.name || ""}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
                disabled={operationLoading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={selectedFaculty?.email || ""}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
                disabled={operationLoading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
                type="text"
                name="mobile_no"
                value={selectedFaculty?.mobile_no || ""}
                onChange={handleInputChange}
                isInvalid={!!errors.mobile_no}
                disabled={operationLoading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.mobile_no}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={operationLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleUpdate}
            disabled={operationLoading}
          >
            {operationLoading ? "Updating..." : "Update Faculty"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageFaculty;