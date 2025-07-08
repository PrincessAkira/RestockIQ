import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";   // 🔄 correct path

// CRA env variable (falls back to localhost)
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const VAT_RATE = 0.15;

export default function POS() {
  /* ------------------------------------------------------------------ */
  /* 1️⃣  Auth — tolerate missing provider                               */
  /* ------------------------------------------------------------------ */
  const auth = useAuth();              // may be undefined
  const cashierName = auth?.user?.name || "Cashier";

  /* ------------------------------------------------------------------ */
  /* 2️⃣  Local state                                                    */
  /* ------------------------------------------------------------------ */
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionData, setTransactionData] = useState({});

  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /* 3️⃣  Fetch products every 10 s                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchProducts = () =>
      axios
        .get(`${BASE_URL}/api/products/`)
        .then((res) => setProducts(res.data))
        .catch(() => toast.error("❌ Failed to load products"));

    fetchProducts();
    const id = setInterval(fetchProducts, 10_000);
    return () => clearInterval(id);
  }, []);

  /* ------------------------------------------------------------------ */
  /* 4️⃣  Helpers                                                        */
  /* ------------------------------------------------------------------ */
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * VAT_RATE;
  const total = subtotal + tax;
  const change = ((parseFloat(amountPaid) || 0) - total).toFixed(2);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q);
  });

  const addToCart = (product) => {
    toast.success(`✅ Added ${product.name}`);
    setCart((c) => {
      const idx = c.findIndex((i) => i.id === product.id);
      if (idx === -1) return [...c, { ...product, quantity: 1 }];
      const copy = [...c];
      copy[idx].quantity += 1;
      return copy;
    });
  };

  const updateQty = (id, qty) =>
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );

  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const txnNumber = () => {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rnd = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    return `TXN-${stamp}-${rnd}`;
  };

  /* ------------------------------------------------------------------ */
  /* 5️⃣  Checkout                                                       */
  /* ------------------------------------------------------------------ */
  async function handleCheckout() {
    if (parseFloat(amountPaid || 0) < total) {
      toast.warn("⚠ Amount paid is less than total");
      return;
    }

    try {
      const payload = {
        cart: cart.map(({ id, quantity, price }) => ({ id, quantity, price })),
      };
      await axios.post(`${BASE_URL}/api/sales/`, payload);

      setTransactionData({
        cart,
        txnId: txnNumber(),
        date: new Date().toLocaleString(),
        total: total.toFixed(2),
        paid: parseFloat(amountPaid).toFixed(2),
        change,
        currency,
        paymentMethod,
      });
      setShowReceipt(true);
      toast.success("✅ Sale recorded");
    } catch (err) {
      toast.error(err.response?.data?.error || "Sale failed");
    }
  }

  /* ------------------------------------------------------------------ */
  /* 6️⃣  UI                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="container-fluid py-3">
      {/* header ------------------------------------------------------ */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary">
          <i className="bi bi-cart-check" /> Point of Sale
        </h2>
        <div>
          <span className="badge bg-primary me-2">👤 {cashierName}</span>
          <Link to="/cashier/dashboard" className="btn btn-outline-dark">
            ⬅ Dashboard
          </Link>
        </div>
      </div>

      {/* search + product grid -------------------------------------- */}
      <div className="row">
        <div className="col-lg-8">
          <input
            className="form-control form-control-lg shadow-sm sticky-top"
            placeholder="🔎 Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="row mt-3 g-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {filteredProducts.map((p) => (
              <div className="col-md-4" key={p.id}>
                <div className="card border-0 shadow-sm hover-effect p-3" onClick={() => addToCart(p)}>
                  <h6 className="fw-bold">📦 {p.name}</h6>
                  <p className="mb-1">${p.price.toFixed(2)}</p>
                  <small className="text-muted">Stock: {p.stock}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cart ------------------------------------------------------ */}
        <div className="col-lg-4">
          <div className="card shadow-lg border-0 p-4">
            <h4 className="fw-bold text-primary mb-3">🧾 Cart</h4>
            {cart.length === 0 ? (
              <p className="text-muted">No items yet</p>
            ) : (
              <>
                <div className="list-group mb-3">
                  {cart.map((i) => (
                    <div
                      key={i.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{i.name}</strong>
                        <br />
                        <small>${i.price.toFixed(2)}</small>
                      </div>
                      <input
                        type="number"
                        className="form-control form-control-sm w-25"
                        value={i.quantity}
                        onChange={(e) => updateQty(i.id, +e.target.value)}
                      />
                      <span>${(i.price * i.quantity).toFixed(2)}</span>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i.id)}>
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                {/* totals */}
                <div className="d-flex justify-content-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between"><span>VAT 15%</span><span>${tax.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>

                {/* payment fields */}
                <div className="row mt-3 g-2">
                  <div className="col"><input type="number" className="form-control" placeholder="Paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} /></div>
                  <div className="col">
                    <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option>USD</option><option>ZAR</option><option>ZiG</option>
                    </select>
                  </div>
                  <div className="col">
                    <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option>Cash</option><option>Card</option><option>Mobile Money</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>Change</span>
                  <span className={change < 0 ? "text-danger" : "text-success"}>
                    {currency} {change}
                  </span>
                </div>

                <button className="btn btn-success w-100 mt-3" onClick={handleCheckout}>
                  ✅ Complete Sale
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* receipt modal --------------------------------------------- */}
      {showReceipt && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h5 className="text-center">ReStockIQ Supermarket</h5>
              <hr />
              <p className="mb-1"><strong>Receipt:</strong> {transactionData.txnId}</p>
              <p className="mb-1"><strong>Cashier:</strong> {cashierName}</p>
              <p className="mb-1"><strong>Date:</strong> {transactionData.date}</p>
              <hr />
              {transactionData.cart.map((i) => (
                <div key={i.id} className="d-flex justify-content-between small">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span><span>{currency} {transactionData.total}</span>
              </div>
              <div className="d-flex justify-content-between"><span>Paid</span><span>{currency} {transactionData.paid}</span></div>
              <div className="d-flex justify-content-between"><span>Change</span><span>{currency} {transactionData.change}</span></div>
              <div className="text-center my-3"><QRCode value={transactionData.txnId} size={64} /></div>
              <button className="btn btn-primary w-100" onClick={() => window.print()}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

      {/* tiny hover style */}
      <style>{`.hover-effect:hover{transform:translateY(-4px);transition:.2s}`}</style>
    </div>
  );
}
