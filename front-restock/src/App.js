import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// === Components ===
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// === Auth Pages ===
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// === Public / Shared Pages ===
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AlertsPage from "./pages/shared/AlertsPage";
import SmartShelfPage from "./pages/shared/SmartShelfPage";

// === Admin Pages ===
import ProductRegistration from "./pages/admin/ProductRegistration";
import StockManagement from "./pages/admin/StockManagement";
import Dashboard from "./pages/admin/Dashboard";
import AuditLogViewer from "./pages/admin/AuditLogViewer";
import RestockRecommendationsPage from "./pages/admin/RestockRecommendationsPage";

// === Cashier Pages ===
import POS from "./pages/cashier/POS";
import SaleResult from "./pages/cashier/SaleResult";
import CashierDashboard from "./pages/cashier/CashierDashboard";

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 👇 Check if user is in localStorage and valid
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoadingUser(false);
  }, []);

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && user && <Navbar user={user} />}
      <main className="flex-grow-1">
        {!isLoadingUser && (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Shared Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin", "cashier"]}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute roles={["admin", "cashier"]}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/smartshelf"
              element={
                <ProtectedRoute roles={["admin", "cashier"]}>
                  <SmartShelfPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Only */}
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ProductRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stock"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <StockManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AuditLogViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/restock-recommendations"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <RestockRecommendationsPage />
                </ProtectedRoute>
              }
            />

            {/* Cashier Only */}
            <Route
              path="/cashier/dashboard"
              element={
                <ProtectedRoute roles={["cashier"]}>
                  <CashierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier/pos"
              element={
                <ProtectedRoute roles={["cashier"]}>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier/sales"
              element={
                <ProtectedRoute roles={["cashier"]}>
                  <SaleResult />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="text-center p-5">
                  <h2>404 - Page Not Found</h2>
                </div>
              }
            />
          </Routes>
        )}
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
