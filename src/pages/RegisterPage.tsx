import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService';
import { useToast } from '../context/ToastContext'; // Import useToast hook
import '../assets/styles/AuthStyles.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const authService = new AuthService('http://localhost:8889/api/v1/auth');
  const { showToast } = useToast(); // Get the showToast function from the context

  // Check if the user is already logged in (authToken exists)
  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      // Redirect to the base path if the user is already logged in
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      // Call the register method from AuthService
      await authService.register({ email, username, password });

      // Show success toast
      showToast('Registration successful!', 'success');

      // Redirect the user to the login page after successful registration
      navigate('/login');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');

      // Show error toast
      showToast(error.response?.data?.message || 'Registration failed. Please try again.', 'danger');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center">Register</h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <Form onSubmit={handleSubmit}>
            {/* Email Field */}
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Username Field */}
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

            {/* Password Field */}
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

            {/* Confirm Password Field */}
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100 mt-3">
              Register
            </Button>
          </Form>
          <a className='centered-anchor' href='/login'>Have an account? Login here</a>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
