import React, { useEffect, useState } from "react";
import axios from "axios";

// Utility to sort priorities (Critical > High > Moderate)
const sortByPriority = (a, b) => {
  const priorityOrder = { Critical: 3, High: 2, Moderate: 1 };
  return priorityOrder[b.priority] - priorityOrder[a.priority];
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get(
        `${
          process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
        }/api/alerts/`
      )
      .then((res) => {
        const sorted = res.data.sort(sortByPriority);
        setAlerts(sorted);
        setFilteredAlerts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching alerts:", err);
        setError("Failed to load alerts.");
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = alerts.filter((item) =>
      item.product.toLowerCase().includes(term)
    );
    setFilteredAlerts(filtered.sort(sortByPriority));
  };

  if (loading) return <p className="text-center">🔄 Loading alerts...</p>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">🔔 Stock Alerts</h2>
      <p className="text-muted mb-4">
        Smart inventory notifications for low-stock and critical items.
      </p>

      {/* 🔍 Search Filter */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search product name..."
          value={searchTerm}
          onChange={handleSearch}
          aria-label="Search product"
        />
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="alert alert-success text-center">
          ✅ All stock levels are within healthy range.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Priority</th>
                <th>Daily Sales (avg)</th>
                <th>Est. Depletion (days)</th>
                <th>Suggested Reorder Qty</th>
                <th>Last Restocked</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((item, index) => (
                <tr key={index}>
                  <td>{item.product}</td>
                  <td>{item.stock}</td>
                  <td>{item.threshold}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.priority === "Critical"
                          ? "bg-danger"
                          : item.priority === "High"
                          ? "bg-warning text-dark"
                          : "bg-info text-dark"
                      }`}
                      title={`Priority: ${item.priority}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td>{item.avg_daily_sales.toFixed(2)}</td>
                  <td>{item.est_depletion_days.toFixed(1)}</td>
                  <td>{item.suggested_reorder_qty}</td>
                  <td>{item.last_restocked || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
