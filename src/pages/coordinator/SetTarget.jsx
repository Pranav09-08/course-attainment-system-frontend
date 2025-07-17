import { useEffect, useState } from 'react';
import axios from 'axios';
import { showToast } from "../../components/Toast"; // Import toast function
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap'; // Bootstrap components


const SetTarget = () => {
    const [courses, setCourses] = useState([]);
    const [targets, setTargets] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // For search functionality
    const [selectedYear, setSelectedYear] = useState(""); // For filtering by year
    const [selectedSemester, setSelectedSemester] = useState(""); // For filtering by semester
    const [years, setYears] = useState([]); // You can dynamically populate this list based on your data
    const [semesters, setSemesters] = useState([]); // You can dynamically populate this list based on your data

    // Retrieve faculty ID safely from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const { user = {} } = storedUser;
    const { id: facultyId } = user;

    useEffect(() => {
        if (!facultyId) {
            console.error("Faculty ID is missing!");
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser?.accessToken;

        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        axios.get(`http://localhost:5001/set_target/course-coordinator/courses/${facultyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                const fetchedCourses = response.data || [];
                setCourses(fetchedCourses);
                console.log(fetchedCourses);

                // Dynamically set years and semesters based on fetched courses
                const yearsList = Array.from(new Set(fetchedCourses.map(course => course.academic_yr)));
                const semestersList = Array.from(new Set(fetchedCourses.map(course => course.sem)));

                setYears(yearsList);
                setSemesters(semestersList);
            })
            .catch(error => {
                console.error("Error fetching courses:", error);
                showToast("error", "No course found.");
            });
    }, [facultyId]);


    const handleTargetChange = (course_id, field, value) => {
        setTargets(prev => ({
            ...prev,
            [course_id]: {
                ...prev[course_id],
                [field]: value
            }
        }));
    };

    const handleSaveTargets = (course_id, dept_id, academic_yr) => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser?.accessToken;

        if (!token) {
            console.error("No authentication token found.");
            alert("Authentication token is missing.");
            return;
        }

        const courseTargets = targets[course_id] || {};
        console.log("Sending to backend:", {
            course_id,
            dept_id,
            academic_yr,
            ...courseTargets
        });


        axios.post('http://localhost:5001/set_target/course-target/set-targets', {
            course_id,
            dept_id,
            academic_yr,
            ...courseTargets
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(() => {
            showToast("success", "Targets updated successfully.");
            setSelectedCourse(null);
        }).catch(error => console.error("Error updating targets:", error));
    };

    const openModal = (course) => {
        setSelectedCourse(course);
    };

    const closeModal = () => {
        setSelectedCourse(null);
    };

    // Filtered courses based on search term and selected year/semester
    const filteredCourses = courses.filter(course => {
        return (
            (course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.course_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedYear ? course.academic_yr === selectedYear : true) &&
            (selectedSemester ? course.sem === selectedSemester : true)
        );
    });

    return (
        <div className="p-6 min-h-screen" style={{ background: 'transparent' }}>
            <h2 className="text-5xl font-bold text-primary mb-6 text-center">My Courses</h2>

            {/* Search and Filter UI */}
            <div className="d-flex justify-content-center mb-4">
                <InputGroup className="w-50">
                    <FormControl
                        placeholder="Search by Course Name or ID"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" id="button-addon2">Search</Button>
                </InputGroup>
            </div>

            <div className="d-flex justify-content-center mb-4">
                <Form.Select
                    className="w-25 mx-2"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="">Select Academic Year</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    className="w-25 mx-2"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}>
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                    ))}
                </Form.Select>
            </div>

            {filteredCourses.length === 0 ? (
                <p className="text-muted text-center">No courses found.</p>
            ) : (
                <div className="row justify-content-center">
                    {filteredCourses.map(course => (
                        <div key={course.course_id} className="col-md-6 mb-4">
                            <div className="card shadow-sm" style={{ minHeight: '300px', padding: '20px' }}>
                                <div className="card-body">
                                    <h5 className="card-title text-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
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
                                        onClick={() => openModal(course)}
                                        className="btn btn-outline-primary mt-3"
                                        style={{ width: '100%' }}
                                    >
                                        Set Target
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for setting targets */}
            {selectedCourse && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Set Targets for {selectedCourse.course_id}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    {['target1', 'target2', 'target3', 'sppu1', 'sppu2', 'sppu3'].map(field => (
                                        <div key={field} className="mb-3">
                                            <label className="form-label">{field.toUpperCase()}</label>
                                            <input
                                                type="number"
                                                defaultValue={selectedCourse[field] || ""}
                                                onChange={(e) => handleTargetChange(selectedCourse.course_id, field, e.target.value)}
                                                className="form-control"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleSaveTargets(selectedCourse.course_id, selectedCourse.dept_id, selectedCourse.academic_yr)}
                                >
                                    Save Targets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SetTarget;
