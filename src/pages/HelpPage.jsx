import React, { useState, useEffect } from "react";
import Accordion from 'react-bootstrap/Accordion';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap'; // Additional imports for layout and styling
import helpData from "../assets/help.json"; // Assuming your JSON contains FAQ data per role

const HelpPage = () => {
  const [role, setRole] = useState(null);
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user?.role) {
      setRole(storedUser.user.role);
      setFaq(helpData[storedUser.user.role] || []);
      setLoading(false); // Once the role and data are loaded, stop loading
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!role) {
    return (
      <Container className="text-center mt-5">
        <h2>Unable to load help content. Please log in first.</h2>
        <Button variant="link" href="/login" className="mt-3">Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          {/* Card for Help Page */}
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h3>Help & FAQs for {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
              </Card.Title>

              {/* Accordion for FAQs */}
              <Accordion defaultActiveKey="0">
                {faq.length > 0 ? (
                  faq.map((item, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index}>
                      <Accordion.Header>{item.question}</Accordion.Header>
                      <Accordion.Body>
                        <p>{item.answer}</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))
                ) : (
                  <p className="text-center">No FAQs available for your role yet.</p>
                )}
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HelpPage;
