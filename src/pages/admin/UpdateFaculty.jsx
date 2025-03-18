import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Table, Alert, Spinner, InputGroup, Container, Row, Col } from "react-bootstrap";
import "../../styles/SeeFaculty.css";

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]); // Original faculty list
  const [filteredFacultyList, setFilteredFacultyList] = useState([]); // Filtered faculty list
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [errors, setErrors] = useState({}); // State for validation errors

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser;
  const { id: dept_id } = user;
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
        setFilteredFacultyList(response.data); // Initialize filtered list with all faculty
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to load faculty list.");
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, [dept_id, token]);

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setErrors({}); // Clear previous errors when opening the modal
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedFaculty((prevFaculty) => ({
      ...prevFaculty,
      [name]: value,
    }));

    // Validate input on change
    validateField(name, value);
  };

  // Validation function
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

  // Validate all fields before submission
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
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (!token) {
      window.alert("No token found, please login!");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/admin/update-faculty/${selectedFaculty.faculty_id}`,
        {
          name: selectedFaculty.name,
          email: selectedFaculty.email,
          mobile_no: selectedFaculty.mobile_no,
          dept_id: dept_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Update response:", response);
      window.alert("Faculty details updated successfully!");
      setShowModal(false);

      // Refetch the faculty list after successful update
      const fetchFacultyList = async () => {
        try {
          const response = await axios.get(
            `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setFacultyList(response.data);
          setFilteredFacultyList(response.data); // Update the filtered list as well
        } catch (error) {
          console.error("Error fetching faculty list:", error);
          window.alert("Failed to refresh faculty list.");
        }
      };

      fetchFacultyList(); // Call the function to refetch the list
    } catch (error) {
      console.error("Error updating faculty:", error.response?.data || error.message);
      window.alert(`Failed to update faculty: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  const handleDelete = async (facultyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this faculty?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/delete-faculty/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refetch the faculty list after successful deletion
      const fetchFacultyList = async () => {
        try {
          const response = await axios.get(
            `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setFacultyList(response.data);
          setFilteredFacultyList(response.data); // Update the filtered list as well
          alert("Faculty deleted successfully!");
        } catch (error) {
          console.error("Error fetching faculty list:", error);
          alert("Failed to refresh faculty list after deletion.");
        }
      };

      fetchFacultyList(); // Call the function to refetch the list
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty.");
    }
  };

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
      ) : (
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
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleFacultySelect(faculty)}>
                      Update
                    </Button>{" "}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(faculty.faculty_id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
              />
              <Form.Control.Feedback type="invalid">
                {errors.mobile_no}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Update Faculty
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageFaculty;