// src/router/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ roles }) => {
  const { user, token, logout } = useAuth();

  // No token or no user -> not logged in
  if (!token || !user) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // Token expiry check (works for real JWTs)
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    // Invalid token format (e.g., fake token from JSON Server)
    // For our fake token, we can set a time limit of 1 hour
    const [email, timestamp] = atob(token).split(":");
    if (timestamp && Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000) {
      logout();
      return <Navigate to="/login" replace />;
    }
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
