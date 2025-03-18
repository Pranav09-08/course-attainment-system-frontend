import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, InputGroup, Button, Container, Row, Col, Spinner } from "react-bootstrap";

const SeeStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentCount, setStudentCount] = useState(0); // State to store count

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
        try {
            const response = await axios.get(
                `https://teacher-attainment-system-backend.onrender.com/admin/student/get-students?dept_id=${department_id}`
            );
            const studentsData = response.data;

            setStudents(studentsData);
            setFilteredStudents(studentsData);

            // Extract unique values for filters
            const uniqueAcademicYears = [...new Set(studentsData.map(student => student.academic_yr))];
            const uniqueYears = [...new Set(studentsData.map(student => student.class.slice(0, 2)))];
            const uniqueDivisions = [...new Set(
                studentsData
                    .filter(student => !selectedYear || student.class.startsWith(selectedYear)) // Filter by year if selected
                    .map(student => student.class) // Extract class names
            )];
            setDivisions(uniqueDivisions);




            setAcademicYears(uniqueAcademicYears);
            setYears(uniqueYears);
            setDivisions(uniqueDivisions);
        } catch (error) {
            console.error("Error fetching students:", error);
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
            filtered = filtered.filter(student => student.class.endsWith(selectedDivision));
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

    // Reset filters
    const resetFilters = () => {
        setSelectedAcademicYear("");
        setSelectedYear("");
        setSelectedDivision("");
        setSearchTerm("");
    };

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">See Students</h2>

            {/* Filters Section */}
            <Row className="mb-4 g-3 d-flex align-items-center">
                {/* Academic Year Filter */}
                <Col xs={12} sm={6} md={3}>
                    <Form.Select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
                        <option value="">All Academic Years</option>
                        {academicYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>

                {/* Year Filter */}
                <Col xs={12} sm={6} md={3}>
                    <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Form.Select>
                </Col>

                {/* Division Filter */}
                <Col xs={12} sm={6} md={3}>
                    <Form.Select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
                        <option value="">All Divisions</option>
                        {divisions.map((div) => (
                            <option key={div} value={div}>{div}</option>
                        ))}
                    </Form.Select>
                </Col>

                {/* Search Bar */}
                <Col xs={12} sm={6} md={3}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search by Name or Roll No."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>Clear</Button>
                    </InputGroup>
                </Col>
            </Row>

            {/* Reset Filters Button */}
            <Row className="mb-3">
                <Col className="text-end">
                    <Button variant="warning" onClick={resetFilters}>Reset Filters</Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <h5 className="text-secondary">
                        Total Students: <span className="text-primary">{studentCount}</span>
                    </h5>
                </Col>
            </Row>


            {/* Loading Spinner */}
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading students...</p>
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
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
                                    <td>{student.mobile_no}</td>
                                    <td>{student.class}</td>
                                    <td>{student.academic_yr}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No students found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default SeeStudents;
