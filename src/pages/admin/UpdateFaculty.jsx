import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Table,
  Alert,
  InputGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import "../../styles/SeeFaculty.css";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../components/Toast";
import "react-toastify/dist/ReactToastify.css";

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFacultyList, setFilteredFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser || {};
  const { id: dept_id } = user || {};
  const token = storedUser?.accessToken;

  useEffect(() => {
    if (!token) {
      showToast("error", "Unauthorized: Please log in again");
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
        showToast("error", "Failed to load faculty list.");
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
      showToast("error", "No token found, please login!");
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

      showToast("success", "Faculty details updated successfully!");
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
      showToast(
        "error",
        `Failed to update faculty: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteClick = (facultyId) => {
    setFacultyToDelete(facultyId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    setDeleteLoading(true);
    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/delete-faculty/${facultyToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refetch faculty list
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFacultyList(response.data);
      setFilteredFacultyList(response.data);
      showToast("success", "Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      showToast("error", "Failed to delete faculty.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setFacultyToDelete(null);
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
    <Container
      fluid
      className="p-4"
      style={{ position: "relative", minHeight: "80vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <LoaderPage loading={loading || operationLoading || deleteLoading} />

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
              disabled={loading || operationLoading || deleteLoading}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              disabled={
                loading || operationLoading || deleteLoading || !searchTerm
              }
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

      {!loading && !operationLoading && !deleteLoading && (
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
                  {facultyList.length === 0
                    ? "No faculty found"
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
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleFacultySelect(faculty)}
                      disabled={operationLoading || deleteLoading}
                    >
                      Update
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(faculty.faculty_id)}
                      disabled={operationLoading || deleteLoading}
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

      {/* Update Faculty Modal */}
      <Modal
        show={showModal}
        onHide={() => !operationLoading && setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
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
            variant="primary"
            onClick={handleUpdate}
            disabled={operationLoading}
          >
            {operationLoading ? "Updating..." : "Update Faculty"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        size="sm" // Makes the modal more compact
        // centered // Centers the modal vertically
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white" // Changed to primary color
          style={{ padding: "0.75rem 1rem" }} // Tighter padding
        >
          <Modal.Title style={{ fontSize: "1.1rem" }}>
            {" "}
            {/* Adjusted font size */}
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1rem" }}>
          {" "}
          {/* Reduced padding */}
          <p style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>
            {" "}
            {/* Adjusted typography */}
            Are you sure you want to delete this faculty member?
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>
            {" "}
            {/* Danger color for warning */}
            <strong>This action cannot be undone.</strong>
          </p>
        </Modal.Body>

        <Modal.Footer style={{ padding: "0.75rem" }}>
          {" "}
          {/* Tighter footer padding */}
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
            size="sm" // Smaller button
            style={{ fontSize: "0.85rem", minWidth: "80px" }} // Consistent sizing
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteLoading}
            size="sm" // Smaller button
            style={{ fontSize: "0.85rem", minWidth: "100px" }} // Consistent sizing
          >
            {deleteLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Deleting...
              </>
            ) : (
              "Delete" // Shortened from "Confirm Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageFaculty;
