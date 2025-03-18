import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, InputGroup, FormControl, Button, Table, Modal,Alert } from "react-bootstrap";

const DownloadReport = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [targetData, setTargetData] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(""); // Store error messages

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const { user } = storedUser;
    const { id: facultyId } = user;

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 10000); // 12 seconds (adjust within 10-15s as needed)
    
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        console.log("Fetching courses for faculty ID:", facultyId);

        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser?.accessToken;

        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        axios
            .get(
                `https://teacher-attainment-system-backend.onrender.com/attainment/coordinator-courses?faculty_id=${facultyId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((response) => {
                console.log("Courses Data:", response.data);
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error.response ? error.response.data : error.message);
                setErrorMessage("Report doesn't exist for that course. Please try again later.");
            });
    }, [facultyId]);

    const handleDownloadReport = async (courseId, academicYear, deptId) => {
        console.log("Downloading report for courseId:", courseId, "and academicYear:", academicYear);
    
        const reportUrl = `https://teacher-attainment-system-backend.onrender.com/report/generate-report?courseId=${courseId}&deptId=${deptId}&academicYear=${academicYear}`;
    
        try {
            const response = await axios.get(reportUrl);
    
            // Log the entire response for debugging
            console.log("Backend Response:", response.data);
    
            // Extract target and marks data from the response
            const { target, marks } = response.data.data;
    
            console.log("Target Data:", target);
            console.log("Marks Data:", marks);
    
            // Update state for target data
            setTargetData([
                { Target: "Level 3", "Unit Test": target.target1, SPPU: target.sppu1 },
                { Target: "Level 2", "Unit Test": target.target2, SPPU: target.sppu2 },
                { Target: "Level 1", "Unit Test": target.target3, SPPU: target.sppu3 },
            ]);
    
            // Update state for marks data
            setMarksData(marks);
    
            // Update selected course state
            setSelectedCourse({
                courseId,
                academicYear,
                deptId,
                courseName: courses.find((course) => course.course_id === courseId)?.course_name,
            });
    
            // Show the modal
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching report:", error);
            setErrorMessage("Report doesn't exist for that course. Please try again later.");
        }
    };

    const handleExcelDownload = async () => {
        const reportUrl = `https://teacher-attainment-system-backend.onrender.com/report/download-report?courseId=${selectedCourse?.courseId}&deptId=${selectedCourse?.deptId}&academicYear=${selectedCourse?.academicYear}`;
    
        try {
            const response = await axios.get(reportUrl, { responseType: "blob" });
    
            // Check if the response is successful
            if (response.status !== 200) {
                throw new Error("Failed to generate report");
            }
    
            // Create a Blob from the response data
            const fileBlob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
            // Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(fileBlob);
    
            // Create a link element to trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.download = `${selectedCourse?.courseName}_Download_Report.xlsx`;
            document.body.appendChild(link);
    
            // Trigger the download
            link.click();
    
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading the report:", error);
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.course_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear ? course.academic_yr === selectedYear : true;
        const matchesSem = selectedSem ? course.sem === selectedSem : true;
        return matchesSearch && matchesYear && matchesSem;
    });

    const uniqueYears = [...new Set(courses.map((course) => course.academic_yr))];
    const uniqueSems = [...new Set(courses.map((course) => course.sem))];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Download Report</h2>
             {/* Error Message Alert */}
             {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>{errorMessage}</Alert>}

            <div className="d-flex justify-content-center mb-4">
                <InputGroup className="w-50">
                    <FormControl
                        placeholder="Search by Course Name or ID"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" id="button-addon2">
                        Search
                    </Button>
                </InputGroup>
            </div>

            <div className="d-flex justify-content-center mb-4">
                <Form.Select
                    className="w-25 mx-2"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="">Select Academic Year</option>
                    {uniqueYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </Form.Select>

                <Form.Select
                    className="w-25 mx-2"
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                >
                    <option value="">Select Semester</option>
                    {uniqueSems.map((sem) => (
                        <option key={sem} value={sem}>
                            {sem}
                        </option>
                    ))}
                </Form.Select>
            </div>

            {filteredCourses.length === 0 ? (
                <p className="text-muted text-center">No courses match your criteria.</p>
            ) : (
                <div className="row justify-content-center">
                    {filteredCourses.map((course) => (
                        <div key={course.course_id} className="col-md-6 mb-4">
                            <div className="card shadow-sm" style={{ minHeight: "300px", padding: "15px" }}>
                                <div className="card-body p-3">
                                    <h5 className="card-title text-primary mb-2" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                                        Course Details
                                    </h5>
                                    <p className="card-text">
                                        <strong>Course Name:</strong> {course.course_name}
                                    </p>
                                    <p className="card-text">
                                        <strong>Course ID:</strong> {course.course_id}
                                    </p>
                                    <p className="card-text">
                                        <strong>Class:</strong> {course.class}
                                    </p>
                                    <p className="card-text">
                                        <strong>Semester:</strong> {course.sem}
                                    </p>
                                    <p className="card-text">
                                        <strong>Department:</strong> {course.dept_name} | <strong>Academic Year:</strong> {course.academic_yr}
                                    </p>

                                    <button
                                        onClick={() => handleDownloadReport(course.course_id, course.academic_yr, course.dept_id)}
                                        className="btn btn-outline-primary w-100 mb-2"
                                    >
                                        Download Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for displaying data */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Report for {selectedCourse?.courseName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Target Data</h4>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Target Level</th>
                                <th>Unit Test</th>
                                <th>SPPU</th>
                            </tr>
                        </thead>
                        <tbody>
                            {targetData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.Target}</td>
                                    <td>{row["Unit Test"]}</td>
                                    <td>{row.SPPU}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <h4>Marks Data</h4>
                    <Table striped bordered hover size="sm">
                        <thead>
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
                    </Table>
                    <button onClick={handleExcelDownload} className="btn btn-success">
                        Download Excel Report
                    </button>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DownloadReport;