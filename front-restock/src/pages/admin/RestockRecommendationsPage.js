// src/pages/admin/RestockRecommendationsPage.js
import React, { useEffect, useState } from "react";
import {
  getRestockRecommendations,
  getLowStockAlerts,
  getDeadstockItems,
  getAnalyticsTrends,
} from "../../services/analyticsService";
import { CSVLink } from "react-csv";
import {
  Button,
  Form,
  InputGroup,
  Pagination,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { Line, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

export default function RestockRecommendationsPage() {
  /* ─────────────────────────  state  ───────────────────────── */
  const [restockData, setRestockData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [deadstockData, setDeadstockData] = useState([]);
  const [trendData, setTrendData] = useState({ sales: [], topProducts: [] });

  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState("salesVelocity");
  const [sortDirection, setSortDirection] = useState("desc");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  /* ───────────────────────  data loading  ─────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [restock, low, dead, trends] = await Promise.all([
          getRestockRecommendations(7),
          getLowStockAlerts(),
          getDeadstockItems(),
          getAnalyticsTrends(),
        ]);

        setRestockData(restock);
        setLowStockData(low);
        setDeadstockData(dead);
        setTrendData(trends);
        toast.success("📊 Data loaded");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load one or more datasets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────────────────────  filtering / sorting  ─────────────────────── */
  useEffect(() => {
    let data = [...restockData];

    if (search.trim()) {
      data = data.filter((p) =>
        p.productName.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    setFilteredData(data);
    setPage(1); // reset page if filter changes
  }, [search, restockData, sortKey, sortDirection]);

  const paginated = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  /* ─────────────────────────  PDF export  ───────────────────────── */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Restock Suggestions", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Product", "Stock", "Velocity", "Recommended"]],
      body: paginated.map((r) => [
        r.productName,
        r.currentStock,
        r.salesVelocity.toFixed(2),
        r.recommendedQuantity,
      ]),
    });
    doc.save("restock_recommendations.pdf");
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  /* ─────────────────────────  UI  ───────────────────────── */
  return (
    <div className="container py-4">
      <ToastContainer />

      <h2 className="mb-4 text-center fw-bold text-primary">
        📦 Inventory Recommendations Dashboard
      </h2>

      {/* Search + export buttons */}
      <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
        <InputGroup style={{ maxWidth: 350 }}>
          <Form.Control
            placeholder="Search product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <div className="btn-group">
          <CSVLink
            data={filteredData}
            filename="restock_recommendations.csv"
            className="btn btn-outline-success"
          >
            Export CSV
          </CSVLink>
          <Button variant="outline-danger" onClick={exportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Restock table */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between">
          🔁 Restock Suggestions
          <span className="text-white-50 small">
            Sorted by {sortKey} ({sortDirection})
          </span>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("productName")}>
                    Product
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("currentStock")}>
                    Stock
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("salesVelocity")}>
                    Velocity
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSort("recommendedQuantity")}
                  >
                    Recommended
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      ✅ Inventory is healthy. No restocking needed.
                    </td>
                  </tr>
                ) : (
                  paginated.map((rec) => (
                    <tr key={rec.productId}>
                      <td>{rec.productName}</td>
                      <td>
                        <span className="badge bg-secondary">{rec.currentStock}</span>
                      </td>
                      <td>{rec.salesVelocity.toFixed(2)}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {rec.recommendedQuantity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-center">
            <Pagination>
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === page}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Low stock & deadstock cards (unchanged) */}
      {/* … keep your existing code for those two sections … */}

      {/* ─── Trends Charts ─── */}
      <Row className="gy-4 mb-5">
        {/* Sales last 7 days */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>📈 Sales (Last 7 Days)</Card.Header>
            <Card.Body>
              <Line
                data={{
                  labels: trendData.sales.map((d) => d.label),
                  datasets: [
                    {
                      label: "Units Sold",
                      data: trendData.sales.map((d) => d.sales),
                    },
                  ],
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Top products */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>🏆 Top 5 Products (7 Days)</Card.Header>
            <Card.Body>
              <Bar
                data={{
                  labels: trendData.topProducts.map((p) => p.name),
                  datasets: [
                    {
                      label: "Units Sold",
                      data: trendData.topProducts.map((p) => p.sold),
                    },
                  ],
                }}
                options={{ indexAxis: "y" }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
