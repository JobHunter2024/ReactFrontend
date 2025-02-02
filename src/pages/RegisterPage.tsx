import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthService from "../service/AuthService";
import { useToast } from "../context/ToastContext"; // Import useToast hook
import "../assets/styles/AuthStyles.css";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const authService = new AuthService("http://localhost:8889/api/v1/auth");
  const { showToast } = useToast(); // Get the showToast function from the context

  // Check if the user is already logged in (authToken exists)
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      // Redirect to the base path if the user is already logged in
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      // Call the register method from AuthService
      await authService.register({ email, username, password });

      // Show success toast
      showToast("Registration successful!", "success");

      // Redirect the user to the login page after successful registration
      navigate("/login");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

      // Show error toast
      showToast(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
        "danger"
      );
    }
  };

  return (
    <Container className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
      <Row className="justify-content-center">
        <Col md={6} className="bg-white p-8 rounded-lg">
          <h2 className="text-gray-800 font-bold text-xl mb-4 text-center">
            Introduce your details
          </h2>
          {/* {errorMessage && (
          //  <div className="alert alert-danger">{errorMessage}</div>
          )} */}
          <Form
            onSubmit={handleSubmit}
            className="space-y-4 justify-center items-center"
          >
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label className="fw-semibold text-left w-full block">
                Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                className="border rounded-lg p-2 focus:ring focus:ring-indigo-300 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label className="fw-semibold text-left w-full block">
                Username
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                className="border rounded-lg p-2 focus:ring focus:ring-indigo-300 w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label className="fw-semibold text-left w-full block">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                className="border rounded-lg p-2 focus:ring focus:ring-indigo-300 w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label className="fw-semibold text-left w-full block">
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                className="border rounded-lg p-2 focus:ring focus:ring-indigo-300 w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 bg-indigo-500 hover:bg-indigo-600 font-bold py-2 rounded-lg"
            >
              Register
            </Button>
          </Form>

          <p className="text-center text-gray-600 mt-4 fw-semibold">
            Have an account?{" "}
            <a
              href="/login"
              className="text-indigo-500 font-semibold hover:text-indigo-600"
            >
              Login here
            </a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
