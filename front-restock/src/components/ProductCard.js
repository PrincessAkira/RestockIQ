import React from "react";

export default function ProductCard({ product, onAddToCart }) {
  const { name, stock, price, threshold } = product;

  // Determine stock status
  let stockStatus = "In Stock";
  let badgeColor = "success";

  if (stock <= threshold && stock > threshold / 2) {
    stockStatus = "Low";
    badgeColor = "warning";
  } else if (stock <= threshold / 2) {
    stockStatus = "Critical";
    badgeColor = "danger";
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 className="fw-bold text-truncate">{name}</h5>
          <p className="mb-1">Stock: {stock}</p>
          <p className="mb-1">Price: ${price.toFixed(2)}</p>
          <span className={`badge bg-${badgeColor}`}>{stockStatus}</span>
        </div>

        {onAddToCart && (
          <button
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={() => onAddToCart(product)}
            disabled={stock <= 0}
          >
            {stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        )}
      </div>
    </div>
  );
}
