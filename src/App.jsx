import React from "react";
import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminDashboard from "./components/admin/AdminDashboard";
import PatientDashboard from "./components/patient/PatientDashboard";
import PatientList from "./components/admin/PatientManagement";
import RecommendationForm from "./components/admin/RecommendationForm";
import ProtectedRoute from "./router/ProtectedRoute"; // ✅ Import

const App = () => {
  return (
    <Routes>
      {/* Redirect root (/) to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<PatientList />} />
        <Route path="/admin/recommendations" element={<RecommendationForm />} />
      </Route>

      {/* Patient protected routes */}
      <Route element={<ProtectedRoute roles={["patient"]} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
