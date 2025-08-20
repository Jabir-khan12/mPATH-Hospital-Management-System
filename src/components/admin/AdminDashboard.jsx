// src/components/admin/AdminDashboard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
        <div className="flex gap-2 items-center">
          <span className="text-gray-700">Welcome, {user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/admin/patients")}
          className="bg-blue-500 text-white px-4 py-3 rounded shadow hover:bg-blue-600"
        >
          Manage Patients
        </button>

        <button
          onClick={() => navigate("/admin/recommendations")}
          className="bg-green-500 text-white px-4 py-3 rounded shadow hover:bg-green-600"
        >
          Manage Recommendations
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
