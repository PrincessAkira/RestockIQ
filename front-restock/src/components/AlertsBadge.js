import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AlertsBadge() {
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("/api/alerts");
        setAlertCount(response.data.length); // assuming it's an array of alerts
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <Link
      to="/alerts"
      className="nav-link position-relative fw-semibold"
      style={{ color: "#6a1b9a" }}
    >
      Alerts
      {!loading && alertCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "0.7rem" }}
        >
          {alertCount}
        </span>
      )}
    </Link>
  );
}
