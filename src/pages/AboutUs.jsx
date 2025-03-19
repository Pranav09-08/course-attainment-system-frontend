import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

import Dipali from '../assets/Dipali.jpg';
import Pranav from '../assets/Pranav.jpg';
import Jagruti from '../assets/Jagruti.jpg';

const AboutUs = () => {
  // Inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '"Poppins", sans-serif',
      backgroundColor: '#1D222B', // Dark background
      color: '#f4f4f4', // Light text
      lineHeight: '1.8',
    },
    heading: {
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '2.8rem',
      fontWeight: '700',
      marginBottom: '40px',
      background: 'linear-gradient(90deg, #3498db, #8e44ad)', // Gradient background
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subHeading: {
      color: '#ffffff',
      fontSize: '2rem',
      fontWeight: '600',
      marginBottom: '20px',
      textAlign: 'center',
    },
    projectInfo: {
      backgroundColor: '#2c3e50',
      borderRadius: '12px',
      border: '2px solid #505AC9', // Border added
      padding: '30px',
      margin: '40px 0',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    projectInfoHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(52, 152, 219, 0.6)',
    },
    team: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '30px',
    },
    teamMember: {
      backgroundColor: '#2c3e50',
      borderRadius: '12px',
      border: '2px solid #505AC9', // Border added
      padding: '25px',
      width: '280px',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    teamMemberHover: {
      transform: 'translateY(-10px)',
      boxShadow: '0 8px 24px rgba(52, 152, 219, 0.6)',
    },
    teamMemberImage: {
      borderRadius: '30%',
      width: '120px',
      height: '120px',
      marginBottom: '20px',
      border: '4px solid #3498db',
    },
    teamMemberName: {
      margin: '10px 0',
      color: '#ffffff',
      fontSize: '1.6rem',
      fontWeight: '700',
    },
    teamMemberRole: {
      color: '#3498db',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '10px',
    },
    teamMemberBio: {
      fontSize: '0.95rem',
      color: '#f4f4f4',
      marginBottom: '20px',
    },
    socialLinks: {
      marginTop: '15px',
    },
    socialLink: {
      color: '#ffffff',
      margin: '0 12px',
      fontSize: '28px',
      transition: 'color 0.3s ease, transform 0.3s ease',
    },
    socialLinkHover: {
      color: '#3498db',
      transform: 'scale(1.2)',
    },
  };

  // Team member data
  const teamMembers = [
    {
      name: 'Dipali Deore',
      role: 'Frontend Developer | UI/UX Designer',
      bio: 'Responsible for designing and developing the user interface, ensuring a seamless and responsive user experience while integrating the frontend with backend APIs.',
      email: 'deepalideore2005@gmail.com',
      linkedin: 'https://www.linkedin.com/in/dipali-deore-72a34230b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: 'https://github.com/DipaliDeore',
      image: Dipali,
    },
    {
      name: 'Pranav Mahale',
      role: 'Backend Developer | Database Specialist',
      bio: 'Handles server-side logic, database management, and API development, ensuring secure data communication and system efficiency.',
      email: 'pranavmahale08@gmail.com',
      linkedin: 'https://www.linkedin.com/in/pranav-mahale-b122aa258/',
      github: 'https://github.com/Pranav09-08',
      image: Pranav,
    },
    {
      name: 'Jagruti Kaulkar',
      role: 'Full Stack Developer | Project Manager',
      bio: 'Oversees the overall progress, coordinates the team, manages deployments, and ensures proper documentation and smooth execution of the project.',
      email: 'jagrutikaulkar0@gmail.com',
      linkedin: 'https://www.linkedin.com/in/jagruti-kaulkar-41b167346/',
      github: 'https://github.com/jagrutikaulkar',
      image: Jagruti,
    },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>About Us</h1>

      {/* Project Overview */}
      <div
        style={styles.projectInfo}
        onMouseEnter={(e) => (e.currentTarget.style.transform = styles.projectInfoHover.transform)}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        <p>
        Welcome to the Course Attainment System, a project developed to enhance the tracking and evaluation of student learning outcomes. Our team has worked diligently to build a robust, efficient, and user-friendly platform that streamlines course performance assessment for educators and institutions.we have built a system that enables faculty members to track course outcomes effectively, analyze student performance, and generate insightful reports.
        </p>
      </div>

      {/* Team Members */}
      <h2 style={styles.subHeading}>Meet Our Team</h2>
      <div style={styles.team}>
        {teamMembers.map((member, index) => (
          <div
            style={styles.teamMember}
            key={index}
            onMouseEnter={(e) => (e.currentTarget.style.transform = styles.teamMemberHover.transform)}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <img src={member.image} alt={member.name} style={styles.teamMemberImage} />
            <h3 style={styles.teamMemberName}>{member.name}</h3>
            <p style={styles.teamMemberRole}>{member.role}</p>
            <p style={styles.teamMemberBio}>{member.bio}</p>
            <div style={styles.socialLinks}>
              <a
                href={`mailto:${member.email}`}
                style={styles.socialLink}
                onMouseEnter={(e) => (e.currentTarget.style.color = styles.socialLinkHover.color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = styles.socialLink.color)}
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
                onMouseEnter={(e) => (e.currentTarget.style.color = styles.socialLinkHover.color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = styles.socialLink.color)}
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
                onMouseEnter={(e) => (e.currentTarget.style.color = styles.socialLinkHover.color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = styles.socialLink.color)}
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;