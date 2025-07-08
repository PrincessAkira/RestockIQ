import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [stockData, setStockData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState("all");

  const BASE_URL = "http://localhost:5000";

  const roleDisplay = {
    admin: "System Administrator",
    cashier: "Cashier",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await axios.get(
          `${BASE_URL}/api/analytics/trends`
        );
        setStockData(analyticsRes.data.stock || []);
        setTopProducts(analyticsRes.data.topProducts || []);

        const alertsRes = await axios.get(`${BASE_URL}/api/alerts`);
        setAlerts(alertsRes.data || []);

        const logsRes = await axios.get(`${BASE_URL}/api/audit-logs`);
        setAuditLogs(logsRes.data || []);
        setFilteredLogs(logsRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (filterDays === "all") {
      setFilteredLogs(auditLogs);
    } else {
      const days = parseInt(filterDays);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = auditLogs.filter(
        (log) => new Date(log.timestamp) >= cutoff
      );
      setFilteredLogs(filtered);
    }
  }, [filterDays, auditLogs]);

  const dedupedAlerts = Object.values(
    alerts.reduce((acc, curr) => {
      const key = curr.product;
      if (!acc[key] || curr.stock < acc[key].stock) acc[key] = curr;
      return acc;
    }, {})
  );

  const topSellingChartData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: "Units Sold",
        data: topProducts.map((p) => p.sold),
        backgroundColor: "#6A1B9A",
      },
    ],
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="fw-bold text-center text-dark mb-4">
        📊 Welcome, {user?.name} ({roleDisplay[user?.role] || user?.role})
      </h3>

      {loading ? (
        <p className="text-center">Loading dashboard...</p>
      ) : (
        <>
          {/* 📦 Stock Overview */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">📦 Stock Overview</h5>
              <div style={{ display: "flex", overflowX: "auto", gap: "1rem" }}>
                {stockData.length > 0 ? (
                  stockData.map((item, i) => (
                    <div
                      key={i}
                      className="border p-3 rounded text-center bg-light"
                      style={{ minWidth: 170 }}
                    >
                      <h6 className="fw-semibold mb-1">{item.name}</h6>
                      <span className="badge bg-primary">
                        Stock: {item.stock}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No stock data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* ⚠️ Low Stock Alerts */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold text-danger mb-3">⚠️ Low Stock Alerts</h5>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {dedupedAlerts.length > 0 ? (
                  dedupedAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className="border border-danger p-3 rounded bg-light"
                    >
                      <h6 className="fw-semibold">{alert.product}</h6>
                      <span className="badge bg-danger">
                        Stock: {alert.stock} / Threshold: {alert.threshold}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-success">✅ No low stock alerts</p>
                )}
              </div>
            </div>
          </div>

          {/* 🏆 Top Selling Products */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">🏆 Top Selling Products</h5>
              {topProducts.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <Bar data={topSellingChartData} />
                </div>
              ) : (
                <p className="text-muted">No sales data found.</p>
              )}
            </div>
          </div>

          {/* 🧾 Audit Logs */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0">🧾 Latest Audit Logs</h5>
                <select
                  className="form-select w-auto"
                  value={filterDays}
                  onChange={(e) => setFilterDays(e.target.value)}
                >
                  <option value="all">Show All</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
              {filteredLogs.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table table-bordered table-sm table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, i) => (
                        <tr key={i}>
                          <td>{log.user}</td>
                          <td>{log.action}</td>
                          <td>{log.details}</td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No audit logs found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
