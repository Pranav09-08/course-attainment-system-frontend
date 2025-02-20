import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, InputGroup, FormControl, Modal } from 'react-bootstrap';

const UploadMarks = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(""); 
  const [selectedSemester, setSelectedSemester] = useState(""); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [csvFile, setCsvFile] = useState(null); // Store selected CSV file
  const [selectedMarkType, setSelectedMarkType] = useState(""); // Store selected mark type (UT1, UT2, etc.)
  const [loadingUpload, setLoadingUpload] = useState(false); // Show loading state during upload
  const [successMessage, setSuccessMessage] = useState(""); // Success message after upload
  const [selectedCourse, setSelectedCourse] = useState({});
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { accessToken, user } = storedUser || {};
  const { id: user_id } = user || {};

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_URL = `http://localhost:5001/faculty_courses/faculty_course_allot/${user_id}`;
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

  const years = [...new Set(userData.map(course => course.academic_yr))];
  const semesters = [...new Set(userData.map(course => course.sem))];

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  
  const handleAddMarks = (course_id, academic_yr, sem) => {
    setSelectedCourse({ course_id, academic_yr, sem });
    setShowModal(true);
  };
  

  const handleMarkTypeChange = (e) => {
    setSelectedMarkType(e.target.value);
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUploadCsv = async () => {
    if (!csvFile || !selectedMarkType || !selectedCourse.course_id) {
      alert("Please select a mark type and upload a CSV file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("markType", selectedMarkType);
    formData.append("academic_yr", selectedCourse.academic_yr);
    formData.append("course_id", selectedCourse.course_id);
    formData.append("sem", selectedCourse.sem);
  
    setLoadingUpload(true);
  
    try {
      const response = await axios.post("http://localhost:5001/add_marks/upload_marks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
  
      setSuccessMessage("Marks successfully updated!");
    } catch (err) {
      console.error("Error uploading CSV file:", err);
      setSuccessMessage("Failed to update marks.");
    } finally {
      setLoadingUpload(false);
      setShowModal(false);
    }
  };
  
  
  

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Add Marks
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
          onChange={(e) => setSelectedYear(e.target.value)} >
          <option value="">Select Academic Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>

        <Form.Select 
          className="w-25 mx-2" 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)} >
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

                  {/* "Add Marks" button */}
                  <Button 
                    onClick={() => handleAddMarks(course.course_id, course.academic_yr, course.sem)} 
                    variant="outline-primary" 
                    className="me-3">
                    Add Marks
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for CSV Upload */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Marks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="markType">
            <Form.Label>Select Exam Type</Form.Label>
            <Form.Control as="select" onChange={handleMarkTypeChange}>
              <option value="">Select Exam Type</option>
              <option value="UT1">UT1</option>
              <option value="UT2">UT2</option>
              <option value="UT3">UT3</option>
              <option value="Insem">In-semester</option>
              <option value="Final">Final Exam</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="csvFile" className="mt-3">

            <Form.Label>Upload CSV File</Form.Label>
            <Form.Control type="file" accept=".csv" onChange={handleCsvChange} />
          </Form.Group>

          {successMessage && <div className="mt-3 text-success">{successMessage}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadCsv} 
            disabled={loadingUpload}>
            {loadingUpload ? 'Uploading...' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UploadMarks;
