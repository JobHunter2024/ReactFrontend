import { useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useLocation } from "react-router-dom";

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};

export const handleTokenExpiration = (showToast: (message: string, variant: "danger" | "success") => void) => {
  const token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    showToast("Your token has expired, please authenticate again", "danger");
    window.location.href = "/login";
  }
};

export const autoLogoutBeforeExpiry = (showToast: (message: string, variant: "danger" | "success") => void) => {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    const timeLeft = exp - Date.now();

    if (timeLeft <= 0) {
      localStorage.removeItem("authToken");
      showToast("Your token has expired, please authenticate again", "danger");
      window.location.href = "/login";
    } else {
      setTimeout(() => {
        localStorage.removeItem("token");
        showToast("Your token has expired, please authenticate again", "danger");
        window.location.href = "/login";
      }, timeLeft - 5000);
    }
  } catch (error) {
    console.error("Invalid token:", error);
  }
};

const JwtUtils = () => {
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    handleTokenExpiration(showToast);
    autoLogoutBeforeExpiry(showToast);
  }, [location.pathname]);

  return null; // No UI rendering needed
};

export default JwtUtils;
