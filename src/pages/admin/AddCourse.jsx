import { useState } from "react";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast"; // Import toast function

const AddCourse = () => {
  const [course, setCourse] = useState({
    course_id: "",
    course_name: "",
    class: "",
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!course.course_id.trim()) {
      newErrors.course_id = "Course ID is required.";
    } else if (!/^[A-Za-z0-9]+$/.test(course.course_id)) {
      newErrors.course_id = "Course ID should contain only alphabets and numbers.";
    }

    if (!course.course_name.trim()) {
      newErrors.course_name = "Course Name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(course.course_name)) {
      newErrors.course_name = "Course Name should contain only alphabets and spaces.";
    }

    if (!course.class) {
      newErrors.class = "Class is required.";
    } else if (!["FE", "SE", "TE", "BE"].includes(course.class)) {
      newErrors.class = "Invalid class selected.";
    }

    if (!course.ut) {
      newErrors.ut = "Unit Test marks are required.";
    } else if (!/^\d+$/.test(course.ut) || parseInt(course.ut, 10) < 0) {
      newErrors.ut = "Unit Test marks must be a valid positive integer.";
    }

    if (!course.insem) {
      newErrors.insem = "In-Semester marks are required.";
    } else if (!/^\d+$/.test(course.insem) || parseInt(course.insem, 10) < 0) {
      newErrors.insem = "In-Semester marks must be a valid positive integer.";
    }

    if (!course.endsem) {
      newErrors.endsem = "End-Semester marks are required.";
    } else if (!/^\d+$/.test(course.endsem) || parseInt(course.endsem, 10) < 0) {
      newErrors.endsem = "End-Semester marks must be a valid positive integer.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["ut", "insem", "endsem"].includes(name)) {
      if (!/^\d*$/.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Only positive integers are allowed.",
        }));
        return;
      }
    }

    setCourse((prevCourse) => {
      let updatedCourse = { ...prevCourse, [name]: value };

      if (name === "insem" || name === "endsem") {
        const insemVal = parseInt(updatedCourse.insem, 10) || 0;
        const endsemVal = parseInt(updatedCourse.endsem, 10) || 0;
        updatedCourse.finalsem = insemVal + endsemVal;
      }

      return updatedCourse;
    });

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast('error', 'Please fix the form errors before submitting');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast('error', 'Unauthorized: Please log in again');
      return;
    }

    try {
      setLoading(true);

      const formattedData = {
        course_id: course.course_id,
        course_name: course.course_name,
        class: course.class,
        ut: parseInt(course.ut, 10),
        insem: parseInt(course.insem, 10),
        endsem: parseInt(course.endsem, 10),
        finalsem: parseInt(course.finalsem, 10),
      };

      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/course/add-course",
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast('success', 'Course added successfully!');
      setCourse({
        course_id: "",
        course_name: "",
        class: "",
        ut: "",
        insem: "",
        endsem: "",
        finalsem: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding course:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || "Failed to add course. Please try again.";
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <LoaderPage loading={loading} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
                    className={`form-control ${errors.course_id ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.course_id && (
                    <div className="invalid-feedback">{errors.course_id}</div>
                  )}
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
                    className={`form-control ${errors.course_name ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.course_name && (
                    <div className="invalid-feedback">{errors.course_name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="class" className="form-label">Class</label>
                  <select
                    name="class"
                    id="class"
                    value={course.class}
                    onChange={handleChange}
                    className={`form-control ${errors.class ? "is-invalid" : ""}`}
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="FE">FE</option>
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                  </select>
                  {errors.class && (
                    <div className="invalid-feedback">{errors.class}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="ut" className="form-label">Unit Test Marks</label>
                  <input
                    type="text"
                    name="ut"
                    id="ut"
                    placeholder="Enter Unit Test Marks"
                    value={course.ut}
                    onChange={handleChange}
                    className={`form-control ${errors.ut ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.ut && (
                    <div className="invalid-feedback">{errors.ut}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="insem" className="form-label">In-Semester Marks</label>
                  <input
                    type="text"
                    name="insem"
                    id="insem"
                    placeholder="Enter In-Semester Marks"
                    value={course.insem}
                    onChange={handleChange}
                    className={`form-control ${errors.insem ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.insem && (
                    <div className="invalid-feedback">{errors.insem}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="endsem" className="form-label">End-Semester Marks</label>
                  <input
                    type="text"
                    name="endsem"
                    id="endsem"
                    placeholder="Enter End-Semester Marks"
                    value={course.endsem}
                    onChange={handleChange}
                    className={`form-control ${errors.endsem ? "is-invalid" : ""}`}
                    required
                  />
                  {errors.endsem && (
                    <div className="invalid-feedback">{errors.endsem}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="finalsem" className="form-label">Final Semester Marks</label>
                  <input
                    type="number"
                    name="finalsem"
                    id="finalsem"
                    value={course.finalsem}
                    className="form-control"
                    readOnly
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