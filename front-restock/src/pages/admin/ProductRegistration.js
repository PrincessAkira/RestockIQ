import React, { useState } from "react";
import axios from "axios";

export default function ProductRegistration() {
  const BASE_URL = "http://localhost:5000"; // ✅ Ensure backend URL is correct

  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    threshold: "",
    price: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/products`, formData);
      alert("✅ Product registered successfully!");
      setFormData({ name: "", stock: "", threshold: "", price: "" });
    } catch (err) {
      alert("❌ Error registering product. See console for details.");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="fw-bold text-center mb-4 text-dark">
        Register New Product
      </h3>
      <form
        className="card p-4 shadow-sm mx-auto"
        style={{ maxWidth: "600px" }}
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Initial Stock</label>
          <input
            className="form-control"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Stock Threshold</label>
          <input
            className="form-control"
            name="threshold"
            type="number"
            value={formData.threshold}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price ($)</label>
          <input
            className="form-control"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">
          Add Product
        </button>
      </form>
    </div>
  );
}
