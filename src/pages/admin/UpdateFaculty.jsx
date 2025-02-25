import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import "../../styles/SeeFaculty.css";

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  
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
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedFaculty((prevFaculty) => ({
      ...prevFaculty,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("No token found, please login!");
      return;
    }

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

      setMessage("Faculty details updated successfully!");
      setShowModal(false);
      setFacultyList((prevList) =>
        prevList.map((faculty) =>
          faculty.faculty_id === selectedFaculty.faculty_id ? selectedFaculty : faculty
        )
      );
    } catch (error) {
      console.error("Error updating faculty:", error);
      setMessage("Failed to update faculty details.");
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
      setFacultyList(facultyList.filter((faculty) => faculty.faculty_id !== facultyId));
      alert("Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty.");
    }
  };

  return (
    <div className="faculty-container">
      <h2 className="faculty-title">Faculty List</h2>

      {message && <Alert variant="warning">{message}</Alert>}
      {loading ? (
        <p className="text-center"><Spinner animation="border" /></p>
      ) : (
        <div className="table-container">
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((faculty) => (
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
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={selectedFaculty?.name || ""} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={selectedFaculty?.email || ""} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mobile No</Form.Label>
              <Form.Control type="text" name="mobile_no" value={selectedFaculty?.mobile_no || ""} onChange={handleInputChange} />
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
    </div>
  );
};

export default ManageFaculty;
