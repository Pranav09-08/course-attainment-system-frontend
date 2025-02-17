import { useState } from "react";
import emailjs from "emailjs-com";
import React from "react";

const initialState = {
  name: "",
  email: "",
  message: "",
};

export const Contact = ({ data }) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearState = () => setFormData(initialState);

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        e.target,
        "YOUR_PUBLIC_KEY"
      )
      .then(
        (result) => {
          console.log("Message sent:", result.text);
          clearState();
        },
        (error) => {
          console.error("Email error:", error.text);
        }
      );
  };

  return (
    <div id="contact">
      <div className="container">
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
                      placeholder="Name"
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
                      placeholder="Email"
                      required
                      value={formData.email}
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
                  placeholder="Message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-custom btn-lg btn-block">
                Send Message
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
                  <a href={data?.facebook || "/"} target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-facebook"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href={data?.twitter || "/"} target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-twitter"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href={data?.youtube || "/"} target="_blank" rel="noopener noreferrer">
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
              &copy; 2025 PICT TEAM. Design by DBMS Team {" "}
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