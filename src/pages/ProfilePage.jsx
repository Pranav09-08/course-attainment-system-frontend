import React, { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "../components/LoaderPage";

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
import { FaCamera } from "react-icons/fa"; // Import camera icon

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userRole = storedUser?.user?.role;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!storedUser) throw new Error("No user found. Please log in.");
        const { accessToken, user } = storedUser;
        const { id: user_id } = user;

        const API_ROUTES = {
          admin: `https://teacher-attainment-system-backend.onrender.com/profile/admin/${user_id}`,
          coordinator: `https://teacher-attainment-system-backend.onrender.com/profile/coordinator/${user_id}`,
          faculty: `https://teacher-attainment-system-backend.onrender.com/profile/faculty/${user_id}`,
        };

        const response = await axios.get(API_ROUTES[userRole], {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setUserData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="text-center mt-5"><LoaderPage/></div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-4">
      <CCard
        className="shadow-lg rounded-4 p-4 border border-primary"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <CCardHeader className="text-center bg-primary text-white rounded-3">
          <CCardTitle className="fw-bold fs-4">👤 Profile Information</CCardTitle>
        </CCardHeader>
        <CCardBody className="text-center">
          {/* Profile Image with Upload Icon */}
          <div className="position-relative d-inline-block mb-4">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="rounded-circle border border-3 border-primary"
              width="140"
              height="140"
            />
            <label
              htmlFor="file-upload"
              className="position-absolute bottom-0 end-0 p-2 bg-white rounded-circle shadow"
              style={{ cursor: "pointer" }}
            >
              <FaCamera size={22} className="text-primary" />
            </label>
            <CFormInput type="file" id="file-upload" className="d-none" onChange={handleImageUpload} />
          </div>

          {/* User Information */}
          <CRow className="mb-3 text-start">
            <CCol md="4">
              <CFormLabel className="fw-semibold">Name</CFormLabel>
            </CCol>
            <CCol md="8">
              <CFormInput type="text" value={userData?.name || "N/A"} disabled={!editMode} />
            </CCol>
          </CRow>

          <CRow className="mb-3 text-start">
            <CCol md="4">
              <CFormLabel className="fw-semibold">Email</CFormLabel>
            </CCol>
            <CCol md="8">
              <CFormInput type="email" value={userData?.email || "N/A"} disabled={!editMode} />
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

          {/* Edit / Save Buttons */}
          <div className="text-center mt-4">
            {editMode ? (
              <>
                <CButton color="secondary" className="me-2" onClick={() => setEditMode(false)}>
                  Cancel
                </CButton>
                <CButton color="primary" onClick={() => setEditMode(false)}>
                  Save
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