import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Spinner, Modal } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const MarksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const marksData = location.state?.marksData;

  // Handle loading state
  const [loading, setLoading] = useState(!marksData);

  // State for modal and selected student
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch data if not available
  React.useEffect(() => {
    if (!marksData) {
      // Simulate fetching data (replace with actual API call)
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [marksData]);

  // Prepare data for the Bar Chart (UT1 Marks)
  const ut1Data = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "UT1 CO1 Marks",
        data: marksData?.map((student) => student.u1_co1), // UT1 CO1 marks
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "UT1 CO2 Marks",
        data: marksData?.map((student) => student.u1_co2), // UT1 CO2 marks
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  // Prepare data for the Bar Chart (UT2 Marks)
  const ut2Data = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "UT2 CO3 Marks",
        data: marksData?.map((student) => student.u2_co3), // UT2 CO3 marks
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
      {
        label: "UT2 CO4 Marks",
        data: marksData?.map((student) => student.u2_co4), // UT2 CO4 marks
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Prepare data for the Bar Chart (UT3 Marks)
  const ut3Data = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "UT3 CO5 Marks",
        data: marksData?.map((student) => student.u3_co5), // UT3 CO5 marks
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "UT3 CO6 Marks",
        data: marksData?.map((student) => student.u3_co6), // UT3 CO6 marks
        backgroundColor: "rgba(201, 203, 207, 0.6)",
      },
    ],
  };

  // Prepare data for the Bar Chart (Insemester Marks)
  const insemesterData = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "Insem CO1 Marks",
        data: marksData?.map((student) => student.i_co1), // Insem CO1 marks
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Insem CO2 Marks",
        data: marksData?.map((student) => student.i_co2), // Insem CO2 marks
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  // Prepare data for the Bar Chart (End-Semester Marks)
  const endSemesterData = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "End-Semester Marks",
        data: marksData?.map((student) => student.end_sem), // End-Semester marks
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  // Prepare data for the Bar Chart (Final-Semester Marks)
  const finalSemesterData = {
    labels: marksData?.map((student) => student.roll_no), // Roll numbers as labels
    datasets: [
      {
        label: "Final-Semester Marks",
        data: marksData?.map((student) => student.final_sem), // Final-Semester marks
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Student Marks Distribution",
      },
    },
  };

  // Handle click on roll number
  const handleRollNumberClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">Student Marks</h2>
      <div className="d-flex gap-2 mb-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {marksData ? (
        <>
          {/* Bar Chart for UT1 Marks */}
          <div className="mb-5">
            <h3 className="text-center">UT1 Marks</h3>
            <Bar data={ut1Data} options={chartOptions} />
          </div>

          {/* Bar Chart for UT2 Marks */}
          <div className="mb-5">
            <h3 className="text-center">UT2 Marks</h3>
            <Bar data={ut2Data} options={chartOptions} />
          </div>

          {/* Bar Chart for UT3 Marks */}
          <div className="mb-5">
            <h3 className="text-center">UT3 Marks</h3>
            <Bar data={ut3Data} options={chartOptions} />
          </div>

          {/* Bar Chart for Insemester Marks */}
          <div className="mb-5">
            <h3 className="text-center">Insemester Marks</h3>
            <Bar data={insemesterData} options={chartOptions} />
          </div>

          {/* Bar Chart for End-Semester Marks */}
          <div className="mb-5">
            <h3 className="text-center">End-Semester Marks</h3>
            <Bar data={endSemesterData} options={chartOptions} />
          </div>

          {/* Bar Chart for Final-Semester Marks */}
          <div className="mb-5">
            <h3 className="text-center">Final-Semester Marks</h3>
            <Bar data={finalSemesterData} options={chartOptions} />
          </div>

          {/* Table to Display Raw Marks Data */}
          <div className="mb-5">
            <h3 className="text-center">Raw Marks Data</h3>
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>U1 CO1</th>
                  <th>U1 CO2</th>
                  <th>U2 CO3</th>
                  <th>U2 CO4</th>
                  <th>U3 CO5</th>
                  <th>U3 CO6</th>
                  <th>Insem CO1</th>
                  <th>Insem CO2</th>
                  <th>End Sem</th>
                  <th>Final Sem</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map((student) => (
                  <tr key={student.roll_no}>
                    <td>
                      <Button
                        variant="link"
                        onClick={() => handleRollNumberClick(student)}
                      >
                        {student.roll_no}
                      </Button>
                    </td>
                    <td>{student.u1_co1}</td>
                    <td>{student.u1_co2}</td>
                    <td>{student.u2_co3}</td>
                    <td>{student.u2_co4}</td>
                    <td>{student.u3_co5}</td>
                    <td>{student.u3_co6}</td>
                    <td>{student.i_co1}</td>
                    <td>{student.i_co2}</td>
                    <td>{student.end_sem}</td>
                    <td>{student.final_sem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Student Progress - Roll No: {selectedStudent?.roll_no}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedStudent && (
      <div>
        <h4>Marks Breakdown</h4>
        <ul>
          <li>UT1 CO1: {selectedStudent.u1_co1} (Out of 15)</li>
          <li>UT1 CO2: {selectedStudent.u1_co2} (Out of 15)</li>
          <li>UT2 CO3: {selectedStudent.u2_co3} (Out of 15)</li>
          <li>UT2 CO4: {selectedStudent.u2_co4} (Out of 15)</li>
          <li>UT3 CO5: {selectedStudent.u3_co5} (Out of 15)</li>
          <li>UT3 CO6: {selectedStudent.u3_co6} (Out of 15)</li>
          <li>Insem CO1: {selectedStudent.i_co1} (Out of 15)</li>
          <li>Insem CO2: {selectedStudent.i_co2} (Out of 15)</li>
          <li>End Sem: {selectedStudent.end_sem} (Out of 70)</li>
          <li>Final Sem: {selectedStudent.final_sem} (Out of 100)</li>
        </ul>

        <h4>Progress Chart (Marks Achieved vs Maximum Marks)</h4>
        <Bar
          data={{
            labels: ["UT1", "UT2", "UT3", "Insem", "End Sem", "Final Sem"],
            datasets: [
              {
                label: "Marks Achieved",
                data: [
                  // Convert to numbers and sum
                  Number(selectedStudent.u1_co1) + Number(selectedStudent.u1_co2),
                  Number(selectedStudent.u2_co3) + Number(selectedStudent.u2_co4),
                  Number(selectedStudent.u3_co5) + Number(selectedStudent.u3_co6),
                  Number(selectedStudent.i_co1) + Number(selectedStudent.i_co2),
                  Number(selectedStudent.end_sem),
                  Number(selectedStudent.final_sem),
                ],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
              {
                label: "Maximum Marks",
                data: [30, 30, 30, 30, 70, 100],
                backgroundColor: "rgba(255, 99, 132, 0.6)",
              },
            ],
          }}
          options={{
            indexAxis: "y",
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Student Progress (Marks Achieved vs Maximum Marks)",
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.raw}`,
                },
              },
            },
            scales: {
              x: {
                min: 0,
                max: 100,
                title: { display: true, text: "Marks" },
              },
            },
          }}
        />
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
        </>
      ) : (
        <p>No marks data found.</p>
      )}
    </div>
  );
};

export default MarksPage;