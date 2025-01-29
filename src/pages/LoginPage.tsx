// src/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import AuthService from '../service/AuthService';
import { useToast } from '../context/ToastContext'; // Import the useToast hook

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast(); // Get the showToast function from the context

  const authService = new AuthService('http://localhost:8889/api/v1/auth');

  // Redirect if the user is already logged in (authToken exists)
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/'); // Redirect to the base website path
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const token = await authService.login({ username, password });
      console.log('Token received:', token);

      // Save the token to localStorage
      localStorage.setItem('authToken', token);

      // Show success toast
      showToast('Login successful!', 'success');

      // Redirect to the base website path
      navigate('/');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');

      // Show error toast
      showToast(error.response?.data?.message || 'Login failed. Please try again.', 'danger');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center">Login</h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
          <a className="centered-anchor" href="/register">
            Don't have an account? Register here
          </a>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
