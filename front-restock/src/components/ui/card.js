import React from "react";

export const Card = ({ children }) => (
  <div className="card shadow-sm rounded-4 p-3 mb-4">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="card-body">{children}</div>
);
