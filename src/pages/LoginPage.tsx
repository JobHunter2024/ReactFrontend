// src/pages/LoginPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import AuthService from "../service/AuthService";
import { useToast } from "../context/ToastContext"; // Import the useToast hook

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast(); // Get the showToast function from the context

  const authService = new AuthService("http://localhost:8889/api/v1/auth");

  // Redirect if the user is already logged in (authToken exists)
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/"); // Redirect to the base website path
    }
  }, [navigate]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const token = await authService.login({ username, password });
      console.log("Token received:", token);

      // Save the token to localStorage
      localStorage.setItem("authToken", token);

      // Show success toast
      showToast("Login successful!", "success");

      // Redirect to the base website path
      navigate("/");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );

      // Show error toast
      showToast(
        error.response?.data?.message || "Login failed. Please try again.",
        "danger"
      );
    }
  };

  return (
    <Container className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <Row className="justify-content-center">
        <Col
          md={6}
          className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-gray-900 font-extrabold text-2xl mb-6 text-center">
            Login
          </h2>
          {/* {errorMessage && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center mb-4">
              {errorMessage}
            </div>
          )} */}
          <Form
            onSubmit={handleSubmit}
            className="space-y-4 justify-center items-center"
          >
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label className="fw-semibold text-gray-700 block">
                Username
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                className="w-full border-2 border-gray-300 rounded-xl p-2 mt-1 bg-transparent focus:ring focus:ring-indigo-400 focus:border-indigo-500 transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label className="fw-semibold text-gray-700 block">
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                className="w-full border-2 border-gray-300 rounded-xl p-2 mt-1 bg-transparent focus:ring focus:ring-indigo-400 focus:border-indigo-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 bg-indigo-500 hover:bg-indigo-600 font-bold py-2 rounded-lg"
            >
              Login
            </Button>
          </Form>

          <p className="text-center text-gray-600 mt-4 fw-semibold">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-indigo-500 font-semibold hover:text-indigo-600"
            >
              Register here
            </a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
