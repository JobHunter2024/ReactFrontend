import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { NavDropdown } from 'react-bootstrap';
import '../components/StaticNavbar.css';


const StaticNavbar: React.FC = () => {
  const [isNavbarExpanded, setNavbarExpanded] = useState(false); // State for tracking navbar collapse
  const navigate = useNavigate();

  // Check for authToken in localStorage
  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleLinkClick = () => {
    // Close the navbar after clicking a link
    setNavbarExpanded(false);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      expanded={isNavbarExpanded} // Control the expanded state
      style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
    >
      <Container>
        <Navbar.Brand>Job Hunter 2025</Navbar.Brand>

        {/* Toggle Button for Mobile View */}
        <Navbar.Toggle
          aria-controls="navbar-nav"
          onClick={() => setNavbarExpanded(!isNavbarExpanded)} // Toggle navbar on button click
        />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Button
              variant="outline-light"
              className="me-2"
              onClick={() => {
                navigate('/');
                handleLinkClick(); // Collapse the navbar on link click
              }}
            >
              Home
            </Button>
            <Button
              variant="outline-light"
              className="me-2"
              onClick={() => {
                navigate('/search');
                handleLinkClick(); // Collapse the navbar on link click
              }}
            >
              Search
            </Button>
            <Button
              variant="outline-light"
              className="me-2"
            onClick={() => {
                navigate('/suggestions');
                handleLinkClick(); // Collapse the navbar on link click
              }}
            >
              Suggestions
            </Button>

            <Button
            variant="outline-light"
            className = "me-2"
            onClick={() => {
              navigate('/searchevent');
              handleLinkClick();}}
          >
            Search Event
          </Button>

          <Button
            variant = "outline-light"
            onClick={() => {
              navigate('/eventstatistics');
              handleLinkClick();}}
          >
            Events Statistics
          </Button>

            {/* Profile or Login Button */}
            {isLoggedIn ? (
              <Button
                variant="outline-light"
                onClick={() => {
                  navigate('/profile');
                  handleLinkClick(); // Collapse the navbar on link click
                }}
              >
                Profile
              </Button>
            ) : (
              <Button
                variant="outline-light"
                onClick={() => {
                  navigate('/login');
                  handleLinkClick(); // Collapse the navbar on link click
                }}
              >
                Login
              </Button>
            )}
  
          
        </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default StaticNavbar;
