import React from "react";

export default function ShelfStatusCard({ product, stock, threshold }) {
  let status = "Sufficient";
  let color = "success";
  let message = "Stock is healthy";

  if (stock <= threshold && stock > threshold / 2) {
    status = "Low";
    color = "warning";
    message = "Consider restocking soon";
  }

  if (stock <= threshold / 2) {
    status = "Critical";
    color = "danger";
    message = "Urgent restock required";
  }

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="fw-bold text-dark">{product}</h5>
        <p className="mb-2 text-muted" style={{ fontSize: "0.95rem" }}>
          Stock: <strong>{stock}</strong> / Threshold:{" "}
          <strong>{threshold}</strong>
        </p>
        <div className="d-flex align-items-center justify-content-between">
          <span className={`badge bg-${color} px-3 py-2 rounded-pill`}>
            {status}
          </span>
          <small className="text-muted" style={{ fontStyle: "italic" }}>
            {message}
          </small>
        </div>
      </div>
    </div>
  );
}
