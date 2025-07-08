// src/pages/AuditLogViewer.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/audit-logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch audit logs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filtered and sorted logs
  const filteredLogs = logs
    .filter(
      (log) =>
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="container mt-5">
      <h3 className="fw-bold text-dark text-center mb-4">
        🧾 Audit Log Viewer
      </h3>

      {/* Controls */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="🔎 Search by user or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
        <div className="col-md-4 text-end mb-2">
          <span className="badge bg-primary p-2">
            {filteredLogs.length} Logs Found
          </span>
        </div>
      </div>

      {/* Log Table */}
      {loading ? (
        <p className="text-center">Loading audit logs...</p>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{log.user}</td>
                        <td>{log.action}</td>
                        <td>{log.details}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
