import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem("tokenExpiry");
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        logout();
      }
    };
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?email=${email}&password=${password}`);
      if (res.data.length > 0) {
        const loggedUser = res.data[0];
        const fakeToken = btoa(`${loggedUser.email}:${Date.now()}`);
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiryTime);
        setUser(loggedUser);
        setToken(fakeToken);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        localStorage.setItem("token", fakeToken);
        if (loggedUser.role === "admin") navigate("/admin/dashboard");
        else if (loggedUser.role === "patient") navigate("/patient/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Ooops! Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
