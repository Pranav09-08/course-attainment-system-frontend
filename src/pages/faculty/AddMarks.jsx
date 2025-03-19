import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, InputGroup, FormControl, Modal, Table } from 'react-bootstrap';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadMarks = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedMarkType, setSelectedMarkType] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState({});
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [students, setStudents] = useState([]);
  const [csvContent, setCsvContent] = useState("");
  const [csvRows, setCsvRows] = useState([]); // State to store CSV rows for table display
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
   
        alert("Failed to fetch course allotment data! Please try again later."); // Show alert
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

  const handleAddMarks = async (course) => {
    try {
      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/get_student/students",
        course,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      setSelectedCourse(course);
      setStudents(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error sending course data:", error);
      toast.error("Failed to fetch student data for the selected course.");
    }
  };

  const handleMarkTypeChange = (e) => {
    const selectedType = e.target.value;
    setSelectedMarkType(selectedType);
    setShowDownloadButton(!!selectedType);
  };

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);

      // Read and display CSV content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setCsvContent(content);

        // Parse CSV content into rows and columns
        const rows = content.split("\n").map(row => row.split(","));
        setCsvRows(rows);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    if (!students || students.length === 0) {
      toast.warn("No student data available to generate the CSV template.");
      return;
    }

    const columnsMap = {
      "UT1": ["roll_no", "name", "u1_co1", "u1_co2"],
      "UT2": ["roll_no", "name", "u2_co3", "u2_co4"],
      "UT3": ["roll_no", "name", "u3_co5", "u3_co6"],
      "Insem": ["roll_no", "name", "i_co1", "i_co2"],
      "Final": ["roll_no", "name", "end_sem"]
    };

    const columns = columnsMap[selectedMarkType] || [];
    const headerRow = columns.join(",");

    const studentRows = students.map(student => {
      const row = columns.map(col => {
        if (col === "roll_no") return student.roll_no;
        if (col === "name") return student.name;
        return "";
      });
      return row.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...studentRows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedMarkType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCsv = async () => {
    if (!csvFile || !selectedMarkType || !selectedCourse.course_id) {
      toast.warn("Please select a mark type and upload a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(csvFile);

    reader.onload = async (event) => {
      const csvText = event.target.result;
      const rows = csvText.split("\n").map(row => row.trim());

      if (rows.length < 2) {
        toast.warn("Invalid CSV format. The file must contain at least a header and one data row.");
        return;
      }

      const csvHeaders = rows[0].split(",").map(header => header.trim());

      const requiredColumnsMap = {
        "UT1": ["roll_no", "name", "u1_co1", "u1_co2"],
        "UT2": ["roll_no", "name", "u2_co3", "u2_co4"],
        "UT3": ["roll_no", "name", "u3_co5", "u3_co6"],
        "Insem": ["roll_no", "name", "i_co1", "i_co2"],
        "Final": ["roll_no", "name", "end_sem"]
      };

      const requiredColumns = requiredColumnsMap[selectedMarkType] || [];

      if (csvHeaders.length !== requiredColumns.length || !csvHeaders.every(col => requiredColumns.includes(col))) {
        toast.warn(`Invalid CSV format. It must contain only these columns for ${selectedMarkType}: ${requiredColumns.join(", ")}`);
        return;
      }

      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("markType", selectedMarkType);
      formData.append("academic_yr", selectedCourse.academic_yr);
      formData.append("course_id", selectedCourse.course_id);
      formData.append("sem", selectedCourse.sem);
      formData.append("class", selectedCourse.class);
      formData.append("dept_id", selectedCourse.dept_id);

      setLoadingUpload(true);

      try {
        const response = await axios.post(
          "https://teacher-attainment-system-backend.onrender.com/add_marks/upload_marks",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("✅ Marks successfully uploaded!");
        } else {
          toast.error(`⚠️ ${response.data.message || "Error in uploading data."}`);
        }
      } catch (err) {
        console.error("Error uploading CSV file:", err);
        toast.error("❌ Server error! Could not upload marks.");
      } finally {
        setLoadingUpload(false);
        setShowModal(false);
      }
    };
  };

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Add Marks
      </h2>

      <ToastContainer position="top-right" autoClose={3000} />

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

                  <Button
                    onClick={() => handleAddMarks(course)}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload Marks</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Form.Group controlId="markType" className="mb-4">
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

          {showDownloadButton && (
            <Button
              variant="success"
              className="mb-4"
              onClick={handleDownloadTemplate}
            >
              Download CSV Template for {selectedMarkType}
            </Button>
          )}

          <Form.Group controlId="csvFile" className="mb-4">
            <Form.Label>Upload CSV File</Form.Label>
            <Form.Control type="file" accept=".csv" onChange={handleCsvChange} />
          </Form.Group>

          {csvRows.length > 0 && (
            <div className="mb-4">
              <h6>CSV Preview:</h6>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    {csvRows[0].map((header, index) => (
                      <th key={index} style={{ color: "white", fontSize: "14px" }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ color: "white", fontSize: "14px" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

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