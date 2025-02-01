import React from "react";
import "./styles/HomePage.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <img src="https://via.placeholder.com/150x50?text=Department+Logo" alt="Logo" />
        </div>
        <nav className="nav">
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#help">Help</a>
          <a href="#contact">Contact Us</a>
          <button className="login-btn">Login</button>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Welcome to Course Attainment Portal</h1>
          <p>Track your academic progress and course attainment effortlessly</p>
          <a href="#about" className="cta-button">Learn More</a>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <div className="about-content">
          <img src="https://via.placeholder.com/500x300" alt="About Us" />
          <p>
            Our department offers a comprehensive platform to track course attainment, providing students and faculty with insightful analytics to monitor academic progress and target achievement.
          </p>
        </div>
      </section>

      <section id="services" className="services">
        <h2>Our Services</h2>
        <div className="services-list">
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Course Tracking" />
            <h3>Course Tracking</h3>
            <p>Monitor your course attainment based on predefined criteria and academic goals.</p>
          </div>
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Analytics" />
            <h3>Performance Analytics</h3>
            <p>Get detailed insights and analysis of your academic performance over time.</p>
          </div>
          <div className="service-item">
            <img src="https://via.placeholder.com/400x250" alt="Student Support" />
            <h3>Student Support</h3>
            <p>Receive guidance on improving your academic performance and attaining your targets.</p>
          </div>
        </div>
      </section>

      <section id="help" className="help">
        <h2>Help & Support</h2>
        <p>If you need assistance, our support team is here to help you.</p>
        <a href="#contact" className="cta-button">Get Help</a>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Have questions? Get in touch with us and we will be happy to assist you!</p>
        <a href="mailto:contact@department.com" className="cta-button">Email Us</a>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Department of [Your Department]. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;