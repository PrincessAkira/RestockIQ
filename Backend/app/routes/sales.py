# app/routes/sales.py

"""
📦 Sales API - Process customer purchases and manage stock.

✅ Features:
- Handle a cart with multiple products
- Deduct sold quantities from product stock
- Save sales transactions into database
- Auto-add timestamp
- Return 201 Created on success
- Protect against invalid sales (stock running negative)
- Ready for CORS & POS systems
"""

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Sale, Product
from datetime import datetime

bp = Blueprint("sales", __name__)

# ✅ POST /api/sales
@bp.route("/", methods=["POST"])
def process_sale():
    """
    Processes a sale:
    - Receives cart JSON: [{id, quantity, price}, {...}]
    - Updates product stock
    - Creates sale records
    - Returns success message
    """

    try:
        data = request.get_json()
        cart = data.get("cart", [])

        if not cart:
            return jsonify({"error": "Cart cannot be empty"}), 400

        for item in cart:
            product = Product.query.get(item.get("id"))
            if not product:
                return jsonify({"error": f"Product ID {item.get('id')} not found"}), 404

            quantity = int(item.get("quantity", 0))

            if quantity <= 0:
                return jsonify({"error": f"Invalid quantity for {product.name}"}), 400

            if product.stock < quantity:
                return jsonify({"error": f"Not enough stock for {product.name}"}), 400

            # Update stock
            product.stock -= quantity

            # Record sale
            sale = Sale(
                product_id=product.id,
                quantity=quantity,
                price=float(item.get("price", 0)),
                timestamp=datetime.utcnow()
            )
            db.session.add(sale)

        db.session.commit()

        return jsonify({"message": "✅ Sale processed successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Sale failed: {str(e)}"}), 500
