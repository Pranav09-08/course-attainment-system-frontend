import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseAttainment = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5001/api/attainment-data")
      .then((response) => setData(response.data[0])) 
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!data) return <div className="text-center mt-10 text-white">Loading...</div>;

  const { course_id, academic_yr, dept_id, level_target, attainment, sem, course_class } = data;


  const orderedCourseOutcomes = ["u1_co1", "u1_co2", "u2_co3", "u2_co4", "u3_co5", "u3_co6", "i_co1", "i_co2", "end_sem", "final_sem"];
  const rows = ["p_l1", "p_l2", "p_l3", "l1_a", "l2_a", "l3_a", "l1_fa", "l2_fa", "l3_fa", "ut_as"];

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      {/* Course Details Card */}
      <div className="bg-blue-500 p-4 rounded-lg shadow-lg mb-6">
  <h2 className="text-xl font-bold text-white">Course Details</h2>
  <p className="text-white"><strong>Course ID:</strong> {course_id}</p>
  <p className="text-white"><strong>Academic Year:</strong> {academic_yr}</p>
  <p className="text-white"><strong>Department ID:</strong> {dept_id}</p>
  <p className="text-white"><strong>Class:</strong> {course_class}</p>
  <p className="text-white"><strong>Semester:</strong> {sem}</p>
</div>

      {/* Level Target Table */}
      <div className="overflow-x-auto mb-6">
        <h2 className="text-lg font-semibold mb-3">Level Target Table</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border p-2">Metrics</th>
              {orderedCourseOutcomes.map((co, index) => (
                <th key={index} className="border p-2">{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border">
                <td className="border p-2 font-semibold">{row}</td>
                {orderedCourseOutcomes.map((co, colIndex) => (
                  <td key={colIndex} className="border p-2">{level_target.find(item => item.course_outcome === co)?.[row] || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attainment Table */}
      <div className="overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Final Attainment Table</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-black">
              {Object.keys(attainment).map((key, index) => (
                <th key={index} className="border p-2">{key.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              {Object.values(attainment).map((value, index) => (
                <td key={index} className="border p-2">{value}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseAttainment;
