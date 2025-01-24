import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const StaticNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
    >
      <Container>
        <Navbar.Brand>Job Hunter 2025</Navbar.Brand>
        <Nav className="ms-auto">
          <Button
            variant="outline-light"
            className="me-2"
            onClick={() => navigate('/home')}
          >
            Home
          </Button>
          <Button
            variant="outline-light"
            className="me-2"
            onClick={() => navigate('/search')}
          >
            Search
          </Button>
          <Button
            variant="outline-light"
            onClick={() => navigate('/suggestions')}
          >
            Suggestions
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default StaticNavbar;
