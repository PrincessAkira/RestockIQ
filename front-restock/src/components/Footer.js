import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="text-white pt-5 pb-3 mt-5"
      style={{
        background: "linear-gradient(to right, #6a1b9a, #8e24aa)",
      }}
    >
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Brand & Tagline */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">ShelfIQ</h5>
            <p style={{ fontSize: "0.9rem" }}>
              AI-powered smart shelf monitoring & real-time restocking alerts.
            </p>
            <small>
              &copy; {new Date().getFullYear()} ShelfIQ. All rights reserved.
            </small>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-semibold">Quick Links</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/analytics"
                  className="text-white text-decoration-none"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-white text-decoration-none">
                  Alerts
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/dashboard"
                  className="text-white text-decoration-none"
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/cashier/pos"
                  className="text-white text-decoration-none"
                >
                  POS System
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Motto */}
          <div className="col-md-4 mb-4">
            <h6 className="fw-semibold">Smart Retail</h6>
            <p style={{ fontSize: "0.9rem" }}>
              “Inventory intelligence is the backbone of modern commerce.”
            </p>
            <p className="text-white-50" style={{ fontSize: "0.85rem" }}>
              Built with ❤️ for retailers in Zimbabwe and beyond.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
