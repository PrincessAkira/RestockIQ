// pages/cashier/CashierDashboard.js
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function CashierDashboard() {
  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="row mb-4">
        <div className="col text-center">
          <h2 className="fw-bold text-dark">👨‍💼 Welcome, Cashier</h2>
          <p className="text-muted">
            Access your tools quickly and efficiently.
          </p>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-md-4">
          <Link to="/cashier/pos" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 hover-effect">
              <div className="card-body text-center">
                <i className="bi bi-cash-coin display-4 text-primary"></i>
                <h5 className="card-title mt-3">Start New Sale</h5>
                <p className="text-muted">
                  Quickly launch the POS system to process transactions.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/cashier/sales" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 hover-effect">
              <div className="card-body text-center">
                <i className="bi bi-receipt-cutoff display-4 text-success"></i>
                <h5 className="card-title mt-3">Recent Sales</h5>
                <p className="text-muted">
                  Review and manage your recent sale history.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/alerts" className="text-decoration-none">
            <div className="card shadow-sm border-0 h-100 hover-effect">
              <div className="card-body text-center">
                <i className="bi bi-bell display-4 text-warning"></i>
                <h5 className="card-title mt-3">System Alerts</h5>
                <p className="text-muted">
                  Stay updated with real-time system alerts and notifications.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
