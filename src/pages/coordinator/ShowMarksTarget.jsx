import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the toastify styles

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

        console.log("Backend Response:", response.data);

        const { target, marks } = response.data.data;

        const targetData = target
          ? Object.keys(target)
              .filter((key) => key.startsWith("target") || key.startsWith("sppu"))
              .reduce((acc, key, index, arr) => {
                const targetKey = arr[index % 2 === 0 ? index : index - 1];
                const sppuKey = arr[index % 2 === 1 ? index : index + 1];
                if (index % 2 === 0) {
                  acc.push({
                    target: target[targetKey],
                    sppu: target[sppuKey],
                  });
                }
                return acc;
              }, [])
          : [];

        const marksData = Array.isArray(marks) ? marks : [];

        setMarksData(marksData);
        setTargetData(targetData);

        // Show success toast notification
        toast.success("Data fetched successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch marks and target data");

        // Show error toast notification
        toast.error("Failed to fetch data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, dept_id, academicYear]);

  const calculateAttainment = async () => {
    setAttainmentLoading(true);

    try {
      const payload = {
        course_id: courseId,
        academic_yr: academicYear,
        dept_id: dept_id,
        modified_by: "admin",
      };

      console.log("Sending Payload:", payload);

      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/attainment/update-level-targets",
        payload
      );

      console.log("API Response:", response.data);

      setAttainmentData(response.data.message);

      // Show success toast notification
      toast.success("Attainment calculated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error calculating attainment:", error);
      setAttainmentData("Failed to calculate attainment");

      // Show error toast notification
      toast.error("Failed to calculate attainment.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
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

      {/* Toast Container for showing toast messages */}
      <ToastContainer />

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

      <div className="text-center mt-4">
        <button
          onClick={calculateAttainment}
          className={`btn ${attainmentLoading ? "btn-secondary" : "btn-success"} btn-lg`}
          disabled={attainmentLoading}
        >
          {attainmentLoading ? "Calculating..." : "Calculate Attainment"}
        </button>

      </div>
    </div>
  );
};

export default ShowMarksTarget;
