import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button, Table, Alert } from "react-bootstrap";
import axios from "axios";

export default function SaleResult() {
  const navigate = useNavigate();
  const { state } = useLocation(); // POS passes sale summary via navigate
  const { items = [], total = 0, paid = 0, change = 0, saleId } = state || {};

  const [seconds, setSeconds] = useState(5);

  /* 🔔 Toast once on mount */
  useEffect(() => {
    toast.success("Sale completed & stock updated!");
  }, []);

  /* ⏳ countdown + safe cleanup */
  useEffect(() => {
    if (seconds === 0) {
      navigate("/cashier/pos");
      return;               // ✅ no timer returned
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer); // ✅ cleanup is always a function
  }, [seconds, navigate]);

  /* 🧾 Print helper */
  const printReceipt = () => {
    const doc = new jsPDF();
    doc.text("Sales Receipt", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Item", "Qty", "Price"]],
      body: items.map((i) => [i.name, i.qty, `$${i.price.toFixed(2)}`]),
      margin: { horizontal: 14 },
    });
    const y = doc.lastAutoTable.finalY + 8;
    doc.text(`Total  : $${total.toFixed(2)}`, 14, y);
    doc.text(`Paid   : $${paid.toFixed(2)}`, 14, y + 6);
    doc.text(`Change : $${change.toFixed(2)}`, 14, y + 12);
    doc.save(`receipt_${saleId || Date.now()}.pdf`);
  };

  /* 🔄 Undo helper */
  const undoSale = async () => {
    try {
      await axios.delete(`/api/sales/${saleId}`);
      toast.info("Sale reversed & stock restored");
      navigate("/cashier/pos");
    } catch (err) {
      toast.error("Could not reverse sale");
    }
  };

  return (
    <div className="container mt-5 text-center">
      <div className="card shadow-lg p-5 border-0 rounded-4 bg-light">
        <h3 className="fw-bold text-success mb-3">
          ✅ Sale Completed Successfully!
        </h3>

        {/* 🧮 Sale summary */}
        {items.length > 0 ? (
          <Table bordered striped className="mb-4">
            <thead>
              <tr>
                <th>Item</th><th>Qty</th><th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.name}</td>
                  <td>{it.qty}</td>
                  <td>${it.price.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td colSpan={2}>Total</td>
                <td>${total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2}>Paid</td>
                <td>${paid.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2}>Change</td>
                <td>${change.toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <Alert variant="warning">No summary data passed from POS.</Alert>
        )}

        {/* Action buttons */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <Link to="/cashier/pos" className="btn btn-outline-primary btn-lg">
            🔄 Back to POS
          </Link>

          <Button variant="success" size="lg" onClick={printReceipt}>
            🧾 Print Receipt
          </Button>

          {!!saleId && (
            <Button variant="outline-danger" size="lg" onClick={undoSale}>
              🔄 Undo Sale
            </Button>
          )}
        </div>

        <p className="text-muted mt-3">
          Redirecting in {seconds}s&hellip; (click “Back to POS” to skip)
        </p>
      </div>
    </div>
  );
}
