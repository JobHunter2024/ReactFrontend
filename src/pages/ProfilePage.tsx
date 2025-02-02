import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Button, Container, Card } from "react-bootstrap";

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
  const [username, setUsername] = useState<string>("Guest");
  const [email, setEmail] = useState<string>("guest@example.com");
  const authToken = localStorage.getItem("authToken");

  // Check if the token exists and decode it
  useEffect(() => {
    if (!authToken) {
      // Redirect to the home page with an alert
      alert("You must be logged in to access that feature");
      navigate("/");
      return;
    }

    try {
      // Decode the JWT token and extract user data
      const decodedToken = jwtDecode<JwtPayload>(authToken);
      setUserId(decodedToken.id);
      setUsername(decodedToken.username);
      setEmail(decodedToken.email);
    } catch (error) {
      console.error("Failed to decode token", error);
      navigate("/");
    }
  }, [authToken, navigate]);

  const handleLogout = (): void => {
    // Remove authToken and user data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    // Redirect to home page
    navigate("/");
  };

  if (!authToken) {
    return null; // Prevent rendering if not logged in
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <Card
        className="shadow-lg p-4 rounded-lg"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Card.Body className="text-center">
          <h1 className="fw-semibold">Profile</h1>
          <hr className="mb-4" />
          <div className="text-start">
            <h5 className="text-muted">Username</h5>
            <p className="fs-5  fw-semibold">{username}</p>
          </div>
          <div className="text-start mt-3">
            <h5 className="text-muted">Email</h5>
            <p className="fs-5  fw-semibold">{email}</p>
          </div>
          <Button
            variant="danger"
            className="mt-4 w-100 fw-semibold py-2"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Card.Body>
      </Card>

      <Card
        className="shadow-lg p-4 rounded-lg mt-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Card.Body>
          <h2 className="fw-semibold  text-center">Preferences</h2>
          <hr className="mb-3" />
          <div className="text-start">
            <h5 className="text-muted">Notifications</h5>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;
