from datetime import datetime
from .extensions import db

class User(db.Model):
    """Represents an admin or cashier user in the system."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'admin' or 'cashier'

class Product(db.Model):
    """Represents a product available in the store."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    threshold = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    category = db.Column(db.String(100), nullable=True)  # e.g., Beverages, Dairy

    last_restocked = db.Column(db.DateTime, default=datetime.utcnow)
    reorder_lead_time = db.Column(db.Integer, default=3)  # Days to deliver
    safety_stock = db.Column(db.Integer, default=10)

    is_blacklisted = db.Column(db.Boolean, default=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    date_blacklisted = db.Column(db.DateTime, nullable=True)
    date_deleted = db.Column(db.DateTime, nullable=True)

    sales = db.relationship('Sale', backref='product', lazy=True)

class Sale(db.Model):
    """Represents a sales transaction of a product."""
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    """Tracks important system actions by users."""
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(120), nullable=False)
    details = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
