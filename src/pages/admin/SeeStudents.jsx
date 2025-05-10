import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, InputGroup, Button, Container, Row, Col, Alert } from "react-bootstrap";
import LoaderPage from "../../components/LoaderPage"; // Adjust path as needed

const SeeStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentCount, setStudentCount] = useState(0);
    const [error, setError] = useState(null);

    const [academicYears, setAcademicYears] = useState([]);
    const [years, setYears] = useState([]);
    const [divisions, setDivisions] = useState([]);

    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const department_id = storedUser?.user?.id || "";

    useEffect(() => {
        if (department_id) {
            fetchStudents();
        }
    }, [department_id]);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `https://teacher-attainment-system-backend.onrender.com/admin/student/get-students?dept_id=${department_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${storedUser?.accessToken}`
                    }
                }
            );
            const studentsData = response.data;

            setStudents(studentsData);
            setFilteredStudents(studentsData);

            // Extract unique values for filters
            const uniqueAcademicYears = [...new Set(studentsData.map(student => student.academic_yr))];
            const uniqueYears = [...new Set(studentsData.map(student => student.class.slice(0, 2)))];
            const uniqueDivisions = [...new Set(studentsData.map(student => student.class))];

            setAcademicYears(uniqueAcademicYears);
            setYears(uniqueYears);
            setDivisions(uniqueDivisions);
        } catch (error) {
            console.error("Error fetching students:", error);
            setError(error.response?.data?.message || "Failed to load students. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Filter students dynamically
    useEffect(() => {
        let filtered = students;

        if (selectedAcademicYear) {
            filtered = filtered.filter(student => student.academic_yr === selectedAcademicYear);
        }
        if (selectedYear) {
            filtered = filtered.filter(student => student.class.includes(selectedYear));
        }
        if (selectedDivision) {
            filtered = filtered.filter(student => student.class === selectedDivision);
        }
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roll_no.toString().includes(searchTerm)
            );
        }

        setFilteredStudents(filtered);
        setStudentCount(filtered.length);
    }, [selectedAcademicYear, selectedYear, selectedDivision, searchTerm, students]);

    const resetFilters = () => {
        setSelectedAcademicYear("");
        setSelectedYear("");
        setSelectedDivision("");
        setSearchTerm("");
    };

    return (
        <Container fluid className="p-4" style={{ position: "relative", minHeight: "80vh" }}>
            {/* Loader Component */}
            <LoaderPage loading={loading} />

            <h2 className="text-center text-primary mb-4">See Students</h2>

            {error && (
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            )}

            {/* Filters Section */}
            <Row className="mb-4 g-3 d-flex align-items-center">
                <Col xs={12} sm={6} md={3}>
                    <Form.Select 
                        value={selectedAcademicYear} 
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Academic Years</option>
                        {academicYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <Form.Select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <Form.Select 
                        value={selectedDivision} 
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Divisions</option>
                        {divisions.map((div) => (
                            <option key={div} value={div}>{div}</option>
                        ))}
                    </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search by Name or Roll No."
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
                </Col>
            </Row>

            {/* Reset Filters Button */}
            <Row className="mb-3">
                <Col className="text-end">
                    <Button 
                        variant="warning" 
                        onClick={resetFilters}
                        disabled={loading || (
                            !selectedAcademicYear && 
                            !selectedYear && 
                            !selectedDivision && 
                            !searchTerm
                        )}
                    >
                        Reset Filters
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <h5 className="text-secondary">
                        Total Students: <span className="text-primary">{studentCount}</span>
                    </h5>
                </Col>
            </Row>

            {/* Students Table */}
            {!loading && (
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile No</th>
                            <th>Class</th>
                            <th>Academic Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.roll_no}>
                                    <td>{student.roll_no}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.mobile_no || "N/A"}</td>
                                    <td>{student.class}</td>
                                    <td>{student.academic_yr}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    {students.length === 0 ? "No students found" : "No matching students found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default SeeStudents;