import { useState } from "react";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../components/Toast";

/**
 * AddCourse Component - Allows administrators to add new courses to the system
 * 
 * Features:
 * - Form validation with real-time feedback
 * - Auto-calculation of final semester marks
 * - Tooltips for form field guidance
 * - Responsive design with loading states
 * - Error handling with user-friendly messages
 */
const AddCourse = () => {
  // State management for form data
  const [course, setCourse] = useState({
    course_id: "",
    course_name: "",
    class: "",
    ut: "",
    insem: "",
    endsem: "",
    finalsem: "", // Auto-calculated field
  });

  // State for form validation and UI
  const [errors, setErrors] = useState({});       // Stores validation errors
  const [touched, setTouched] = useState({});    // Tracks touched fields
  const [loading, setLoading] = useState(false); // Loading state for API calls

  // Help text for form fields (shown as tooltips on hover)
  const fieldTooltips = {
    course_id: "Enter course ID (letters and numbers only)",
    course_name: "Enter course name (letters and spaces only)",
    class: "Select FE, SE, TE, or BE",
    ut: "Enter unit test marks (numbers only)",
    insem: "Enter in-semester marks (numbers only)",
    endsem: "Enter end-semester marks (numbers only)"
  };

  const validateField = (name, value) => {
    switch (name) {
      case "course_id":
        if (!value.trim()) return "Course ID is required";
        if (!/^[A-Za-z0-9]+$/.test(value)) return "Only letters and numbers allowed";
        break;
      case "course_name":
        if (!value.trim()) return "Course name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters and spaces allowed";
        break;
      case "class":
        if (!value) return "Class is required";
        if (!["FE", "SE", "TE", "BE"].includes(value)) return "Select a valid class";
        break;
      case "ut":
      case "insem":
      case "endsem":
        if (!value) return "Marks are required";
        if (!/^\d+$/.test(value)) return "Only numbers allowed";
        if (parseInt(value, 10) < 0) return "Must be positive";
        break;
      default:
        break;
    }
    return ""; // No error
  };

  /**
   * Handles form field changes and triggers validation
   * @param {Object} e - Change event from form input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update course state with new value
    setCourse(prev => {
      const updatedCourse = { ...prev, [name]: value };

      // Auto-calculate finalsem when insem or endsem changes
      if (name === "insem" || name === "endsem") {
        const insemVal = parseInt(updatedCourse.insem, 10) || 0;
        const endsemVal = parseInt(updatedCourse.endsem, 10) || 0;
        updatedCourse.finalsem = insemVal + endsemVal;
      }

      return updatedCourse;
    });

    // Validate the changed field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Mark field as touched if it has a value
    if (value) setTouched(prev => ({ ...prev, [name]: true }));
  };

  /**
   * Marks a field as touched when it loses focus
   * @param {Object} e - Blur event from form input
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  /**
   * Validates the entire form before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields except finalsem (which is auto-calculated)
    Object.keys(course).forEach(key => {
      if (key !== "finalsem") {
        const error = validateField(key, course[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    // Mark all fields as touched to show errors
    setTouched({
      course_id: true,
      course_name: true,
      class: true,
      ut: true,
      insem: true,
      endsem: true
    });
    
    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Please fix the form errors before submitting');
      return;
    }

    // Get authentication token from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast('error', 'Unauthorized: Please log in again');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API request
      const formattedData = {
        course_id: course.course_id,
        course_name: course.course_name,
        class: course.class,
        ut: parseInt(course.ut, 10),
        insem: parseInt(course.insem, 10),
        endsem: parseInt(course.endsem, 10),
        finalsem: parseInt(course.finalsem, 10),
      };

      // Make API call to add course
      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/course/add-course",
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset form on success
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
      setTouched({});
    } catch (error) {
      // Handle API errors
      const errorMsg = error.response?.data?.error || "Failed to add course. Please try again.";
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during API calls
  if (loading) {
    return (
      <div className="text-center mt-5">
        <LoaderPage loading={loading} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-light rounded">
            <div className="card-header bg-primary text-white text-center">
              <h3>Add New Course</h3>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                {/* Course ID Field */}
                <div className="mb-3">
                  <label htmlFor="course_id" className="form-label">Course ID</label>
                  <input
                    type="text"
                    name="course_id"
                    id="course_id"
                    placeholder="Enter Course ID"
                    value={course.course_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.course_id && touched.course_id ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.course_id}
                  />
                  {errors.course_id && touched.course_id && (
                    <div className="text-danger small mt-1">{errors.course_id}</div>
                  )}
                </div>

                {/* Course Name Field */}
                <div className="mb-3">
                  <label htmlFor="course_name" className="form-label">Course Name</label>
                  <input
                    type="text"
                    name="course_name"
                    id="course_name"
                    placeholder="Enter Course Name"
                    value={course.course_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.course_name && touched.course_name ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.course_name}
                  />
                  {errors.course_name && touched.course_name && (
                    <div className="text-danger small mt-1">{errors.course_name}</div>
                  )}
                </div>

                {/* Class Selection Field */}
                <div className="mb-3">
                  <label htmlFor="class" className="form-label">Class</label>
                  <select
                    name="class"
                    id="class"
                    value={course.class}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.class && touched.class ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.class}
                  >
                    <option value="">Select Class</option>
                    <option value="FE">FE</option>
                    <option value="SE">SE</option>
                    <option value="TE">TE</option>
                    <option value="BE">BE</option>
                  </select>
                  {errors.class && touched.class && (
                    <div className="text-danger small mt-1">{errors.class}</div>
                  )}
                </div>

                {/* Unit Test Marks Field */}
                <div className="mb-3">
                  <label htmlFor="ut" className="form-label">Unit Test Marks</label>
                  <input
                    type="text"
                    name="ut"
                    id="ut"
                    placeholder="Enter Unit Test Marks"
                    value={course.ut}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.ut && touched.ut ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.ut}
                  />
                  {errors.ut && touched.ut && (
                    <div className="text-danger small mt-1">{errors.ut}</div>
                  )}
                </div>

                {/* In-Semester Marks Field */}
                <div className="mb-3">
                  <label htmlFor="insem" className="form-label">In-Semester Marks</label>
                  <input
                    type="text"
                    name="insem"
                    id="insem"
                    placeholder="Enter In-Semester Marks"
                    value={course.insem}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.insem && touched.insem ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.insem}
                  />
                  {errors.insem && touched.insem && (
                    <div className="text-danger small mt-1">{errors.insem}</div>
                  )}
                </div>

                {/* End-Semester Marks Field */}
                <div className="mb-3">
                  <label htmlFor="endsem" className="form-label">End-Semester Marks</label>
                  <input
                    type="text"
                    name="endsem"
                    id="endsem"
                    placeholder="Enter End-Semester Marks"
                    value={course.endsem}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.endsem && touched.endsem ? "is-invalid" : ""}`}
                    required
                    title={fieldTooltips.endsem}
                  />
                  {errors.endsem && touched.endsem && (
                    <div className="text-danger small mt-1">{errors.endsem}</div>
                  )}
                </div>

                {/* Final Semester Marks (Read-only) */}
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

                {/* Submit Button */}
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