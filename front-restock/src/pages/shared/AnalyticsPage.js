// src/pages/shared/AnalyticsPage.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import StockOverviewChart from "../../components/Charts/StockOverviewChart";
import SalesTrendChart from "../../components/Charts/SalesTrendChart";

export default function AnalyticsPage() {
  // State for chart data
  const [stockData, setStockData] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // State for status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics/trends");
        const { stock, sales, topProducts } = response.data;

        // Store data in state
        setStockData(stock || []);
        setSalesTrend(sales || []);
        setTopProducts(topProducts || []);
      } catch (err) {
        console.error("❌ Failed to fetch analytics:", err);
        setError("Could not load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h3 className="fw-bold text-center text-dark mb-4">
        📈 Analytics Dashboard
      </h3>

      {/* Loading Spinner */}
      {loading && (
        <p className="text-center text-muted">Loading analytics data...</p>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* 📦 Stock Overview */}
          <div className="mb-5">
            <h5 className="fw-semibold mb-2">📦 Stock Overview</h5>
            {stockData.length > 0 ? (
              <StockOverviewChart data={stockData} />
            ) : (
              <p className="text-muted">No stock data to display.</p>
            )}
          </div>

          {/* 📊 Weekly Sales Trend */}
          <div className="mb-5">
            <h5 className="fw-semibold mb-2">📊 Weekly Sales Trend</h5>
            {salesTrend.length > 0 ? (
              <SalesTrendChart data={salesTrend} />
            ) : (
              <p className="text-muted">No sales trend data available.</p>
            )}
          </div>

          {/* 🏆 Top Selling Products */}
          <div>
            <h5 className="fw-semibold mb-2">🏆 Top 5 Selling Products</h5>
            {topProducts.length > 0 ? (
              <ul className="list-group">
                {topProducts.map((item, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {item.name}
                    <span className="badge bg-success">
                      {item.sold} sold
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No top-selling product data available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
