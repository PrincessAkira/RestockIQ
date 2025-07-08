"""
📦 stock.py — Stock & Threshold Management API

This module handles real-time inventory updates for products.

🔧 Features:
- ✅ Update stock and threshold for a single product via `PUT /api/stock/<product_id>`
- ✅ Batch update multiple products in one request via `PUT /api/stock/batch`
- 🔐 Prevents stock updates for blacklisted or soft-deleted products
- 🔔 Triggers low-stock warnings if stock falls below threshold
- 🧾 Creates audit log entries for every stock or threshold update
- 🔍 Validates inputs and ensures system integrity during batch operations
- 🚫 Silently skips invalid or inactive products during batch updates

📌 Used in:
- Admin dashboard: stock management panel
- POS system: automated stock deductions (via `sales.py`)
"""

from flask import Blueprint, request, jsonify, current_app as app
from app.extensions import db
from app.models import Product, AuditLog

bp = Blueprint("stock", __name__)

# ✅ Update stock/threshold for a single product
@bp.route("/<int:product_id>", methods=["PUT"])
def update_stock(product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)

    # 🛡 Block update if product is blacklisted or deleted
    if product.is_blacklisted or product.date_deleted:
        return jsonify({"error": "Cannot update inactive product"}), 403

    updated_fields = []

    if "stock" in data:
        product.stock = int(data["stock"])
        updated_fields.append("stock")

    if "threshold" in data:
        product.threshold = int(data["threshold"])
        updated_fields.append("threshold")

    # 🔔 Log warning if stock is critically low
    if product.stock <= product.threshold:
        app.logger.warning(f"⚠️ Low stock for '{product.name}': {product.stock}")

    # 🧾 Audit log
    if updated_fields:
        log = AuditLog(
            user="admin@example.com",  # 🔁 Replace with actual session user if implemented
            action="Stock Update",
            details=f"{product.name}: updated {', '.join(updated_fields)}"
        )
        db.session.add(log)

    db.session.commit()
    return jsonify({"message": "Stock updated successfully"}), 200

# ✅ Batch stock/threshold updates
@bp.route("/batch", methods=["PUT"])
def batch_update_stock():
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"error": "Expected a list of product updates"}), 400

    success_count = 0
    for item in data:
        try:
            product = Product.query.get(item.get("id"))
            if not product or product.is_blacklisted or product.date_deleted:
                continue

            updated_fields = []

            if "stock" in item:
                product.stock = int(item["stock"])
                updated_fields.append("stock")

            if "threshold" in item:
                product.threshold = int(item["threshold"])
                updated_fields.append("threshold")

            if product.stock <= product.threshold:
                app.logger.warning(f"⚠️ Low stock for '{product.name}' after batch update")

            # Audit log per product
            if updated_fields:
                db.session.add(AuditLog(
                    user="admin@example.com",
                    action="Batch Stock Update",
                    details=f"{product.name}: updated {', '.join(updated_fields)}"
                ))

            success_count += 1
        except Exception as e:
            app.logger.error(f"Batch update failed for product {item.get('id')}: {str(e)}")
            continue

    db.session.commit()
    return jsonify({"message": f"{success_count} product(s) updated successfully"}), 200

# ✅ Handle OPTIONS (CORS Preflight) for single product update
@bp.route("/<int:product_id>", methods=["OPTIONS"])
def options_update_stock(product_id):
    return '', 204

# ✅ Handle OPTIONS (CORS Preflight) for batch update
@bp.route("/batch", methods=["OPTIONS"])
def options_batch_update_stock():
    return '', 204
