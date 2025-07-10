import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Form, Button, Alert, Card, Container, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const AddStudents = () => {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [deptId, setDeptId] = useState(null);
  const [token, setToken] = useState(null);
  
  // Selection states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  
  // Options
  const classOptions = ["FE", "SE", "TE", "BE"];
  const semOptions = ["ODD", "EVEN"];
  
  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const academicYearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year}_${(year + 1).toString().slice(-2)}`;
  });

  // Toast configuration
  const showToast = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: type === "error" ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
    });
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = storedUser?.accessToken;
    if (storedUser?.user?.id) {
      setDeptId(storedUser.user.id);
      setToken(token);
    }
  }, []);

  const generateSampleCSV = () => {
    let headers = "roll_no,seat_no,name";
    
    if (selectedClass === "TE") {
      headers += ",el1";
    } else if (selectedClass === "BE") {
      headers += ",el1,el2";
    }
    
    let content = headers + "\n";
    content += `1001,1,Student One${selectedClass === "TE" ? ",Elective 1" : selectedClass === "BE" ? ",Elective 1,Elective 2" : ""}\n`;
    content += `1002,2,Student Two${selectedClass === "TE" ? ",Elective 1" : selectedClass === "BE" ? ",Elective 1,Elective 2" : ""}`;
    
    return content;
  };

  const handleDownloadSample = () => {
    if (!selectedClass) {
      showToast("error", "Please select a class first");
      return;
    }
    
    const blob = new Blob([generateSampleCSV()], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `sample_${selectedClass}_students.csv`);
    showToast("success", `Sample CSV for ${selectedClass} downloaded`);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (!selectedClass || !selectedSem || !selectedAcademicYear) {
      showToast("error", "Please select class, semester and academic year first");
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = [];
        const parsedStudents = results.data
          .filter(row => row.roll_no && row.name)
          .map((row, index) => {
            if (!row.roll_no) errors.push(`Row ${index+1}: Missing roll_no`);
            if (!row.name) errors.push(`Row ${index+1}: Missing name`);
            
            if (selectedClass === "TE" && !row.el1) {
              errors.push(`Row ${index+1}: TE students require el1`);
            }
            if (selectedClass === "BE" && (!row.el1 || !row.el2)) {
              errors.push(`Row ${index+1}: BE students require both el1 and el2`);
            }

            return {
              ...row,
              dept_id: deptId,
              class: selectedClass,
              sem: selectedSem,
              academic_yr: selectedAcademicYear
            };
          });

        if (errors.length > 0) {
          showToast("error", `CSV contains ${errors.length} validation errors`);
          return;
        }

        setStudents(parsedStudents);
        showToast("success", `Parsed ${parsedStudents.length} students ready for upload`);
      },
      error: (error) => {
        showToast("error", `CSV parsing error: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSem || !selectedAcademicYear) {
      showToast("error", "Please select class, semester and academic year");
      return;
    }

    if (students.length === 0) {
      showToast("error", "No valid student data to upload");
      return;
    }

    try {
      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/student/upload-students",
        { 
          students,
          sem: selectedSem,
          academic_yr: selectedAcademicYear
        },
        {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.message) {
        showToast("success", `${students.length} students added successfully!`);
        setStudents([]);
        setFile(null);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      let errorMsg = "Error uploading student data";
      
      if (error.response) {
        errorMsg = error.response.data?.message || 
                  `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server - check backend connection";
      } else if (error.code === "ECONNABORTED") {
        errorMsg = "Request timeout - server took too long to respond";
      }

      showToast("error", errorMsg);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <ToastContainer />
      
      <Card className="shadow-lg p-4" style={{ width: '75%' }}>
        <Card.Title className="text-center text-primary mb-4">Add Students using CSV</Card.Title>
        
        {/* Selection Dropdowns */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <Form.Select 
              value={selectedClass} 
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setStudents([]);
                setFile(null);
              }}
              required
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Select 
              value={selectedSem} 
              onChange={(e) => {
                setSelectedSem(e.target.value);
                setStudents([]);
                setFile(null);
              }}
              required
            >
              <option value="">Select Sem</option>
              {semOptions.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Select 
              value={selectedAcademicYear} 
              onChange={(e) => {
                setSelectedAcademicYear(e.target.value);
                setStudents([]);
                setFile(null);
              }}
              required
            >
              <option value="">Select Academic Year</option>
              {academicYearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </div>
        </div>

        {/* Download Sample Button */}
        <Button 
          variant="success" 
          className="w-100 mb-3 py-3" 
          onClick={handleDownloadSample}
          disabled={!selectedClass}
        >
          Download Sample CSV for {selectedClass || 'Selected Class'}
        </Button>

        {/* File Upload */}
        <Form.Group className="mb-3">
          <Form.Label>Upload CSV File</Form.Label>
          <Form.Control 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={!selectedClass || !selectedSem || !selectedAcademicYear}
          />
        </Form.Group>

        {/* Preview Table */}
        {students.length > 0 && (
          <div className="mt-4">
            <h5 className="text-center mb-3">Students to be Added</h5>
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Seat No</th>
                    <th>Name</th>
                    {selectedClass === "TE" || selectedClass === "BE" ? <th>Elective 1</th> : null}
                    {selectedClass === "BE" ? <th>Elective 2</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index}>
                      <td>{student.roll_no}</td>
                      <td>{student.seat_no || '-'}</td>
                      <td>{student.name}</td>
                      {selectedClass === "TE" || selectedClass === "BE" ? <td>{student.el1 || '-'}</td> : null}
                      {selectedClass === "BE" ? <td>{student.el2 || '-'}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Add Students Button */}
        {students.length > 0 && (
          <Button 
            variant="primary" 
            className="w-100 py-3 mt-3" 
            onClick={handleUpload}
          >
            Add {students.length} Students
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default AddStudents;