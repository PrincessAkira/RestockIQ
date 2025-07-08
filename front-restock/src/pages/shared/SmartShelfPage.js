// src/pages/shared/SmartShelfPage.js

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  SalesOverTimeChart,
  TopCategoriesChart,
  LowStockChart,
} from "../../components/charts";
import { saveAs } from "file-saver";
import axios from "axios";

export default function SmartShelfPage() {
  const [salesTrend, setSalesTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [deadstock, setDeadstock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, categoriesRes, lowStockRes, deadstockRes] =
          await Promise.all([
            axios.get("/api/smartshelf/sales-over-time"),
            axios.get("/api/smartshelf/top-categories"),
            axios.get("/api/smartshelf/low-stock"),
            axios.get("/api/smartshelf/deadstock"),
          ]);

        setSalesTrend(salesRes.data);
        setTopCategories(categoriesRes.data);
        setLowStock(lowStockRes.data);
        setDeadstock(deadstockRes.data);
      } catch (error) {
        console.error("Error loading SmartShelf data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const exportToCSV = () => {
    const blob = new Blob(
      [
        `Date,Sales\n${salesTrend
          .map((row) => `${row.date},${row.sales}`)
          .join("\n")}`,
      ],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, "sales_over_time.csv");
  };

  return (
    <div className="container mt-5 mb-5">
      <motion.h3
        className="fw-bold text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🧠 SmartShelf Insights Dashboard
      </motion.h3>

      {loading ? (
        <Skeleton count={5} height={150} className="mb-3" />
      ) : (
        <div className="row g-4">
          <div className="col-md-6">
            <Card>
              <CardContent>
                <h5>📈 Sales Over Time</h5>
                <SalesOverTimeChart data={salesTrend} />
              </CardContent>
            </Card>
          </div>
          <div className="col-md-6">
            <Card>
              <CardContent>
                <h5>📊 Top Categories</h5>
                <TopCategoriesChart data={topCategories} />
              </CardContent>
            </Card>
          </div>

          <div className="col-md-6">
            <Card>
              <CardContent>
                <h5>📉 Low Stock Alerts</h5>
                <LowStockChart data={lowStock} />
              </CardContent>
            </Card>
          </div>

          <div className="col-md-6">
            <Card>
              <CardContent>
                <h5>🔻 Deadstock Items</h5>
                <ul className="list-group">
                  {deadstock.map((item) => (
                    <li
                      key={item.productId}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {item.productName}
                      <span className="badge bg-danger">
                        {item.stock} in stock
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 d-flex justify-content-between align-items-center">
            <Button onClick={exportToCSV} className="btn btn-outline-primary">
              📋 Export to CSV
            </Button>
            <small className="text-muted">
              💡 Filter by date range coming soon
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
