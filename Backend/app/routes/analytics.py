# app/routes/analytics.py
from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from sqlalchemy import func

from app.extensions import db
from app.models import Product, Sale
from app.services.analytics_service import get_restock_recommendations

# Single blueprint – no strict_slashes arg (not supported on Blueprint)
analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics",
)

# ────────────────────────────────────────────────────────────────
# GET /api/analytics/trends
# ────────────────────────────────────────────────────────────────
@analytics_bp.route("/trends", methods=["GET"])
def analytics_trends():
    try:
        stock = [{"product": p.name, "stock": p.stock} for p in Product.query.all()]

        # sales last 7 days
        sales = []
        for i in range(6, -1, -1):
            day = datetime.utcnow() - timedelta(days=i)
            start = datetime(day.year, day.month, day.day)
            end   = start + timedelta(days=1)
            count = Sale.query.filter(Sale.timestamp >= start, Sale.timestamp < end).count()
            sales.append({"label": day.strftime("%a"), "sales": count})

        # top-5 products
        top_products = (
            db.session
              .query(Product.name, func.sum(Sale.quantity).label("sold"))
              .join(Sale, Product.id == Sale.product_id)
              .group_by(Product.name)
              .order_by(func.sum(Sale.quantity).desc())
              .limit(5)
              .all()
        )

        return jsonify({
            "stock": stock,
            "sales": sales,
            "topProducts": [{"name": n, "sold": int(s)} for n, s in top_products]
        }), 200

    except Exception as exc:
        return jsonify({"error": "Analytics processing failed", "details": str(exc)}), 500


# ────────────────────────────────────────────────────────────────
# GET /api/analytics/restock-recommendations?windowDays=7
# ────────────────────────────────────────────────────────────────
@analytics_bp.route("/restock-recommendations", methods=["GET"])
def restock_recommendations():
    try:
        window_days = request.args.get("windowDays", default=7, type=int)
        recs = get_restock_recommendations(window_days)
        return jsonify([asdict(r) for r in recs]), 200
    except Exception as exc:
        return jsonify({"error": "Failed to fetch restock data", "details": str(exc)}), 500


# ────────────────────────────────────────────────────────────────
# GET /api/analytics/low-stock-frequency
# ────────────────────────────────────────────────────────────────
@analytics_bp.route("/low-stock-frequency", methods=["GET"])
def low_stock_alerts():
    try:
        rows = (
            db.session
              .query(Product.name, func.count().label("alerts"))
              .join(Sale, Product.id == Sale.product_id)
              .filter(Product.stock < Product.threshold)
              .group_by(Product.name)
              .all()
        )
        return jsonify([{"product": n, "alerts": a} for n, a in rows]), 200
    except Exception as exc:
        return jsonify({"error": "Could not compute low-stock alerts", "details": str(exc)}), 500


# ────────────────────────────────────────────────────────────────
# GET /api/analytics/deadstock
# ────────────────────────────────────────────────────────────────
@analytics_bp.route("/deadstock", methods=["GET"])
def deadstock_items():
    try:
        cutoff = datetime.utcnow() - timedelta(days=30)
        sold_recently = db.session.query(Sale.product_id).filter(Sale.timestamp >= cutoff)
        unsold = Product.query.filter(~Product.id.in_(sold_recently)).all()
        return jsonify([
            {"productId": p.id, "productName": p.name, "stock": p.stock}
            for p in unsold
        ]), 200
    except Exception as exc:
        return jsonify({"error": "Failed to retrieve deadstock", "details": str(exc)}), 500


# ────────────────────────────────────────────────────────────────
# GET /api/analytics/sales-heatmap
# ────────────────────────────────────────────────────────────────
@analytics_bp.route("/sales-heatmap", methods=["GET"])
def sales_heatmap():
    try:
        cutoff = datetime.utcnow() - timedelta(days=30)
        rows = (
            db.session
              .query(
                  func.date(Sale.timestamp).label("date"),
                  func.extract('hour', Sale.timestamp).label("hour"),
                  func.count(Sale.id).label("count")
              )
              .filter(Sale.timestamp >= cutoff)
              .group_by(func.date(Sale.timestamp), func.extract('hour', Sale.timestamp))
              .all()
        )
        return jsonify([
            {"date": str(r.date), "hour": int(r.hour), "count": int(r.count)}
            for r in rows
        ]), 200
    except Exception as exc:
        return jsonify({"error": "Heatmap generation failed", "details": str(exc)}), 500
