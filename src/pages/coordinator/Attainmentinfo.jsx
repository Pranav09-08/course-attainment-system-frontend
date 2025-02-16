import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CourseAttainment = () => {
    const { courseId, academicYear } = useParams();  // Get courseId and academicYear from URL
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      console.log("Received courseId:", courseId, "and academicYear:", academicYear); // Log the values of courseId and academicYear
  
      if (!courseId || !academicYear) {
          console.error("Course ID or Academic Year is missing.");
          setLoading(false);
          setError("Missing Course ID or Academic Year");
          return;
      }
  
      // Retrieve the access token from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.accessToken; // Retrieve the accessToken from stored user object
  
      if (!token) {
          console.error("No authentication token found.");
          setError("Authentication token is missing.");
          setLoading(false);
          return;
      }
  
      // Fetch attainment data for the specific course using courseId and academicYear
      axios.get(`https://teacher-attainment-system-backend.onrender.com/attainment/attainment-data?course_id=${courseId}&academic_yr=${academicYear}`, {
          headers: {
              'Authorization': `Bearer ${token}`  // Send the token as Authorization header
          }
      })
          .then(response => {
              console.log("Attainment data fetched:", response.data); // Log the fetched attainment data
              if (response.data) {
                  setData(response.data);
              } else {
                  setError("No attainment data available for this course.");
              }
          })
          .catch(error => {
              console.error("Error fetching data:", error);
              setError("Failed to fetch attainment data");
          })
          .finally(() => setLoading(false));
  }, [courseId, academicYear]); // Added academicYear as dependency
  

    if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-white">{error}</div>;
    if (!data) return <div className="text-center mt-10 text-white">No data available.</div>;

    const { course_id, level_target, attainment } = data;

    const orderedCourseOutcomes = ["u1_co1", "u1_co2", "u2_co3", "u2_co4", "u3_co5", "u3_co6", "i_co1", "i_co2", "end_sem", "final_sem"];
    const rows = ["p_l1", "p_l2", "p_l3", "l1_a", "l2_a", "l3_a", "l1_fa", "l2_fa", "l3_fa", "ut_as"];
    const rowClasses = ["table-light", "table-secondary", "table-primary", "table-info", "table-success"];

    return (
        <div className="container mt-5">
      {/* Course Title */}
      <h2 className="text-center text-light mb-4">
        <strong>Course ID: </strong>
        <span className="text-warning">{course_id}</span>
      </h2>

      {/* Level Target Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center bg-white shadow-lg mx-auto">
          <thead className="table-dark">
            <tr>
              <th>Metrics</th>
              {orderedCourseOutcomes.map((co, index) => (
                <th key={index}>{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowClasses[rowIndex % rowClasses.length]}>
                <td className="fw-bold">{row}</td>
                {orderedCourseOutcomes.map((co, colIndex) => (
                  <td key={colIndex}>
                    {level_target.find(item => item.course_outcome === co)?.[row] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Attainment Table */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered text-center bg-white shadow-lg mx-auto">
          <thead className="table-dark">
            <tr>
              {Object.keys(attainment).map((key, index) => (
                <th key={index}>{key.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="table-warning">
              {Object.values(attainment).map((value, index) => (
                <td key={index}>{value || "-"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    );
};

export default CourseAttainment;
