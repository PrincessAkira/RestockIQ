// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ShelfStatusCard from "../components/ShelfStatusCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(true);

  const BASE_URL = "http://localhost:5000";

  // ✅ Fetch products and group by name
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products`);

        // 🧠 Group products by name
        const grouped = {};
        res.data.forEach((item) => {
          const name = item.name;
          if (!grouped[name]) {
            grouped[name] = {
              ...item,
              stock: Number(item.stock),
              threshold: Number(item.threshold),
            };
          } else {
            grouped[name].stock += Number(item.stock);
          }
        });

        setProducts(Object.values(grouped));
      } catch (err) {
        console.error("❌ Failed to load products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/alerts`);

        // 🧠 Group alerts by product name
        const groupedAlerts = {};
        res.data.forEach((item) => {
          const name = item.product;
          if (!groupedAlerts[name]) {
            groupedAlerts[name] = {
              product: name,
              stock: Number(item.stock),
              threshold: Number(item.threshold),
            };
          } else {
            groupedAlerts[name].stock += Number(item.stock);
          }
        });

        setAlerts(Object.values(groupedAlerts));
      } catch (err) {
        console.error("❌ Failed to load alerts:", err.message);
      } finally {
        setAlertLoading(false);
      }
    };

    fetchProducts();
    fetchAlerts();
  }, []);

  return (
    <section className="container py-5">
      <h2 className="text-center fw-bold mb-4">Shelf Overview</h2>

      {loading ? (
        <p className="text-center">Loading shelves...</p>
      ) : (
        <div className="row g-4">
          {products.length > 0 ? (
            products.map((item, index) => (
              <div key={index} className="col-md-4">
                <ShelfStatusCard
                  product={item.name}
                  stock={item.stock}
                  threshold={item.threshold}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No products available.</p>
          )}
        </div>
      )}

      <div className="mt-5">
        <h4 className="fw-bold mb-3 text-danger">⚠️ Alerts</h4>

        {alertLoading ? (
          <p className="text-center">Checking alerts...</p>
        ) : alerts.length > 0 ? (
          <ul className="list-group">
            {alerts.map((alert, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{alert.product}</strong>
                </span>
                <span className="badge bg-danger rounded-pill">
                  Stock: {alert.stock} / Threshold: {alert.threshold}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">All shelves are currently stocked well.</p>
        )}
      </div>
    </section>
  );
}
