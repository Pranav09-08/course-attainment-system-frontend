import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, InputGroup, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SeeStudents = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSem, setSelectedSem] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const department_id = storedUser?.user?.id || "";
    const token = storedUser?.accessToken;

    // Generate academic years
    const generateAcademicYears = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i <= 5; i++) {
            const year = currentYear - i;
            years.push(`${year}_${(year + 1).toString().slice(-2)}`);
        }
        return years;
    };

    const academicYears = generateAcademicYears();
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYears[0]);

    // Only show essential error toasts
    const showErrorToast = (message) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000, // Longer display for errors
            hideProgressBar: false,
            closeOnClick: true,
        });
    };

    useEffect(() => {
        if (department_id) {
            fetchAllStudents();
        }
    }, [department_id, selectedAcademicYear]);

    const fetchAllStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const [oddSemResponse, evenSemResponse] = await Promise.all([
                axios.get(`https://teacher-attainment-system-backend.onrender.com/admin/student/get-students`, {
                    params: {
                        dept_id: department_id,
                        sem: 'ODD',
                        academic_yr: selectedAcademicYear
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`https://teacher-attainment-system-backend.onrender.com/admin/student/get-students`, {
                    params: {
                        dept_id: department_id,
                        sem: 'EVEN',
                        academic_yr: selectedAcademicYear
                    },
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const combinedStudents = [
                ...(oddSemResponse.data || []),
                ...(evenSemResponse.data || [])
            ];

            setAllStudents(combinedStudents);
            setFilteredStudents(combinedStudents);
        } catch (error) {
            console.error("Error fetching students:", error);
            const errorMsg = error.response?.data?.error || "Failed to load students";
            setError(errorMsg);
            showErrorToast(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let filtered = [...allStudents];

        if (selectedClass) {
            filtered = filtered.filter(student => 
                student.class.toUpperCase() === selectedClass.toUpperCase()
            );
        }

        if (selectedSem !== "ALL") {
            filtered = filtered.filter(student => 
                student.sem.toUpperCase() === selectedSem
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(term) ||
                student.roll_no.toString().toLowerCase().includes(term)
            );
        }

        setFilteredStudents(filtered);
    }, [selectedClass, selectedSem, searchTerm, allStudents]);

    const resetFilters = () => {
        setSelectedClass("");
        setSelectedSem("ALL");
        setSearchTerm("");
    };

    const handleRefresh = async () => {
        setOperationLoading(true);
        try {
            await fetchAllStudents();
            toast.success("Student data refreshed", {
                autoClose: 3000,
                hideProgressBar: true
            });
        } catch (error) {
            showErrorToast("Failed to refresh data");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleAcademicYearChange = (e) => {
        setSelectedAcademicYear(e.target.value);
        resetFilters();
    };

    const showElective1 = !selectedClass || ['TE', 'BE'].includes(selectedClass);
    const showElective2 = !selectedClass || selectedClass === 'BE';

    return (
        <Container fluid className="p-4" style={{ position: "relative", minHeight: "80vh" }}>
            {/* Toast Container - only shows essential messages */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <LoaderPage loading={loading} />

            <h2 className="text-center text-primary mb-4">See Students</h2>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {/* Academic Year Selection */}
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Academic Year</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedAcademicYear}
                            onChange={handleAcademicYearChange}
                            disabled={loading}
                        >
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={8} className="d-flex align-items-end justify-content-end">
                    <Button 
                        variant="primary" 
                        onClick={handleRefresh}
                        disabled={loading || operationLoading}
                        className="me-2"
                    >
                        {operationLoading ? (
                            <>
                                <Spinner as="span" size="sm" animation="border" />
                                <span className="ms-2">Refreshing...</span>
                            </>
                        ) : "Refresh Data"}
                    </Button>
                </Col>
            </Row>

            {/* Filters Section */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Class</Form.Label>
                        <Form.Select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">All Classes</option>
                            <option value="FE">FE</option>
                            <option value="SE">SE</option>
                            <option value="TE">TE</option>
                            <option value="BE">BE</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Semester</Form.Label>
                        <Form.Select 
                            value={selectedSem}
                            onChange={(e) => setSelectedSem(e.target.value)}
                            disabled={loading}
                        >
                            <option value="ALL">All Semesters</option>
                            <option value="ODD">ODD</option>
                            <option value="EVEN">EVEN</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Name or Roll No"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSearchTerm("")}
                                disabled={!searchTerm || loading}
                            >
                                Clear
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>

            {/* Reset Button */}
            <Row className="mb-3">
                <Col className="text-end">
                    <Button 
                        variant="warning" 
                        onClick={resetFilters}
                        disabled={loading || (!selectedClass && selectedSem === "ALL" && !searchTerm)}
                    >
                        Reset Filters
                    </Button>
                </Col>
            </Row>

            {/* Students Count */}
            <Row className="mb-3">
                <Col>
                    <h5 className="text-secondary">
                        Showing: <span className="text-primary">{filteredStudents.length}</span> students
                        {allStudents.length !== filteredStudents.length && (
                            <span className="text-muted"> (of {allStudents.length} total)</span>
                        )}
                    </h5>
                </Col>
            </Row>

            {/* Students Table */}
            {!loading && (
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead className="table-dark">
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Seat No</th>
                                <th>Semester</th>
                                {showElective1 && <th>Elective 1</th>}
                                {showElective2 && <th>Elective 2</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={`${student.roll_no}-${student.sem}`}>
                                        <td>{student.roll_no}</td>
                                        <td>{student.name}</td>
                                        <td>{student.class}</td>
                                        <td>{student.seat_no || '-'}</td>
                                        <td>{student.sem.toUpperCase()}</td>
                                        {showElective1 && <td>{student.el1 || '-'}</td>}
                                        {showElective2 && <td>{student.el2 || '-'}</td>}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td 
                                        colSpan={5 + (showElective1 ? 1 : 0) + (showElective2 ? 1 : 0)} 
                                        className="text-center"
                                    >
                                        {allStudents.length === 0 ? "No students found" : "No matching students found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default SeeStudents;