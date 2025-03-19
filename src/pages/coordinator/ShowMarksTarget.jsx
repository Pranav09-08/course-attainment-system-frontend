import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ShowMarksTarget = () => {
  const { courseId, dept_id, academicYear } = useParams();
  console.log("Extracted Params:", { courseId, dept_id, academicYear });

  const [marksData, setMarksData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attainmentLoading, setAttainmentLoading] = useState(false);
  const [attainmentData, setAttainmentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !academicYear || !dept_id) {
        setLoading(false);
        setError("Missing Course ID or Academic Year");
        return;
      }

      try {
        const response = await axios.get(
          `https://teacher-attainment-system-backend.onrender.com/report/show-marktarget?courseId=${courseId}&deptId=${dept_id}&academicYear=${academicYear}`
        );

        // Log the entire response for debugging
        console.log("Backend Response:", response.data);

        // Extract target and marks data from the response
        const { target, marks } = response.data.data;

        console.log("Target Data:", target);

        // Convert target data to an array if it's an object
        const targetData = target
          ? Object.keys(target)
              .filter((key) => key.startsWith('target') || key.startsWith('sppu')) // Only select relevant keys
              .reduce((acc, key, index, arr) => {
                const targetKey = arr[index % 2 === 0 ? index : index - 1];
                const sppuKey = arr[index % 2 === 1 ? index : index + 1];
                if (index % 2 === 0) {
                  acc.push({
                    target: target[targetKey], // target1, target2, etc.
                    sppu: target[sppuKey],     // sppu1, sppu2, etc.
                  });
                }
                return acc;
              }, [])
          : [];

        console.log("Marks Data:", marks);

        // Ensure marks is an array before setting state
        const marksData = Array.isArray(marks) ? marks : [];

        // Set state with the fetched data
        setMarksData(marksData);
        setTargetData(targetData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch marks and target data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, dept_id, academicYear]);

  const calculateAttainment = async () => {
    setAttainmentLoading(true);

    try {
      // Prepare the request payload
      const payload = {
        course_id: courseId,
        academic_yr: academicYear,
        dept_id: dept_id,
        modified_by: "admin", // Replace with the actual user or fetch from context
      };

      // Log the payload for debugging
      console.log("Sending Payload:", payload);

      // Send a POST request to the API
      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/attainment/update-level-targets",
        payload
      );

      // Log the response for debugging
      console.log("API Response:", response.data);

      // Set the attainment data
      setAttainmentData(response.data.message);
    } catch (error) {
      console.error("Error calculating attainment:", error);
      setAttainmentData("Failed to calculate attainment");
    } finally {
      setAttainmentLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-white">{error}</div>;
  if (!marksData.length && !targetData.length) return <div className="text-center mt-10 text-white">No data available.</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary">Marks and Target Data</h2>

      {/* Target Data Table */}
      <div className="table-responsive mt-4">
        <h4 className="text-center">Target Data</h4>
        <table className="table table-bordered text-center bg-white shadow-lg mx-auto">
          <thead className="table-dark">
            <tr>
              <th>Target Level</th>
              <th>Target</th>
              <th>SPPU</th>
            </tr>
          </thead>
          <tbody>
            {targetData.map((row, index) => {
              const level = `Level ${index + 1}`;
              return (
                <tr key={index}>
                  <td>{level}</td>
                  <td>{row.target}</td>
                  <td>{row.sppu}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Marks Data Table */}
      <div className="table-responsive mt-4">
        <h4 className="text-center">Marks Data</h4>
        <table className="table table-bordered text-center bg-white shadow-lg mx-auto">
          <thead className="table-dark">
            <tr>
              <th>Sr. No.</th>
              <th>Roll No.</th>
              <th>Name</th>
              <th>CO1</th>
              <th>CO2</th>
              <th>CO3</th>
              <th>CO4</th>
              <th>CO5</th>
              <th>CO6</th>
              <th>I_CO1</th>
              <th>I_CO2</th>
              <th>End Sem</th>
              <th>Final Sem</th>
            </tr>
          </thead>
          <tbody>
            {marksData.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.rollNo}</td>
                <td>{row.studentName}</td>
                <td>{row.co1}</td>
                <td>{row.co2}</td>
                <td>{row.co3}</td>
                <td>{row.co4}</td>
                <td>{row.co5}</td>
                <td>{row.co6}</td>
                <td>{row.ico1}</td>
                <td>{row.ico2}</td>
                <td>{row.endSem}</td>
                <td>{row.finalSem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculate Attainment Button */}
      <div className="text-center mt-4">
        <button
          onClick={calculateAttainment}
          className={`btn ${attainmentLoading ? "btn-secondary" : "btn-success"} btn-lg`}
          disabled={attainmentLoading}
        >
          {attainmentLoading ? "Calculating..." : "Calculate Attainment"}
        </button>

        {attainmentData && (
          <div className="mt-3 text-white">
            <strong>{attainmentData}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowMarksTarget;
