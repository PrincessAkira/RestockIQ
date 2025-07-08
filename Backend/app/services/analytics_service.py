# app/services/analytics_service.py
from __future__ import annotations
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import List

from sqlalchemy import func, case
from app.extensions import db
from app.models import Product, Sale


# ────────────────────────────────────────────────────────────────
# Dataclass returned to the route
# ────────────────────────────────────────────────────────────────
@dataclass
class RestockRecommendation:
    productId: int
    productName: str
    currentStock: int
    salesVelocity: int
    recommendedQuantity: int
    history: int


# ────────────────────────────────────────────────────────────────
# Core analytics function
# ────────────────────────────────────────────────────────────────
def get_restock_recommendations(window_days: int = 7) -> List[RestockRecommendation]:
    """
    Look back `window_days` and suggest restock quantities where
    `salesVelocity` (past N-days sales) exceeds current stock.
    """
    cutoff = datetime.utcnow() - timedelta(days=window_days)

    # Aggregate sales in the window
    sales_subq = (
        db.session.query(
            Sale.product_id.label("pid"),
            func.coalesce(func.sum(Sale.quantity), 0).label("salesVelocity")
        )
        .filter(Sale.timestamp >= cutoff)
        .group_by(Sale.product_id)
        .subquery()
    )

    # Expressions for readability
    sales_velocity = func.coalesce(sales_subq.c.salesVelocity, 0)
    current_stock  = Product.stock
    shortfall      = sales_velocity - current_stock

    recommended_expr = case(    # SQLAlchemy 2.x positional WHENs
        (shortfall > 0, shortfall),
        else_=0
    )

    rows = (
        db.session.query(
            Product.id.label("productId"),
            Product.name.label("productName"),
            current_stock.label("currentStock"),
            sales_velocity.label("salesVelocity"),
            recommended_expr.label("recommendedQuantity"),
            sales_velocity.label("history"),
        )
        .outerjoin(sales_subq, Product.id == sales_subq.c.pid)
        .order_by(recommended_expr.desc())
        .all()
    )

    # Convert RowMapping → dataclass
    return [RestockRecommendation(**row._mapping) for row in rows]
