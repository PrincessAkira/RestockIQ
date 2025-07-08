from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Product
from datetime import datetime

bp = Blueprint("products", __name__)

# ✅ OPTIONS handler for CORS preflight (temporary fix)
@bp.route("/", methods=["OPTIONS"])
def handle_options():
    return '', 204

# ✅ Get all products
@bp.route("/", methods=["GET"])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock,
                "threshold": p.threshold,
                "price": p.price,
                "is_blacklisted": p.is_blacklisted,
                "date_added": p.date_added.isoformat() if p.date_added else None,
                "date_blacklisted": p.date_blacklisted.isoformat() if p.date_blacklisted else None,
                "date_deleted": p.date_deleted.isoformat() if p.date_deleted else None
            }
            for p in products
        ]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch products", "details": str(e)}), 500

# ✅ Create a new product (single or bulk)
@bp.route("/", methods=["POST"])
def create_product():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Normalize input to a list
    if isinstance(data, dict):
        data = [data]

    required_fields = {"name", "stock", "threshold", "price"}
    created_products = []

    try:
        for item in data:
            if not required_fields.issubset(item):
                return jsonify({"error": "Missing required fields in one or more products"}), 400

            product = Product(
                name=item["name"],
                stock=int(item["stock"]),
                threshold=int(item["threshold"]),
                price=float(item["price"]),
                is_blacklisted=False,
                date_added=datetime.utcnow()
            )
            db.session.add(product)
            created_products.append(product)

        db.session.commit()

        return jsonify({
            "message": f"{len(created_products)} product(s) created successfully",
            "ids": [p.id for p in created_products]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Product creation failed", "details": str(e)}), 500

# ✅ Update a product
@bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)

    try:
        if "name" in data:
            product.name = data["name"]
        if "stock" in data:
            product.stock = int(data["stock"])
        if "threshold" in data:
            product.threshold = int(data["threshold"])
        if "price" in data:
            product.price = float(data["price"])

        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Product update failed", "details": str(e)}), 500

# ✅ Soft-delete a product (sets date_deleted)
@bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    try:
        product.date_deleted = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": f"Product '{product.name}' marked as deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Soft delete failed", "details": str(e)}), 500

# ✅ Blacklist a product (sets is_blacklisted and date_blacklisted)
@bp.route("/<int:product_id>/blacklist", methods=["PATCH"])
def blacklist_product(product_id):
    product = Product.query.get_or_404(product_id)
    try:
        product.is_blacklisted = True
        product.date_blacklisted = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": f"Product '{product.name}' has been blacklisted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Blacklist failed", "details": str(e)}), 500
