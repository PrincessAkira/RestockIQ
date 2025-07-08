# app/routes/alerts.py

from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from app.extensions import db
from app.models import Product, Sale

bp = Blueprint('alerts', __name__)

@bp.route("/", methods=["GET"])
def get_alerts():
    # 🔍 1. Identify all products below or at threshold
    low_stock_products = Product.query.filter(Product.stock <= Product.threshold).all()

    # 📊 2. Get average daily sales over the past 7 days for each product
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    sales_stats = (
        db.session.query(
            Sale.product_id,
            func.sum(Sale.quantity).label("total_sales")
        )
        .filter(Sale.timestamp >= seven_days_ago)
        .group_by(Sale.product_id)
        .all()
    )

    avg_sales_map = {
        product_id: total_sales / 7  # convert to daily average
        for product_id, total_sales in sales_stats
    }

    alerts = []

    for product in low_stock_products:
        # Get average sales or fallback to 0.1 to avoid division by zero
        avg_daily_sales = avg_sales_map.get(product.id, 0.1)
        est_depletion_days = round(product.stock / avg_daily_sales, 1)

        # 🚨 Determine priority level
        if product.stock == 0:
            priority = "Critical"
        elif product.stock < 0.5 * product.threshold:
            priority = "High"
        else:
            priority = "Moderate"

        # 📦 Suggest reorder quantity
        lead_time_days = 3
        safety_stock = product.threshold  # You can tune this logic
        suggested_qty = max(0, int((avg_daily_sales * lead_time_days) + safety_stock - product.stock))

        alerts.append({
            "product": product.name,
            "stock": product.stock,
            "threshold": product.threshold,
            "priority": priority,
            "avg_daily_sales": round(avg_daily_sales, 2),
            "est_depletion_days": est_depletion_days,
            "suggested_reorder_qty": suggested_qty,
            "last_restocked": product.last_restocked.strftime("%Y-%m-%d") if product.last_restocked else None
        })

    return jsonify(alerts), 200
