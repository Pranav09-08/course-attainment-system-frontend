import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";

const UpdateMarksForm = () => {
  const location = useLocation();
  const course = location.state?.course || {}; // Access passed course data

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Update Marks for {course.course_name}</h2>
      
      <div className="card shadow-sm p-4">
        <p><strong>Course ID:</strong> {course.course_id}</p>
        <p><strong>Class:</strong> {course.class}</p>
        <p><strong>Semester:</strong> {course.sem}</p>
        <p><strong>Department:</strong> {course.dept_name}</p>
        <p><strong>Academic Year:</strong> {course.academic_yr}</p>

        {/* Update marks form goes here */}
        <Button variant="primary">Submit Marks</Button>
      </div>
    </div>
  );
};

export default UpdateMarksForm;
