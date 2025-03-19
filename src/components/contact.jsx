import { useState } from "react";
import React from "react";
import { FaSpinner } from "react-icons/fa";

const initialState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  message: "",
};

export const Contact = ({ data }) => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // toast state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearState = () => setFormData(initialState);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://teacher-attainment-system-backend.onrender.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Message sent:", result.message);
        showToast("Message sent successfully!");
        clearState();
      } else {
        console.error("Email error:", result.error);
        showToast("Failed to send message. Please try again.", "error");
      }
    } catch (error) {
      console.error("Request error:", error);
      showToast("Something went wrong. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="contact">
      <div className="container">
        {toast && (
          <div
            className={`alert ${
              toast.type === "error" ? "alert-danger" : "alert-success"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="row justify-content-center">
          {/* Contact Form */}
          <div className="col-md-8">
            <div className="section-title text-center">
              <h2>Get In Touch</h2>
              <p>
                Please fill out the form below to send us an email, and we will
                get back to you as soon as possible.
              </p>
            </div>
            <form name="sentMessage" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      placeholder="Name *"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="Email *"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="form-control"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group mt-2">
                <textarea
                  name="message"
                  id="message"
                  className="form-control"
                  rows="4"
                  placeholder="Message *"
                  required
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-custom btn-lg btn-block"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="spinner" /> Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="col-md-4">
            <div className="contact-info">
              <h3>Contact Info</h3>
              <p>
                <span>
                  <i className="fa fa-map-marker"></i> Address:
                </span>{" "}
                {data?.address || "loading..."}
              </p>
              <p>
                <span>
                  <i className="fa fa-phone"></i> Phone:
                </span>{" "}
                {data?.phone || "loading..."}
              </p>
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> Email:
                </span>{" "}
                {data?.email || "loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="row">
          <div className="col-md-12 text-center">
            <div className="social">
              <ul className="list-inline">
                <li className="list-inline-item">
                  <a
                    href={data?.facebook || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa fa-facebook"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a
                    href={data?.twitter || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa fa-twitter"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a
                    href={data?.youtube || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa fa-youtube"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div id="footer">
          <div className="container text-center">
            <p>
              &copy; 2025 PICT TEAM. Design by DBMS Team{" "}
              <a href="https://pict.edu" rel="nofollow" target="_blank">
                PICT
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
