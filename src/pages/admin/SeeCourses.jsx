import { useState, useEffect } from "react";
import axios from "axios";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(""); // Reset error before fetching

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken;

      if (!token) {
        setError("Unauthorized: Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://teacher-attainment-system-backend.onrender.com/admin/course/get-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("📢 API Response:", response.data); // Debugging

        if (Array.isArray(response.data) && response.data.length > 0) {
          setCourses(response.data);
        } else {
          setError("No courses found.");
        }
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        setError("Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">All Courses</h2>

      {loading && <p className="text-center">Loading courses...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && courses.length > 0 ? (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Class</th> {/* Added Class Column */}
              <th>Unit Test</th>
              <th>In-Sem</th>
              <th>End-Sem</th>
              <th>Final Sem</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_id}</td>
                <td>{course.course_name}</td>
                <td>{course.class}</td> {/* Display Class */}
                <td>{course.ut}</td>
                <td>{course.insem}</td>
                <td>{course.endsem}</td>
                <td>{course.finalsem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p className="text-center text-muted">No courses found.</p>
      )}
    </div>
  );
};

export default AllCourses;
