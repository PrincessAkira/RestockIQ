// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ roles = [], children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return <Navigate to="/login" />;
  }

  return children;
}
