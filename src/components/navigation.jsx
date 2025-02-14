import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to manage toggle

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav id="menu" className="navbar navbar-expand-lg navbar-dark bg-light fixed-top">
      <div className="container">
        {/* Navbar Brand */}
        <a className="navbar-brand page-scroll" href="#page-top">
          Course Attainment System
        </a>

        {/* Navbar Toggler Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a href="#features" className="nav-link text-black page-scroll">
                Features
              </a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link text-black page-scroll">
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="#contact" className="nav-link text-black page-scroll">
                Contact
              </a>
            </li>
            <li className="nav-item">
              <button onClick={handleLoginClick} className="btn btn-outline-dark ms-3">
                Login
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
