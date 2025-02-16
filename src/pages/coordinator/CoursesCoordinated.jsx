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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Courses fetched successfully:", response.data);
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, [facultyId]);

  const handleViewAttainment = (courseId, academicYear,dept_id) => {
    console.log(
      "Navigating to Attainment with courseId:",
      courseId,
      "and academicYear:",
      academicYear
    );
    navigate(`/coordinator-dashboard/attainment/${courseId}/${academicYear}/${dept_id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        My Courses
      </h2>

      {courses.length === 0 ? (
        <p className="text-muted text-center">No courses assigned.</p>
      ) : (
        <div className="row justify-content-center">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="col-md-6 mb-4" // This ensures two cards in a row on medium-sized screens
            >
              <div
                className="card shadow-sm"
                style={{
                  minHeight: "300px",
                  padding: "15px", // Reduced padding to fit content better
                }}
              >
                <div className="card-body p-3"> {/* Reduced padding inside card body */}
                  <h5
                    className="card-title text-primary mb-2"
                    style={{
                      fontSize: "1.2rem", // Reduced font size for better fit
                      fontWeight: "bold",
                    }}
                  >
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
                    <strong>Department:</strong> {course.dept_id} |{" "}
                    <strong>Academic Year:</strong> {course.academic_yr}
                  </p>

                  <button
                    onClick={() =>
                      handleViewAttainment(course.course_id, course.academic_yr,course.dept_id)
                    }
                    className="btn btn-outline-primary w-10 me-3" // Full-width button
                  >
                    View Attainment
                  </button>
                  <button className="btn btn-outline-secondary w-48">
                      Details
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesCoordinated;
