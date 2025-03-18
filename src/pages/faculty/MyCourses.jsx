import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, InputGroup, FormControl, Modal } from 'react-bootstrap';

const Uploadmarks = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(""); 
  const [selectedSemester, setSelectedSemester] = useState(""); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [attainmentData, setAttainmentData] = useState(null); // State to store attainment data
  const [loadingAttainment, setLoadingAttainment] = useState(false); // Loading state for attainment data

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { accessToken, user } = storedUser || {};
  const { id: user_id } = user || {};

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_URL = `https://teacher-attainment-system-backend.onrender.com/faculty_courses/faculty_course_allot/${user_id}`;
        const response = await axios.get(API_URL);
        setUserData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching faculty course data:", err);
        setError("Failed to fetch course allotment data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_id, accessToken]);

  useEffect(() => {
    let filtered = [...userData];
    
    if (selectedYear) {
      filtered = filtered.filter(course => course.academic_yr === selectedYear);
    }
    
    if (selectedSemester) {
      filtered = filtered.filter(course => course.sem === selectedSemester);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        (course.course_name && course.course_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.course_id && course.course_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredData(filtered);
  }, [selectedYear, selectedSemester, searchTerm, userData]);

  // Function to handle the "View Attainment" button click
  const handleViewAttainment = async (courseId, academic_yr,dept_id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

      setLoadingAttainment(true);
      const response = await  axios
      .get(`https://teacher-attainment-system-backend.onrender.com/attainment/attainment-data?course_id=${courseId}&academic_yr=${academic_yr}&dept_id=${dept_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttainmentData(response.data.attainment);
      setShowModal(true); // Open the modal when data is fetched
    } catch (error) {
      console.error("Error fetching attainment data:", error);
      setError("Failed to fetch attainment data.");
    } finally {
      setLoadingAttainment(false);
    }
  };

  const years = [...new Set(userData.map(course => course.academic_yr))];
  const semesters = [...new Set(userData.map(course => course.sem))];

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Course Allotment
      </h2>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-4">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Search by Course Name or ID"
            aria-label="Search"
            aria-describedby="basic-addon2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary" id="button-addon2">
            Search
          </Button>
        </InputGroup>
      </div>

      {/* Filter UI */}
      <div className="d-flex justify-content-center mb-4">
        <Form.Select 
          className="w-25 mx-2" 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">Select Academic Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>

        <Form.Select 
          className="w-25 mx-2" 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)}>
          <option value="">Select Semester</option>
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </Form.Select>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-muted text-center">No courses found.</p>
      ) : (
        <div className="row justify-content-center">
          {filteredData.map((course) => (
            <div key={course.course_id} className="col-md-6 mb-4">
              <div className="card shadow-sm" style={{ minHeight: "300px", padding: "15px" }}>
                <div className="card-body p-3">
                  <h5 className="card-title text-primary mb-2" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    Course Details
                  </h5>
                  <p className="card-text"><strong>Course Name:</strong> {course.course_name}</p>
                  <p className="card-text"><strong>Course ID:</strong> {course.course_id}</p>
                  <p className="card-text"><strong>Class:</strong> {course.class}</p>
                  <p className="card-text"><strong>Semester:</strong> {course.sem}</p>
                  <p className="card-text"><strong>Department:</strong> {course.dept_name} | <strong>Academic Year:</strong> {course.academic_yr}</p>

                  <Button 
                    onClick={() => handleViewAttainment(course.course_id, course.academic_yr,course.dept_id)} 
                    variant="outline-primary" 
                    className="me-3">
                    View Attainment
                  </Button>
                  <Button variant="outline-secondary">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for displaying attainment data */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attainment Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingAttainment ? (
            <div>Loading attainment data...</div>
          ) : attainmentData ? (
            <div>
              <p><strong>Course ID:</strong> {attainmentData.course_id}</p>
              <p><strong>Department ID:</strong> {attainmentData.dept_id}</p>
              <p><strong>Academic Year:</strong> {attainmentData.academic_yr}</p>
              <p><strong>UT Attainment:</strong> {attainmentData.ut_attainment}</p>
              <p><strong>Insem Attainment:</strong> {attainmentData.insem_attainment}</p>
              <p><strong>Endsem Attainment:</strong> {attainmentData.endsem_attainment}</p>
              <p><strong>Final Attainment:</strong> {attainmentData.final_attainment}</p>
              <p><strong>Total Attainment:</strong> {attainmentData.total}</p>
            </div>
          ) : (
            <p>No attainment data available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Uploadmarks;
