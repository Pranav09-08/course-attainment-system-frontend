import React, { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "../components/LoaderPage";
import { showToast } from "../components/Toast";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CButton,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
} from "@coreui/react";
import { FaCamera } from "react-icons/fa";

const Profile = () => {
  // Constants
  const backendBaseUrl = "https://teacher-attainment-system-backend.onrender.com";
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // State
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  // User data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userRole = storedUser?.user?.role;
  const userId = storedUser?.user?.id;
  const accessToken = storedUser?.accessToken;

  // API routes configuration
  const API_ROUTES = {
    admin: `${backendBaseUrl}/profile/admin/${userId}`,
    coordinator: `${backendBaseUrl}/profile/coordinator/${userId}`,
    faculty: `${backendBaseUrl}/profile/faculty/${userId}`,
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!storedUser) throw new Error("No user found. Please log in.");

        const response = await axios.get(API_ROUTES[userRole], {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setUserData(response.data);
        setFormData({
          name: response.data.name || response.data.dept_name || '',
          email: response.data.email || ''
        });

        // Set profile image if exists
        if (response.data.profile_image_path) {
          setProfileImage(`${backendBaseUrl}${response.data.profile_image_path}`);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data!");
        showToast('error', "Failed to fetch user data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userRole, userId, accessToken]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSave = async () => {
    setOperationLoading(true);
    try {
      // 1. Update profile data
      const updateEndpoint = `${backendBaseUrl}/api/profile/${userRole === 'admin' ? 'admin' : 'faculty'}/${userId}`;
      const payload = userRole === 'admin' 
        ? { dept_name: formData.name, email: formData.email }
        : { name: formData.name, email: formData.email };

      await axios.put(updateEndpoint, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // 2. Upload image if selected
      if (profileImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('profile_image', profileImageFile);
        uploadFormData.append('user_role', userRole);
        uploadFormData.append('email', formData.email); 

        const uploadResponse = await axios.post(
          `${backendBaseUrl}/api/profile/upload/${userId}`,
          uploadFormData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setProfileImage(`${backendBaseUrl}${uploadResponse.data.imagePath}`);
      }

      // 3. Refresh user data
      const response = await axios.get(API_ROUTES[userRole], {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserData(response.data);
      setEditMode(false);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Failed to save profile changes";
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  // Loading and error states
  if (loading) return <LoaderPage loading={true} />;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-10 p-4" style={{ 
     // position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
     
      overflow: 'hidden' // Prevent scrolling
    }}>
     <LoaderPage loading={operationLoading} />

      <CCard
        className="shadow-lg rounded-4 p-4 border border-primary"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <CCardHeader className="text-center bg-primary text-white rounded-3">
          <CCardTitle className="fw-bold fs-4">👤 Profile Information</CCardTitle>
        </CCardHeader>
        <CCardBody className="text-center">
          <div className="position-relative d-inline-block mb-4">
            <img
              src={profileImage || defaultImage}
              onError={(e) => {
                e.target.src = defaultImage;
              }}
              alt="Profile"
              className="rounded-circle border border-3 border-primary"
              width="140"
              height="140"
              style={{ objectFit: 'cover' }}
            />
            {editMode && (
              <label
                htmlFor="file-upload"
                className="position-absolute bottom-0 end-0 p-2 bg-white rounded-circle shadow"
                style={{ cursor: "pointer" }}
              >
                <FaCamera size={22} className="text-primary" />
              </label>
            )}
            <CFormInput 
              type="file" 
              id="file-upload" 
              className="d-none" 
              onChange={handleImageUpload} 
              disabled={!editMode}
              accept="image/*"
            />
          </div>

          <CRow className="mb-3 text-start">
            <CCol md="4">
              <CFormLabel className="fw-semibold">Name</CFormLabel>
            </CCol>
            <CCol md="8">
              <CFormInput 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange}
                disabled={!editMode} 
              />
            </CCol>
          </CRow>

          <CRow className="mb-3 text-start">
            <CCol md="4">
              <CFormLabel className="fw-semibold">Email</CFormLabel>
            </CCol>
            <CCol md="8">
              <CFormInput 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleInputChange}
                disabled={!editMode} 
              />
            </CCol>
          </CRow>

          <CRow className="mb-3 text-start">
            <CCol md="4">
              <CFormLabel className="fw-semibold">Role</CFormLabel>
            </CCol>
            <CCol md="8">
              <CFormInput
                type="text"
                value={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                disabled
              />
            </CCol>
          </CRow>

          <div className="text-center mt-4">
            {editMode ? (
              <>
                <CButton 
                  color="secondary" 
                  className="me-2" 
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: userData.name || userData.dept_name || '',
                      email: userData.email || ''
                    });
                    setProfileImage(userData.profile_image_path ? 
                      `${backendBaseUrl}${userData.profile_image_path}` : 
                      null);
                  }}
                  disabled={operationLoading}
                >
                  Cancel
                </CButton>
                <CButton 
                  color="primary" 
                  onClick={handleSave}
                  disabled={operationLoading || !formData.name || !formData.email}
                >
                  {operationLoading ? "Saving..." : "Save"}
                </CButton>
              </>
            ) : (
              <CButton color="primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </CButton>
            )}
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Profile;  