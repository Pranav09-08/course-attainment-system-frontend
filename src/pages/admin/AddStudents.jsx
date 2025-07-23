import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Form, Button, Alert, Card, Container, Table } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

const AddStudents = () => {
  // File state
  const [file, setFile] = useState(null);

  // Parsed student records
  const [students, setStudents] = useState([]);

  // Auth-related states
  const [deptId, setDeptId] = useState(null);
  const [token, setToken] = useState(null);

  // Loading state for upload operation
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown selections
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  // Options for dropdowns
  const classOptions = ["FE", "SE", "TE", "BE"];
  const semOptions = ["ODD", "EVEN"];

  // Generate academic year dropdown values dynamically
  const currentYear = new Date().getFullYear();
  const academicYearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year}_${(year + 1).toString().slice(-2)}`;
  });

  // Set department ID and token from local storage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const token = storedUser?.accessToken;
    if (storedUser?.user?.id) {
      setDeptId(storedUser.user.id);
      setToken(token);
    }
  }, []);

  /**
   * Generates sample CSV based on selected class
   * @returns {string} - CSV string content
   */
  const generateSampleCSV = () => {
    let headers = "roll_no,seat_no,name,class";

    // Add elective columns based on class
    if (selectedClass === "TE") {
      headers += ",el1";
    } else if (selectedClass === "BE") {
      headers += ",el1,el2";
    }

    // Create sample rows
    let content = headers + "\n";
    content += `1001,1,Student One,${selectedClass}9${selectedClass === "TE" ? ",Elective 1" : selectedClass === "BE" ? ",Elective 1,Elective 2" : ""}\n`;
    content += `1002,2,Student Two,${selectedClass}10${selectedClass === "TE" ? ",Elective 1" : selectedClass === "BE" ? ",Elective 1,Elective 2" : ""}`;

    return content;
  };

  // Trigger CSV download with appropriate filename and content
  const handleDownloadSample = () => {
    if (!selectedClass) {
      showToast("error", "Please select a class first");
      return;
    }

    const blob = new Blob([generateSampleCSV()], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `sample_${selectedClass}_students.csv`);
    showToast("success", `Sample CSV for ${selectedClass} downloaded`);
  };

  // Handle CSV file upload and parse using PapaParse
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Ensure class, sem, and academic year are selected before parsing
    if (!selectedClass || !selectedSem || !selectedAcademicYear) {
      showToast("error", "Please select class, semester and academic year first");
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = [];

        // Validate and transform CSV rows
        const parsedStudents = results.data
          .filter(row => row.roll_no && row.name && row.class)
          .map((row, index) => {
            const rowNumber = index + 1;

            // Required field validation
            if (!row.roll_no) errors.push(`Row ${rowNumber}: Roll number is required`);
            if (!row.name) errors.push(`Row ${rowNumber}: Student name is required`);
            if (!row.class) errors.push(`Row ${rowNumber}: Class is required`);

            // Validate class format and match selected class
            if (row.class && !row.class.startsWith(selectedClass)) {
              errors.push(`Row ${rowNumber}: Class "${row.class}" must start with "${selectedClass}"`);
            }
            if (row.class && !/^[A-Za-z]+\d+$/.test(row.class)) {
              errors.push(`Row ${rowNumber}: Invalid class format. Should be letters + digits`);
            }

            // Validate electives based on class
            if (selectedClass === "TE" && !row.el1) {
              errors.push(`Row ${rowNumber}: Elective 1 is required for TE students`);
            }
            if (selectedClass === "BE") {
              if (!row.el1) errors.push(`Row ${rowNumber}: Elective 1 is required for BE students`);
              if (!row.el2) errors.push(`Row ${rowNumber}: Elective 2 is required for BE students`);
            }

            return {
              ...row,
              dept_id: deptId,
              sem: selectedSem,
              academic_yr: selectedAcademicYear
            };
          });

        // If validation errors exist, show toast and log
        if (errors.length > 0) {
          const errorPreview = errors.slice(0, 3).join('\n');
          const moreErrors = errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : '';

          showToast(
            "error",
            `Found ${errors.length} issues in your CSV:\n${errorPreview}${moreErrors}`,
            { autoClose: 8000 }
          );

          console.groupCollapsed('CSV Validation Errors');
          errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
          console.groupEnd();

          return;
        }

        // Update students state with valid data
        setStudents(parsedStudents);
        showToast("success", `Successfully parsed ${parsedStudents.length} students.`);
      },

      // Handle file read error
      error: (error) => {
        showToast("error", `Failed to read CSV: ${error.message}`);
      }
    });
  };

  /**
   * Upload parsed students to backend
   */
  const handleUpload = async () => {
    if (!selectedClass || !selectedSem || !selectedAcademicYear) {
      showToast("error", "Please select class, semester and academic year");
      return;
    }

    if (students.length === 0) {
      showToast("error", "No valid student data to upload");
      return;
    }

    setIsUploading(true);

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
          timeout: 20000
        }
      );

      // Handle success with duplicate warning
      if (response.data) {
        let successMessage = `${response.data.insertedCount} students added successfully!`;

        if (response.data.duplicateCount > 0) {
          successMessage += ` (${response.data.duplicateCount} duplicates skipped)`;

          console.group('Duplicate Students Skipped');
          console.log('Count:', response.data.duplicateCount);
          console.log('Roll Numbers:', response.data.duplicateRollNos);
          console.groupEnd();
        }

        showToast("success", successMessage);

        // Reset form
        setSelectedClass("");
        setSelectedSem("");
        setSelectedAcademicYear("");
        setStudents([]);
        setFile(null);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error adding students:", error.response?.data || error.message);

      if (error.response?.data?.error) {
        showToast('error', error.response.data.error);
      } else if (error.response?.data?.warning) {
        showToast('success',
          `${error.response.data.insertedCount || 0} students added. ${error.response.data.warning}`,
          { autoClose: 5000 }
        );
        setStudents([]);
        setFile(null);
      } else {
        showToast('error', 'Failed to upload students. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <Card className="shadow-lg p-4" style={{ width: '75%' }}>
        <Card.Title className="text-center text-primary mb-4">Add Students using CSV</Card.Title>

        {/* Dropdowns for Class, Semester, Academic Year */}
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

        {/* Sample CSV Download Button */}
        <Button
          variant="success"
          className="w-100 mb-3 py-3"
          onClick={handleDownloadSample}
          disabled={!selectedClass || isUploading}
        >
          Download Sample CSV for {selectedClass || 'Selected Class'}
        </Button>

        {/* CSV File Input */}
        <Form.Group className="mb-3">
          <Form.Label>Upload CSV File</Form.Label>
          <Form.Control
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={!selectedClass || !selectedSem || !selectedAcademicYear || isUploading}
          />
        </Form.Group>

        {/* Preview Parsed Student Table */}
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
                    <th>Class</th>
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
                      <td>{student.class}</td>
                      {selectedClass === "TE" || selectedClass === "BE" ? <td>{student.el1 || '-'}</td> : null}
                      {selectedClass === "BE" ? <td>{student.el2 || '-'}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Final Submit Button */}
        {students.length > 0 && (
          <Button
            variant="primary"
            className="w-100 py-3 mt-3"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              `Add ${students.length} Students`
            )}
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default AddStudents;
