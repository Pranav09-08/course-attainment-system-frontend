import { useState, useEffect } from "react";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../components/Toast";
import "react-toastify/dist/ReactToastify.css";

/**
 * AddFaculty Component - Allows administrators to add new faculty members to the system
 * 
 * Features:
 * - Comprehensive form validation with real-time feedback
 * - Password strength validation with multiple criteria
 * - Email domain restriction (PICT.edu or Gmail.com)
 * - Loading states for better user experience
 * - Success/error notifications with toast messages
 * - Responsive design with card layout
 */
const AddFaculty = () => {
  // State management for form data
  const [faculty, setFaculty] = useState({
    name: "",
    email: "",
    mobile_no: "",
    dept_id: "", // Automatically set from logged-in user
    password: "",
    confirmPassword: "",
  });

  // State for form validation and UI
  const [errors, setErrors] = useState({});         // Stores validation errors
  const [touched, setTouched] = useState({});      // Tracks touched fields
  const [loading, setLoading] = useState(false);    // General loading state
  const [operationLoading, setOperationLoading] = useState(false); // Submission loading state

  // Set department ID from logged-in user on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user?.id) {
      setFaculty((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);

  /**
   * Validates a single form field based on specific rules
   * @param {string} name - Field name to validate
   * @param {string} value - Field value to validate
   * @returns {string} Error message if invalid, empty string if valid
   */
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
          error = "Name must contain only letters and spaces";
        }
        break;
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/^[a-zA-Z0-9._%+-]+@(pict\.edu|gmail\.com)$/.test(value)) {
          error = "Must be a valid PICT.edu or Gmail.com address";
        }
        break;
      case "mobile_no":
        if (!value) {
          error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Mobile number must be exactly 10 digits";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!/[A-Z]/.test(value)) {
          error = "Must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(value)) {
          error = "Must contain at least one number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = "Must contain at least one special character";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== faculty.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  /**
   * Handles form field changes and triggers validation
   * @param {Object} e - Change event from form input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaculty(prev => ({ ...prev, [name]: value }));
    
    // Validate the field immediately as user types
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Mark field as touched if it has a value
    if (value) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
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

    // Validate all fields except dept_id (which is auto-set)
    Object.keys(faculty).forEach(key => {
      if (key !== "dept_id") {
        const error = validateField(key, faculty[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    // Mark all fields as touched when submitting
    setTouched({
      name: true,
      email: true,
      mobile_no: true,
      password: true,
      confirmPassword: true
    });
    return isValid;
  };

  /**
   * Handles form submission to add new faculty
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Please fix the form errors before submitting');
      return;
    }

    setOperationLoading(true);

    // Get authentication token from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;

    if (!token) {
      showToast("error", "Unauthorized: Please log in again");
      setOperationLoading(false);
      return;
    }

    try {
      // Make API call to add faculty
      const response = await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/add-faculty",
        faculty,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form on success
      showToast(
        "success",
        "Faculty added successfully! Credentials sent to their email."
      );
      setFaculty({
        name: "",
        email: "",
        mobile_no: "",
        dept_id: storedUser.user.id,
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      // Handle API errors
      showToast(
        "error",
        error.response?.data?.message ||
          "Faculty ID already exist"
      );
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ position: "relative" }}>
      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      
      {/* Loading spinner overlay */}
      <LoaderPage loading={operationLoading || loading} />

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-light rounded">
            <div className="card-header bg-primary text-white text-center">
              <h3>Add New Faculty</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter Name"
                    value={faculty.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.name && touched.name ? "is-invalid" : ""
                    }`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.name && touched.name && (
                    <div className="text-danger small mt-1">{errors.name}</div>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter Email (PICT Mail only)"
                    value={faculty.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.email && touched.email ? "is-invalid" : ""
                    }`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.email && touched.email && (
                    <div className="text-danger small mt-1">{errors.email}</div>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div className="mb-3">
                  <label htmlFor="mobile_no" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile_no"
                    id="mobile_no"
                    placeholder="Enter Mobile No (10 digits)"
                    value={faculty.mobile_no}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.mobile_no && touched.mobile_no ? "is-invalid" : ""
                    }`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.mobile_no && touched.mobile_no && (
                    <div className="text-danger small mt-1">{errors.mobile_no}</div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter Password (Min. 6 characters)"
                    value={faculty.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.password && touched.password ? "is-invalid" : ""
                    }`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.password && touched.password && (
                    <div className="text-danger small mt-1">{errors.password}</div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={faculty.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.confirmPassword && touched.confirmPassword ? "is-invalid" : ""
                    }`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="text-danger small mt-1">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      "Add Faculty"
                    )}
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

export default AddFaculty;