// src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import shelfBg from "../assets/shelf-bg.jpg"; // Make sure this image exists

export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        height: "100vh",
        backgroundImage: `url(${shelfBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔲 Background Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        }}
      />

      {/* 🧊 Glass Card */}
      <div
        className="d-flex flex-column align-items-center justify-content-center text-white text-center"
        style={{
          height: "100%",
          zIndex: 2,
          position: "relative",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            padding: "3rem",
            maxWidth: "600px",
            width: "90%",
            color: "#ffffff",
          }}
        >
          <PackageCheck size={64} color="#ffffff" className="mb-4" />
          <h1 className="display-5 fw-bold mb-3">Welcome to ShelfIQ</h1>
          <p className="lead mb-4">
            Smart stock alerts and real-time AI-powered shelf monitoring.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <Link
              to="/login"
              className="btn btn-lg px-4 py-2"
              style={{
                backgroundColor: "#6A1B9A",
                border: "none",
                color: "white",
                borderRadius: "8px",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-outline-light btn-lg px-4 py-2"
              style={{
                borderRadius: "8px",
                borderColor: "#fff",
                color: "#fff",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Register
            </Link>
          </div>

          {/* ✨ Feature Points */}
          <ul
            className="list-unstyled text-start"
            style={{ paddingLeft: "1rem" }}
          >
            <li>✔ Real-time inventory updates</li>
            <li>✔ Smart threshold-based restocking alerts</li>
            <li>✔ Seamless POS integration and logs</li>
          </ul>
        </div>
      </div>

      {/* 🖋️ Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          right: "30px",
          fontSize: "0.9rem",
          color: "#ffffffaa",
          zIndex: 2,
        }}
      >
        📸 Image by Andrii Lysenko (Unsplash)
      </div>
    </div>
  );
}
