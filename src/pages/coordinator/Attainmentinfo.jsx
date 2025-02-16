import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CourseAttainment = () => {
  const { courseId, academicYear, dept_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !academicYear) {
      setLoading(false);
      setError("Missing Course ID or Academic Year");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    axios
      .get(`https://teacher-attainment-system-backend.onrender.com/attainment/attainment-data?course_id=${courseId}&academic_yr=${academicYear}&dept_id=${dept_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setData(response.data || {});
      })
      .catch(() => {
        setError("Failed to fetch attainment data");
      })
      .finally(() => setLoading(false));
  }, [courseId, academicYear, dept_id]);

  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-white">{error}</div>;
  if (!data) return <div className="text-center mt-10 text-white">No data available.</div>;

  const { course_id, level_target, course_target, attainment } = data;

  const metricLabels = [
    "Target no of students for level 1", "Target no of students for level 2", "Target no of students for level 3",
    "% of students for level 1 (>40%)", "% of students for level 2 (>60%)", "% of students for level 3 (>66%)",
    "Level 1 Att", "Level 2 Att", "Level 3 Att", "Level 1 Final Att", "Level 2 Final Att", "Level 3 Final Att",
    "UT/Asgnt attainment"
  ];

  const orderedCourseOutcomes = [
    "u1_co1", "u1_co2", "u2_co3", "u2_co4", "u3_co5", "u3_co6", "i_co1", "i_co2", "end_sem", "final_sem"
  ];

  const rows = [
    "t_l1", "t_l2", "t_l3", "p_l1", "p_l2", "p_l3", "l1_a", "l2_a", "l3_a", "l1_fa", "l2_fa", "l3_fa", "ut_as"
  ];

  const rowClasses = ["table-light", "table-secondary", "table-primary", "table-info", "table-success"];

  return (
    <div className="container mt-5">
      {/* Row for Course Details and Final Attainment */}
      <div className="row">
        {/* Course Details Card */}
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-header bg-dark text-white text-center">
              <strong>Course Details</strong>
            </div>
            <div className="card-body text-center">
              <h5 className="text-warning">Course ID: {course_id ?? "N/A"}</h5>
              {course_target && (
                <div className="mt-3">
                  <h6 className="text-primary">Course Target</h6>
                  <table className="table table-bordered text-center">
                    <thead className="table-dark">
                      <tr>
                        <th>Level</th>
                        <th>Unit Test</th>
                        <th>SPPU</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Level 3</td>
                        <td>{course_target.target3 ?? "-"}</td>
                        <td>{course_target.sppu3 ?? "-"}</td>
                      </tr>
                      <tr>
                        <td>Level 2</td>
                        <td>{course_target.target2 ?? "-"}</td>
                        <td>{course_target.sppu2 ?? "-"}</td>
                      </tr>
                      <tr>
                        <td>Level 1</td>
                        <td>{course_target.target1 ?? "-"}</td>
                        <td>{course_target.sppu1 ?? "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Final Attainment Card */}
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-header bg-warning text-center">
              <strong>Final Attainment</strong>
            </div>
            <div className="card-body">
              {attainment && Object.entries(attainment).map(([key, value], index) => (
                <div key={index} className="mb-2">
                  <strong>{key.replace("_", " ").toUpperCase()}:</strong> <span className="ms-2">{value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Target Table */}
      <div className="table-responsive mt-4">
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
              <tr key={rowIndex} className={rowClasses[Math.floor(rowIndex / 3) % rowClasses.length]}>
                <td className="fw-bold">{metricLabels[rowIndex]}</td>
                {orderedCourseOutcomes.map((co, colIndex) => (
                  <td key={colIndex}>
                    {level_target?.[colIndex]?.[row] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseAttainment;
