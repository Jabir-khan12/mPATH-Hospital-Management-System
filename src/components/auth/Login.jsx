import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (!user) {
        setError("Invalid email or password.");
        return;
      }
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "patient") {
        navigate("/patient/dashboard");
      } else {
        setError("Unauthorized role. Please contact support.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-1/2 p-8 rounded shadow-md max-w-md">
        <h2 className="h-[30px] flex items-center justify-center">
          <img
            className="h-10"
            src="/assets/images/mPATH_logo.png"
            alt="mPATH Logo"
          />
        </h2>
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Patient?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
      <div className="w-1/2 p-8">
        <img src="/assets/images/frontpage-right.png" alt="Login Visual" />
      </div>
    </div>
  );
};

export default Login;
