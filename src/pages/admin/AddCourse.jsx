import { useState } from "react";
import axios from "axios";

const AddCourse = () => {
  const [course, setCourse] = useState({
    course_id: "",
    course_name: "",
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    if (!course.course_id.trim()) {
      alert("Enter Course ID");
      return false;
    }
  
    if (!course.course_name.trim()) {
      alert("Enter Course Name");
      return false;
    }
  
    // Check if course_name contains only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(course.course_name)) {
      alert("Course Name should contain only letters.");
      return false;
    }
  
    if (course.ut === "" || isNaN(course.ut)) {
      alert("Enter valid Unit Test marks.");
      return false;
    }
  
    if (course.insem === "" || isNaN(course.insem)) {
      alert("Enter valid In-Semester marks.");
      return false;
    }
  
    if (course.endsem === "" || isNaN(course.endsem)) {
      alert("Enter valid End-Semester marks.");
      return false;
    }
  
    if (course.finalsem === "" || isNaN(course.finalsem)) {
      alert("Enter valid Final Semester marks.");
      return false;
    }
  
    return true;
  };
  

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) {
      return;
    }
  
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;
  
    if (!token) {
      alert("Unauthorized: Please log in again.");
      return;
    }
  
    try {
      // Convert numerical values from string to integer
      const formattedData = {
        course_id: course.course_id,
        course_name: course.course_name,
        ut: parseInt(course.ut, 10),   // Convert to integer
        insem: parseInt(course.insem, 10),  // Convert to integer
        endsem: parseInt(course.endsem, 10),  // Convert to integer
        finalsem: parseInt(course.finalsem, 10),  // Convert to integer
      };
  
      await axios.post(
        "http://localhost:5001/admin/course/add-course",
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert("Course added successfully!");
      setCourse({
        course_id: "",
        course_name: "",
        ut: "",
        insem: "",
        endsem: "",
        finalsem: "",
      });
  
    } catch (error) {
      console.error("Error adding course:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to add course. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-light rounded">
            <div className="card-header bg-primary text-white text-center">
              <h3>Add New Course</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {Object.entries(course).map(([key, value]) => (
                  <div className="mb-3" key={key}>
                    <label htmlFor={key} className="form-label">
                      {key.replace("_", " ").toUpperCase()}
                    </label>
                    <input
                      type="text"
                      name={key}
                      id={key}
                      placeholder={`Enter ${key.replace("_", " ")}`}
                      value={value}
                      onChange={handleChange}
                      className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                      required
                    />
                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                  </div>
                ))}
                <div className="text-center">
                  <button type="submit" className="btn btn-primary w-100">
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;