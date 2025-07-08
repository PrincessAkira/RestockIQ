# app/__init__.py

from flask import Flask, jsonify
from flask_session import Session
from flask_cors import CORS
from .extensions import db, migrate

# === Import all route blueprints ===
from .routes import (
    auth,
    products,
    stock,
    sales,
    alerts,
    audit_logs,
    analytics,
    reports,
    smartshelf_tracker  # ✅ SmartShelf routes
)

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # --- Initialize Extensions ---
    db.init_app(app)
    migrate.init_app(app, db)

    # --- Session Configuration ---
    app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.config['SESSION_SQLALCHEMY'] = db
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # ✅ Set True in production

    Session(app)

    # --- CORS Setup ---
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    # --- Register Blueprints ---
    app.register_blueprint(auth.bp, url_prefix="/api/auth")
    app.register_blueprint(products.bp, url_prefix="/api/products")
    app.register_blueprint(stock.bp, url_prefix="/api/stock")
    app.register_blueprint(sales.bp, url_prefix="/api/sales")
    app.register_blueprint(alerts.bp, url_prefix="/api/alerts")
    app.register_blueprint(audit_logs.bp, url_prefix="/api/audit-logs")
    app.register_blueprint(analytics.analytics_bp)  # already includes its own prefix
    app.register_blueprint(reports.bp, url_prefix="/api/reports")
    app.register_blueprint(smartshelf_tracker.bp)  # ✅ /api/smartshelf prefix already declared inside blueprint

    # --- Health Check ---
    @app.route("/", methods=["GET"])
    def health_check():
        return jsonify({"message": "✅ ShelfIQ Flask API is running!"}), 200

    return app
