import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UpdateFaculty = () => {
  const { facultyId } = useParams(); // Extract facultyId from URL
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deptId, setDeptId] = useState(null); // State for dept_id

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setMessage("User not logged in!");
      setLoading(false);
      return;
    }

    const { user } = storedUser;
    const { id: dept_id } = user;  // Extracting department ID from user
    setDeptId(dept_id);  // Set dept_id from localStorage

    const token = storedUser.accessToken;
    if (!token) {
      setMessage("No token found, please login!");
      setLoading(false);
      return;
    }

    fetchFacultyList(dept_id, token);
  }, []);

  const fetchFacultyList = async (dept_id, token) => {
    try {
      const response = await axios.get(
        `https://teacher-attainment-system-backend.onrender.com/profile/faculty/department/${dept_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const handleFacultySelect = (facultyId) => {
    const selected = facultyList.find((fac) => fac.faculty_id === facultyId);
    if (selected) {
      setSelectedFaculty(selected);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      setMessage("No token found, please login!");
      return;
    }

    try {
      const response = await axios.put(
        `https://teacher-attainment-system-backend.onrender.com/admin/update-faculty/${selectedFaculty.faculty_id}`,
        {
          name: selectedFaculty.name,
          email: selectedFaculty.email,
          mobile_no: selectedFaculty.mobile_no,
          dept_id: deptId, // Send dept_id with the update request
          password: selectedFaculty.password, // Include password in the update
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Faculty updated:", response.data);
      setMessage("Faculty details updated successfully!");
    } catch (error) {
      console.error("Error updating faculty:", error);
      setMessage("Failed to update faculty details.");
    }
  };

  const handleDelete = async (facultyId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      setMessage("No token found, please login!");
      return;
    }

    try {
      await axios.delete(
        `https://teacher-attainment-system-backend.onrender.com/admin/delete-faculty/${facultyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Faculty deleted successfully!");
      setFacultyList(facultyList.filter((fac) => fac.faculty_id !== facultyId));
    } catch (error) {
      console.error("Error deleting faculty:", error);
      setMessage("Failed to delete faculty.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedFaculty((prevFaculty) => ({
      ...prevFaculty,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h3 className="text-center">Faculty List</h3>
          {message && <div className="alert alert-warning">{message}</div>}
          {loading ? (
            <p>Loading faculty details...</p>
          ) : (
            <table className="table table-bordered">
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
                {facultyList.map((faculty) => (
                  <tr key={faculty.faculty_id}>
                    <td>{faculty.faculty_id}</td>
                    <td>{faculty.name}</td>
                    <td>{faculty.email}</td>
                    <td>{faculty.mobile_no}</td>
                    <td>
                      <button className="btn btn-primary me-2" onClick={() => handleFacultySelect(faculty.faculty_id)}>
                        Update
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(faculty.faculty_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedFaculty && (
            <div className="card mt-4">
              <div className="card-body">
                <h3>Update Faculty</h3>
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" value={selectedFaculty.name} className="form-control" onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={selectedFaculty.email} className="form-control" onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mobile Number</label>
                    <input type="text" name="mobile_no" value={selectedFaculty.mobile_no} className="form-control" onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" value={selectedFaculty.password || ""} className="form-control" onChange={handleInputChange} />
                  </div>
                  <button type="submit" className="btn btn-success">Update Faculty</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateFaculty;