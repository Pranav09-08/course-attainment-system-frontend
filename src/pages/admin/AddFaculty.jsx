import { useState, useEffect } from "react";
import axios from "axios";
import LoaderPage from "../../components/LoaderPage"; // Adjust the path as needed

const AddFaculty = () => {
  const [faculty, setFaculty] = useState({
    name: "",
    email: "",
    mobile_no: "",
    dept_id: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // For initial loading if needed
  const [operationLoading, setOperationLoading] = useState(false); // For form submission

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user?.id) {
      setFaculty((prev) => ({ ...prev, dept_id: storedUser.user.id }));
    }
  }, []);

  const validate = () => {
    let newErrors = {};

    // Validate Name (Only alphabets and spaces)
    if (!/^[A-Za-z\s]+$/.test(faculty.name.trim())) {
      newErrors.name = "Name must contain only letters and spaces.";
    }

    // ✅ Validate Email (Must be a valid @pict.edu address)
    if (!/^[a-zA-Z0-9._%+-]+@pict\.edu$/.test(faculty.email)) {
      newErrors.email = "Email must be a valid PICT address (e.g., username@pict.edu).";
    }


    // Validate Mobile Number (Exactly 10 digits)
    if (!/^\d{10}$/.test(faculty.mobile_no)) {
      newErrors.mobile_no = "Mobile number must be exactly 10 digits.";
    }

    // Validate Password (At least 6 characters)
    if (faculty.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFaculty({ ...faculty, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setOperationLoading(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.accessToken;
    const { user } = storedUser;
    const { id: department } = user;

    if (!token) {
      alert("Unauthorized: Please log in again.");
      setOperationLoading(false);
      return;
    }

    try {
      await axios.post(
        "https://teacher-attainment-system-backend.onrender.com/admin/add-faculty",
        faculty,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Faculty added successfully!");
      setFaculty({
        name: "",
        email: "",
        mobile_no: "",
        dept_id: storedUser.user.id,
        password: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding faculty:", error.response?.data || error.message);
      alert("Failed to add faculty. Please try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ position: "relative" }}>
      {/* Full-page loader for operations */}
      <LoaderPage loading={operationLoading || loading} />

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-light rounded">
            <div className="card-header bg-primary text-white text-center">
              <h3>Add New Faculty</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter Name"
                    value={faculty.name}
                    onChange={handleChange}
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter Email (PICT Mail only)"
                    value={faculty.email}
                    onChange={handleChange}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="mobile_no" className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile_no"
                    id="mobile_no"
                    placeholder="Enter Mobile No (10 digits)"
                    value={faculty.mobile_no}
                    onChange={handleChange}
                    className={`form-control ${errors.mobile_no ? "is-invalid" : ""}`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.mobile_no && <div className="invalid-feedback">{errors.mobile_no}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter Password (Min. 6 characters)"
                    value={faculty.password}
                    onChange={handleChange}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    required
                    disabled={operationLoading}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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