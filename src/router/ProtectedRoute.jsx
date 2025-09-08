import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ roles }) => {
  const { user, token, logout } = useAuth();

  if (!token || !user) {
    logout();
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    const [email, timestamp] = atob(token).split(":");
    if (timestamp && Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000) {
      logout();
      return <Navigate to="/login" replace />;
    }
  }

  if (roles && !roles.includes(user.role)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
