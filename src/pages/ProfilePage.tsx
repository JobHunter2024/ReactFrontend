import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Button, Container, Row, Col } from 'react-bootstrap';

// Interface for decoding JWT payload (based on your JWT structure)
interface JwtPayload {
  id: string;
  username: string;
  email: string;
  exp: number; // expiration timestamp
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('Guest');
  const [email, setEmail] = useState<string>('guest@example.com');
  const authToken = localStorage.getItem('authToken');

  // Check if the token exists and decode it
  useEffect(() => {
    if (!authToken) {
      // Redirect to the home page with an alert
      alert('You must be logged in to access that feature');
      navigate('/');
      return;
    }

    try {
      // Decode the JWT token and extract user data
      const decodedToken = jwtDecode<JwtPayload>(authToken);
      setUserId(decodedToken.id);
      setUsername(decodedToken.username);
      setEmail(decodedToken.email);
    } catch (error) {
      console.error('Failed to decode token', error);
      navigate('/');
    }
  }, [authToken, navigate]);

  const handleLogout = (): void => {
    // Remove authToken and user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');

    // Redirect to home page
    navigate('/');
  };

  if (!authToken) {
    return null; // Prevent rendering if not logged in
  }

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <h1 className="text-center">Profile</h1>
          <hr></hr>
          <div className="profile-details">
            <div>
                <h3>Username</h3>
                <p><em>{username}</em></p>
            </div>
            
            <div>
                <h3>Email</h3>
                <p><em>{email}</em></p>
            </div>
          </div>
          <div className="text-center mt-4">
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <h1 className="text-center">Preferences</h1>
          <hr></hr>
          <div className="preferences">
            <div>
                <h3>Notifications</h3>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
