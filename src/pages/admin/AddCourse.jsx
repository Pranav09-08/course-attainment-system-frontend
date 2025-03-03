import { useState } from "react";
import axios from "axios";

const AddCourse = () => {
  const [course, setCourse] = useState({
    course_id: "",
    course_name: "",
    class: "", // Added class field
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "", // This will be calculated automatically
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

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(course.course_name)) {
      alert("Course Name should contain only letters.");
      return false;
    }

    if (!course.class) {
      alert("Select a class (FE, SE, TE, BE).");
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

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCourse((prevCourse) => {
      let updatedCourse = { ...prevCourse, [name]: value };

      // Automatically calculate finalsem (insem + endsem)
      if (name === "insem" || name === "endsem") {
        const insemVal = parseInt(updatedCourse.insem, 10) || 0;
        const endsemVal = parseInt(updatedCourse.endsem, 10) || 0;
        updatedCourse.finalsem = insemVal + endsemVal;
      }

      return updatedCourse;
    });
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
      const formattedData = {
        course_id: course.course_id,
        course_name: course.course_name,
        class: course.class, // Send class to backend
        ut: parseInt(course.ut, 10),
        insem: parseInt(course.insem, 10),
        endsem: parseInt(course.endsem, 10),
        finalsem: parseInt(course.finalsem, 10), // Send calculated finalsem
      };

      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/course/add-course",
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Course added successfully!");
      setCourse({
        course_id: "",
        course_name: "",
        class: "",
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
                <div className="mb-3">
                  <label htmlFor="course_id" className="form-label">Course ID</label>
                  <input
                    type="text"
                    name="course_id"
                    id="course_id"
                    placeholder="Enter Course ID"
                    value={course.course_id}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="course_name" className="form-label">Course Name</label>
                  <input
                    type="text"
                    name="course_name"
                    id="course_name"
                    placeholder="Enter Course Name"
                    value={course.course_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="class" className="form-label">Class</label>
                  <select
                    name="class"
                    id="class"
                    value={course.class}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="FE">FE</option>
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="ut" className="form-label">Unit Test Marks</label>
                  <input
                    type="number"
                    name="ut"
                    id="ut"
                    placeholder="Enter Unit Test Marks"
                    value={course.ut}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="insem" className="form-label">In-Semester Marks</label>
                  <input
                    type="number"
                    name="insem"
                    id="insem"
                    placeholder="Enter In-Semester Marks"
                    value={course.insem}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="endsem" className="form-label">End-Semester Marks</label>
                  <input
                    type="number"
                    name="endsem"
                    id="endsem"
                    placeholder="Enter End-Semester Marks"
                    value={course.endsem}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="finalsem" className="form-label">Final Semester Marks</label>
                  <input
                    type="number"
                    name="finalsem"
                    id="finalsem"
                    value={course.finalsem}
                    className="form-control"
                    readOnly // Makes it uneditable
                  />
                </div>

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
