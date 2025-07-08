import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import {
  Button,
  ButtonGroup,
  Card,
  Table,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";

const todayRange = () => {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    to: now,
  };
};

const weekRange = () => {
  const now = new Date();
  const first = new Date(now.setDate(now.getDate() - 6));
  return { from: first, to: new Date() };
};

export default function SalesReportPage() {
  const [{ from, to }, setRange] = useState(todayRange());
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/sales", {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      setSales(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, [from, to]);

  /* ——————————————————— export helpers ——————————————————— */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Date", "Items", "Total ($)"]],
      body: sales.map((s) => [
        new Date(s.timestamp).toLocaleString(),
        s.itemCount,
        s.total.toFixed(2),
      ]),
      margin: { horizontal: 14 },
    });
    doc.save("sales_report.pdf");
  };

  /* ——————————————————— render ——————————————————— */
  return (
    <div className="container my-4">
      <Card className="p-4 shadow-sm">
        <Row className="g-3 mb-3 align-items-end">
          <Col md="auto">
            <label className="form-label fw-bold">Quick Ranges:</label>
            <ButtonGroup>
              <Button size="sm" onClick={() => setRange(todayRange())}>
                Today
              </Button>
              <Button size="sm" onClick={() => setRange(weekRange())}>
                This Week
              </Button>
            </ButtonGroup>
          </Col>

          <Col md="auto">
            <label className="form-label fw-bold">From:</label>
            <DatePicker
              selected={from}
              onChange={(d) => setRange((r) => ({ ...r, from: d }))}
              className="form-control"
            />
          </Col>

          <Col md="auto">
            <label className="form-label fw-bold">To:</label>
            <DatePicker
              selected={to}
              onChange={(d) => setRange((r) => ({ ...r, to: d }))}
              className="form-control"
            />
          </Col>

          <Col md="auto">
            <Button variant="primary" onClick={fetchSales}>
              🔍 Refresh
            </Button>
          </Col>

          <Col className="text-end">
            <CSVLink
              data={sales}
              filename="sales_report.csv"
              className="btn btn-outline-success me-2"
            >
              ⬇️ CSV
            </CSVLink>
            <Button variant="outline-danger" onClick={exportPDF}>
              ⬇️ PDF
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.timestamp).toLocaleString()}</td>
                  <td>{s.itemCount}</td>
                  <td>{s.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
