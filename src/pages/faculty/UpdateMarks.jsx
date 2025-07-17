import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from "react-toastify";
import { showToast } from "../../components/Toast"; // Import toast function
import { InputGroup, FormControl, Button, Form, Alert } from "react-bootstrap";

const UpdateMarks = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { accessToken, user } = storedUser || {};
  const { id: user_id } = user || {};

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_URL = `https://teacher-attainment-system-backend.onrender.com/marks/faculty_addmarks/${user_id}`;
        const response = await axios.get(API_URL);
        setUserData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching faculty course data:", err);
         showToast("error","No course found.");
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

  const handleUpdateMarks = (course) => {
    if (course.is_locked === 1) {
      toast.error("Cannot update marks. This course is locked.");
      return;
    }
    navigate("/faculty-dashboard/update-marks-form", { state: { course } });
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Update Marks
      </h2>

      <ToastContainer position="top-right" autoClose={3000} />

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
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Academic Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>

        <Form.Select 
          className="w-25 mx-2" 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
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
                  <p className="card-text"><strong>Department:</strong> {course.dept_name} </p>
                   <p className="card-text"><strong>Academic Year:</strong> {course.academic_yr}</p>
                  <Button 
                    onClick={() => handleUpdateMarks(course)} 
                    variant="outline-primary" 
                    className="me-3"
                    disabled={course.is_locked === 1}
                  >
                    Update Marks
                  </Button>
                  {course.is_locked === 1 && (
                    <Alert variant="warning" className="mt-3">
                      Marks for this subject are locked
                      {course.locked_on && ` (locked on ${new Date(course.locked_on).toLocaleDateString()})`}
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdateMarks;