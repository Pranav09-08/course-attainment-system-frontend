import { useEffect, useState } from 'react';
import axios from 'axios';

// Retrieve faculty ID safely from localStorage
const storedUser = JSON.parse(localStorage.getItem("user")) || {}; // Prevents null issues
const { user = {} } = storedUser;
const { id: facultyId } = user;

const SetTarget = () => {
    const [courses, setCourses] = useState([]); // Ensure courses is always an array
    const [targets, setTargets] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        if (!facultyId) {
            console.error("Faculty ID is missing!");
            return;
        }

        axios.get(`http://localhost:5001/set_target/course-coordinator/courses/${facultyId}`)
            .then(response => {
                setCourses(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error("Error fetching courses:", error);
                setCourses([]); // Ensure empty array if API fails
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
        const courseTargets = targets[course_id] || {};

        axios.post('http://localhost:5001/set_target/course-target/set-targets', {
            course_id,
            dept_id,
            academic_yr,
            ...courseTargets
        }).then(() => {
            alert('Targets updated successfully');
            setSelectedCourse(null);  // Close the modal after saving
        })
        .catch(error => console.error("Error updating targets:", error));
    };

    const openModal = (course) => {
        setSelectedCourse(course);
    };

    const closeModal = () => {
        setSelectedCourse(null);
    };

    return (
        <div className="p-6 min-h-screen" style={{ background: 'transparent' }}>
            {/* Centered "My Courses" heading */}
            <h2 className="text-5xl font-bold text-primary mb-6 text-center">My Courses</h2>

            {courses.length === 0 ? (
    <p className="text-muted text-center">No courses found.</p>
) : (
    <div className="row justify-content-center">
        {courses.map(course => (
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
                            <strong>Department:</strong> {course.dept_id} | <strong>Academic Year:</strong> {course.academic_yr}
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
