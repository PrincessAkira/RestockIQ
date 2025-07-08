// src/pages/Login.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      const { token, user } = res.data;

      // Save token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Logged in as ${user.role}`);

      // Redirect user based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "cashier") {
        navigate("/cashier/dashboard");
      } else {
        toast.error("Unknown role. Cannot redirect.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "1rem" }}
      >
        <h3 className="text-center mb-4" style={{ color: "#6a1b9a" }}>
          🔐 Login to ShelfIQ
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="input-group-text bg-white"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">
            Login
          </button>
        </form>
        <div className="mt-3 text-center">
          <p className="mb-1">
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
          <Link to="/" className="btn btn-sm btn-outline-secondary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
