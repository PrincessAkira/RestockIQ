# app/routes/smartshelf_tracker.py

from flask import Blueprint, jsonify
from app.models import Sale, Product  # adjust if model paths differ
from sqlalchemy import func
from app.extensions import db
from datetime import datetime, timedelta

bp = Blueprint("smartshelf_tracker", __name__, url_prefix="/api/smartshelf")


@bp.route("/sales-over-time", methods=["GET"])
def sales_over_time():
    results = (
        db.session.query(
            func.date(Sale.timestamp).label("date"),
            func.sum(Sale.quantity).label("sales")
        )
        .group_by(func.date(Sale.timestamp))
        .order_by(func.date(Sale.timestamp))
        .all()
    )
    return jsonify([{"date": str(r.date), "sales": r.sales} for r in results])


@bp.route("/top-categories", methods=["GET"])
def top_categories():
    results = (
        db.session.query(
            Product.category,
            func.sum(Sale.quantity).label("total_sales")
        )
        .join(Sale, Product.id == Sale.product_id)
        .group_by(Product.category)
        .order_by(func.sum(Sale.quantity).desc())
        .limit(5)
        .all()
    )
    return jsonify([{"category": r.category, "sales": r.total_sales} for r in results])


@bp.route("/low-stock", methods=["GET"])
def low_stock():
    threshold = 5
    products = Product.query.filter(Product.stock <= threshold).all()
    return jsonify([
        {"productId": p.id, "productName": p.name, "stock": p.stock}
        for p in products
    ])


@bp.route("/deadstock", methods=["GET"])
def deadstock():
    # Products that haven’t sold in the last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    recent_sales = db.session.query(Sale.product_id).filter(Sale.timestamp >= cutoff)
    dead_products = (
        db.session.query(Product)
        .filter(~Product.id.in_(recent_sales))
        .all()
    )
    return jsonify([
        {"productId": p.id, "productName": p.name, "stock": p.stock}
        for p in dead_products
    ])
