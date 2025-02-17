import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/SeeFaculty.css"; // Import the CSS file

const SeeFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const { user } = storedUser;
  const { id: dept_id } = user;

  useEffect(() => {
    const token = storedUser?.accessToken;
    if (!token) {
      setMessage("No token found, please login!");
      setLoading(false);
      return;
    }

    const fetchFacultyList = async () => {
      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`
        );
        console.log("Faculty list fetched:", response.data);
        setFacultyList(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to load faculty list.");
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, [dept_id]);

  return (
    <div className="faculty-container">
      <h2 className="faculty-title">Faculty List</h2>

      {loading ? (
        <p className="loading-text">Loading faculty list...</p>
      ) : message ? (
        <p className="error-text">{message}</p>
      ) : (
        <div className="table-container">
          <table className="faculty-table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile No</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No faculty found for this department.</td>
                </tr>
              ) : (
                facultyList.map((faculty) => (
                  <tr key={faculty.faculty_id}>
                    <td>{faculty.faculty_id}</td>
                    <td>{faculty.name}</td>
                    <td>{faculty.email}</td>
                    <td>{faculty.mobile_no}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeeFaculty;
