import { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";

const AddStudents = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  // Sample CSV format
  const sampleCSV = `roll_no,name,email,mobile_no,class,academic_yr\n`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    saveAs(blob, "sample_students.csv");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="w-50 p-4 rounded shadow-lg">
      <h3 className="text-center text-primary mb-4">Add Students using CSV</h3>

        <button className="btn btn-success w-100 mb-3 py-3" onClick={handleDownloadSample}>
          Download Sample CSV
        </button>

        <div className="input-group mb-3">
          <input type="file" className="form-control fs-5" accept=".csv" onChange={handleFileChange} />
        </div>

        <button className="btn btn-primary w-100 py-3" onClick={handleUpload}>
          Upload File
        </button>

        {message && <p className="text-danger text-center mt-3">{message}</p>}
      </div>
    </div>
  );
};

export default AddStudents;
