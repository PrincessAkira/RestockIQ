// src/pages/StockManagement.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ For redirecting to Add Product page

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    blacklisted_products: 0,
    deleted_products: 0,
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  const BASE_URL = "http://localhost:5000";
  const navigate = useNavigate(); // ✅

  // Fetch product list
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/reports/summary`);
        setSummary(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch summary:", err.message);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchProducts();
    fetchSummary();
  }, []);

  // Handle stock or threshold update
  const handleUpdate = async (id, field, value) => {
    try {
      await axios.put(`${BASE_URL}/api/stock/${id}`, { [field]: value });
      console.info(`✅ Updated ${field} for product ${id}`);
    } catch (err) {
      console.error("❌ Update failed:", err.message);
      alert("Failed to update — check console for details.");
    }
  };

  // Download reports
  const downloadReport = (type) => {
    window.open(`${BASE_URL}/api/reports/${type}`, "_blank");
  };

  // Handle Add Product button
  const handleAddProduct = () => {
    navigate("/admin/products"); // ✅ Assumes your route for Add Product is /admin/products
  };

  // Filter + Sort products
  const filteredProducts = products
    .filter((p) => {
      if (filterType === "blacklisted" && !p.is_blacklisted) return false;
      if (filterType === "active" && p.is_blacklisted) return false;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === "stock-asc") return a.stock - b.stock;
      if (sortOrder === "stock-desc") return b.stock - a.stock;
      return 0;
    });

  return (
    <div className="container mt-5">
      <h3 className="fw-bold text-center mb-4 text-dark">
        Manage Stock & Reports
      </h3>

      {/* Controls */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="🔎 Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Show All</option>
            <option value="active">Active Products</option>
            <option value="blacklisted">Blacklisted Only</option>
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="none">Sort By</option>
            <option value="stock-asc">Stock Ascending</option>
            <option value="stock-desc">Stock Descending</option>
          </select>
        </div>
        <div className="col-md-3 mb-2 text-end">
          <button className="btn btn-primary w-100" onClick={handleAddProduct}>
            ➕ Add New Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        {summaryLoading ? (
          <p className="text-center">Loading summary...</p>
        ) : (
          <>
            <div className="col-md-4 mb-2">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5>Total Products</h5>
                  <p className="display-6">{summary.total_products}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5>Blacklisted</h5>
                  <p className="display-6">{summary.blacklisted_products}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5>Deleted</h5>
                  <p className="display-6">{summary.deleted_products}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report Download Buttons */}
      <div className="mb-4 text-center">
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => downloadReport("pdf")}
        >
          Download PDF
        </button>
        <button
          className="btn btn-outline-success me-2"
          onClick={() => downloadReport("excel")}
        >
          Download Excel
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => downloadReport("zip")}
        >
          Download ZIP
        </button>
      </div>

      {/* Stock Table */}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isCritical = p.stock <= p.threshold;
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          className={`form-control ${
                            isCritical ? "bg-warning-subtle" : ""
                          }`}
                          defaultValue={p.stock}
                          onBlur={(e) =>
                            handleUpdate(p.id, "stock", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          defaultValue={p.threshold}
                          onBlur={(e) =>
                            handleUpdate(p.id, "threshold", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        {p.is_blacklisted ? (
                          <span className="badge bg-danger">Blacklisted</span>
                        ) : isCritical ? (
                          <span className="badge bg-warning text-dark">
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
