// src/components/Navbar.js

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Only hide navbar on landing, login or register pages
  const hideNavbar = ["/", "/login", "/register"].includes(location.pathname);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role && parsed?.name) {
          setUser(parsed);
        } else {
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (e) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (hideNavbar || !user) return null;

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #eee",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        fontFamily: "'Poppins', sans-serif",
        zIndex: 1000,
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand fw-bold"
          to="/dashboard"
          style={{ color: "#6A1B9A" }}
        >
          <i className="bi bi-box-seam me-2"></i> ShelfIQ
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Admin Dropdown */}
            {user.role === "admin" && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link fw-semibold text-dark"
                  id="adminDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin
                </button>
                <ul
                  className="dropdown-menu animate__animated animate__fadeIn"
                  aria-labelledby="adminDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/admin/dashboard">
                      📊 Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/products">
                      🛒 Product Registration
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/stock">
                      📦 Stock Management
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/restock-recommendations"
                    >
                      📝 Restock Suggestions
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/audit-logs">
                      🗒️ Audit Logs
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Cashier Dropdown */}
            {user.role === "cashier" && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link fw-semibold text-dark"
                  id="cashierDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Cashier
                </button>
                <ul
                  className="dropdown-menu animate__animated animate__fadeIn"
                  aria-labelledby="cashierDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/cashier/dashboard">
                      🖥️ Cashier Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/cashier/pos">
                      💵 POS System
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/cashier/sales">
                      📃 Recent Sales
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Shared Pages */}
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/smartshelf">
                🧠 Smart Shelf
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/alerts">
                🔔 Alerts
              </Link>
            </li>

            {/* Profile Dropdown */}
            <li className="nav-item dropdown ms-3">
              <button
                className="nav-link dropdown-toggle btn btn-link fw-semibold text-dark"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                👤 {user.name}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end animate__animated animate__fadeIn"
                aria-labelledby="userDropdown"
              >
                <li>
                  <span className="dropdown-item-text text-muted">
                    Role: <strong>{user.role}</strong>
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
