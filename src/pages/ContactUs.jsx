import React, { useState } from "react";
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
  CFormTextarea,
  CSpinner,
  CAlert,
} from "@coreui/react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUser, FaPaperPlane } from "react-icons/fa";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full Name is required.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      setError("Phone number must contain only numbers.");
      return false;
    }
    if (!formData.message.trim()) {
      setError("Message is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare the payload for the backend
      const payload = {
        name: formData.fullName, // Map fullName to name
        email: formData.email,
        phone: formData.phone || null, // Send null if phone is empty
        address: formData.address || null, // Send null if address is empty
        message: formData.message,
      };

      // Send data to the backend API
      const response = await fetch("http://localhost:5001/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        });
      } else {
        setError(result.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center p-4" style={{ minHeight: "80vh" }}>
      <CCard
        className="shadow-lg rounded-4 p-4 border border-primary"
        style={{ maxWidth: "800px", width: "100%" }}
      >
        <CCardHeader className="text-center bg-primary text-white rounded-3">
          <CCardTitle className="fw-bold fs-4">📩 Contact Us</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow>
            {/* Left Side - Contact Info */}
            <CCol md="5" className="border-end pe-4 mb-4 mb-md-0 text-start">
              <h5 className="fw-bold mb-4">Get In Touch</h5>
              <p className="mb-3 d-flex align-items-center gap-2">
                <FaEnvelope className="text-primary" /> courseattainment996@gmail.com
              </p>
              <p className="mb-3 d-flex align-items-center gap-2">
                <FaPhoneAlt className="text-primary" /> +91 9309887312
              </p>
              <p className="mb-3 d-flex align-items-center gap-2">
                <FaMapMarkerAlt className="text-primary" /> Pune, Maharashtra, India
              </p>
            </CCol>

            {/* Right Side - Contact Form */}
            <CCol md="7">
              {success && (
                <CAlert color="success" className="mb-4">
                  Your message has been sent successfully!
                </CAlert>
              )}
              {error && (
                <CAlert color="danger" className="mb-4">
                  {error}
                </CAlert>
              )}
              <form onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md="6">
                    <CFormLabel>
                      <FaUser className="me-2" /> Full Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </CCol>
                  <CCol md="6">
                    <CFormLabel>
                      <FaEnvelope className="me-2" /> Email
                    </CFormLabel>
                    <CFormInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md="6">
                    <CFormLabel>
                      <FaPhoneAlt className="me-2" /> Phone
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number (optional)"
                    />
                  </CCol>
                  <CCol md="6">
                    <CFormLabel>
                      <FaMapMarkerAlt className="me-2" /> Address
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address (optional)"
                    />
                  </CCol>
                </CRow>
                <div className="mb-3">
                  <CFormLabel>
                    <FaPaperPlane className="me-2" /> Message
                  </CFormLabel>
                  <CFormTextarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                    required
                  ></CFormTextarea>
                </div>
                <div className="text-end">
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <CSpinner size="sm" /> Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </CButton>
                </div>
              </form>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ContactUs;