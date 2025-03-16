import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

const AddStudents = () => {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]); // Store parsed data
  const [message, setMessage] = useState({ text: "", type: "" }); // Store message and type
  const [deptId, setDeptId] = useState(null); // Store dept_id

  // Fetch dept_id from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user?.id) {
      setDeptId(storedUser.user.id);
    }
  }, []);

  // Sample CSV format
  const sampleCSV = `roll_no,name,email,mobile_no,class,academic_yr\n`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    saveAs(blob, "sample_students.csv");
  };

  // Handle file selection & parse CSV
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      Papa.parse(selectedFile, {
        complete: (result) => {
          const parsedData = result.data
            .filter((row) => row.roll_no) // Remove empty rows
            .map((row) => ({
              ...row,
              dept_id: deptId, // Add dept_id dynamically
              status: "1", // Ensure status field is included
            }));

          setStudents(parsedData);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  // Handle upload confirmation
  const handleUpload = async () => {
    if (!deptId) {
      setMessage({ text: "Error: Department ID not found.", type: "danger" });
      return;
    }

    if (students.length === 0) {
      setMessage({ text: "No data to upload!", type: "danger" });
      return;
    }

    try {
      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/student/upload-students",
        { students },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Check if response contains expected message
      if (response.data?.message) {
        setMessage({ text: response.data.message, type: "success" });
      } else {
        setMessage({ text: "Students uploaded successfully!", type: "success" });
      }

      setStudents([]); // Clear table after upload
    } catch (error) {
      console.error("Upload Error:", error);

      let errorMsg = "Error uploading student data.";
      if (error.response) {
        errorMsg = error.response.data.message || `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Please check your internet connection.";
      } else {
        errorMsg = `Request failed: ${error.message}`;
      }

      setMessage({ text: errorMsg, type: "danger" });
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg p-4 w-75">
        <h3 className="text-center text-primary mb-4">Add Students using CSV</h3>

        <button className="btn btn-success w-100 mb-3 py-3" onClick={handleDownloadSample}>
          Download Sample CSV
        </button>

        <div className="input-group mb-3">
          <input type="file" className="form-control fs-5" accept=".csv" onChange={handleFileChange} />
        </div>

        {/* Show Table if Data Exists */}
        {students.length > 0 && (
          <div className="mt-3">
            <h4 className="text-center">Preview Data</h4>

            {/* Scrollable Table */}
            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="table table-bordered text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile No</th>
                    <th>Class</th>
                    <th>Academic Year</th>
                    <th>Dept ID</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index}>
                      <td>{student.roll_no}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.mobile_no}</td>
                      <td>{student.class}</td>
                      <td>{student.academic_yr}</td>
                      <td>{student.dept_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn btn-primary w-100 py-3 mt-3" onClick={handleUpload}>
              Confirm & Upload
            </button>
          </div>
        )}

        {/* Display Message */}
        {message.text && (
          <div className={`alert alert-${message.type} text-center mt-3`} role="alert">
            {message.text}
            <button type="button" className="btn-close ms-3" onClick={() => setMessage({ text: "", type: "" })}></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudents;
