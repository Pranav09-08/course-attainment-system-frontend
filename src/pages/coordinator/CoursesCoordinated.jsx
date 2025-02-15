// CoursesCoordinated.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CoursesCoordinated = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")); // Retrieve user details
  const { user } = storedUser;
  const { id: facultyId } = user; // Extract facultyId from user

  // Fetch courses assigned to the coordinator
  useEffect(() => {
    console.log("Fetching courses for faculty ID:", facultyId); // Log faculty ID to check the correct value
    axios.get(`https://teacher-attainment-system-backend.onrender.com/api/coordinator-courses?faculty_id=${facultyId}`)
      .then(response => {
        console.log("Courses fetched successfully:", response.data); // Log the fetched courses
        setCourses(response.data);
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
      });
  }, [facultyId]);

  const handleViewAttainment = (courseId, academicYear) => {
    console.log("Navigating to Attainment with courseId:", courseId, "and academicYear:", academicYear);
    // Navigate to the CourseAttainment page with courseId and academicYear
    navigate(`/coordinator-dashboard/attainment/${courseId}/${academicYear}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-4">My Courses</h2>
      {courses.length === 0 ? (
        <p className="text-white">No courses assigned.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.course_id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <p className="text-white"><strong>Course ID:</strong> {course.course_id}</p>
              <p className="text-white"><strong>Academic Year:</strong> {course.academic_yr}</p>
              <p className="text-white"><strong>Department:</strong> {course.dept_id}</p>
              <p className="text-white"><strong>Class:</strong> {course.class}</p>
              <p className="text-white"><strong>Semester:</strong> {course.sem}</p>
              <button 
                onClick={() => handleViewAttainment(course.course_id, course.academic_yr)} // Pass courseId and academicYear
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                View Attainment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesCoordinated;
