import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/SeeFaculty.css"; // Import the CSS file

const UpdateFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Faculty list fetched:", response.data);
        setFacultyList(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty list:", error.response?.data || error.message);
        setMessage("Failed to load faculty list.");
        setLoading(false);
      }
    };

    fetchFacultyList();
  }, [dept_id, token]);

  // Function to handle faculty deletion
  const handleDelete = async (facultyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this faculty?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/delete-faculty/${facultyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFacultyList(facultyList.filter((faculty) => faculty.faculty_id !== facultyId));
      alert("Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error.response?.data || error.message);
      alert("Failed to delete faculty.");
    }
  };

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No faculty found for this department.</td>
                </tr>
              ) : (
                facultyList.map((faculty) => (
                  <tr key={faculty.faculty_id}>
                    <td>{faculty.faculty_id}</td>
                    <td>{faculty.name}</td>
                    <td>{faculty.email}</td>
                    <td>{faculty.mobile_no}</td>
                    <td>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate(`/admin/update-faculty/${faculty.faculty_id}`)}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(faculty.faculty_id)}
                      >
                        Delete
                      </button>
                    </td>
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

export default UpdateFaculty;
