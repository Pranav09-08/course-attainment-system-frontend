// src/HomePage.jsx
import React from "react";
import "../styles/HomePage.css";
import logo from '../assets/logo.png';
import { useNavigate } from "react-router-dom"; // 

const HomePage = () => {

    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleLoginClick = () => {
      navigate("/login"); // Navigate to the login page
    };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <button onClick={handleLoginClick}>Login</button>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Welcome to MyWebsite</h1>
          <p>Transforming ideas into digital solutions</p>
          <a href="#services" className="cta-button">Explore More</a>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <div className="about-content">
          <img src="https://via.placeholder.com/500x300" alt="About Us" />
          <p>
            We are a passionate team, delivering beautiful and functional websites, mobile apps, and branding solutions that help businesses grow and thrive in the digital world.
          </p>
        </div>
      </section>

      <section id="services" className="services">
        <h2>Our Services</h2>
        <div className="services-list">
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Web Development" />
            <h3>Web Development</h3>
            <p>Responsive and engaging websites that create lasting impressions.</p>
          </div>
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Mobile Apps" />
            <h3>Mobile Apps</h3>
            <p>Intuitive, high-performance mobile applications for your business.</p>
          </div>
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Branding" />
            <h3>Branding</h3>
            <p>Creating unique identities and logos that tell your brand’s story.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Let's bring your ideas to life. Get in touch with us today!</p>
        <a href="mailto:info@mywebsite.com" className="cta-button">Email Us</a>
      </section>

      <footer className="footer">
        <p>&copy; 2025 MyWebsite. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;