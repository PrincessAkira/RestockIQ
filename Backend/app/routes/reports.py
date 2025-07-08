"""
📊 reports.py — Reporting & Export Module for ShelfIQ

This module handles:
- Exporting inventory and audit data as PDF, Excel, and ZIP
- Summarized system metrics
- Filtered product and audit log reports
- Separate reporting for active and deleted products

✨ Highlights:
- GET /products → All products with date filters
- GET /logs → Filterable system audit logs
- GET /pdf, /excel, /zip → Rich file exports
- ZIP contains: PDF + Excel (with active + deleted sheets)

Author: ShelfIQ Dev Team
"""

from flask import Blueprint, request, jsonify, send_file
from app.extensions import db
from app.models import Product, AuditLog
from datetime import datetime
import pandas as pd
from fpdf import FPDF
import io
import zipfile

bp = Blueprint("reports", __name__)

# 📦 List all products (optionally filtered by date_added)
@bp.route("/products", methods=["GET"])
def list_products():
    try:
        query = Product.query.filter(Product.date_deleted.is_(None))
        date_from = request.args.get("date_from")
        date_to = request.args.get("date_to")

        if date_from:
            query = query.filter(Product.date_added >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(Product.date_added <= datetime.fromisoformat(date_to))

        products = query.all()

        return jsonify([
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock,
                "threshold": p.threshold,
                "price": p.price,
                "is_blacklisted": p.is_blacklisted,
                "date_added": p.date_added.isoformat() if p.date_added else None,
                "date_blacklisted": p.date_blacklisted.isoformat() if p.date_blacklisted else None
            }
            for p in products
        ]), 200
    except Exception as e:
        return jsonify({"error": "Error filtering products", "details": str(e)}), 500

# 🧾 Filterable audit log export (based on timestamp)
@bp.route("/logs", methods=["GET"])
def system_logs():
    try:
        query = AuditLog.query.order_by(AuditLog.timestamp.desc())
        date_from = request.args.get("date_from")
        date_to = request.args.get("date_to")

        if date_from:
            query = query.filter(AuditLog.timestamp >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(AuditLog.timestamp <= datetime.fromisoformat(date_to))

        logs = query.all()
        return jsonify([
            {
                "user": log.user,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch logs", "details": str(e)}), 500

# 📈 System summary stats
@bp.route("/summary", methods=["GET"])
def report_summary():
    total_products = Product.query.count()
    blacklisted = Product.query.filter_by(is_blacklisted=True).count()
    deleted = Product.query.filter(Product.date_deleted.isnot(None)).count()

    return jsonify({
        "total_products": total_products,
        "blacklisted_products": blacklisted,
        "deleted_products": deleted
    }), 200

# 📝 Generate PDF of current products
@bp.route("/pdf", methods=["GET"])
def export_pdf():
    products = Product.query.filter(Product.date_deleted.is_(None)).all()
    if not products:
        return jsonify({"error": "No products found"}), 404

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="📦 ShelfIQ Stock Report", ln=1, align="C")
    pdf.ln(10)

    for p in products:
        line = f"{p.name} | Stock: {p.stock} | Threshold: {p.threshold} | Price: ${p.price:.2f}"
        pdf.cell(200, 10, txt=line, ln=1)

    output = io.BytesIO()
    pdf.output(output)
    output.seek(0)
    return send_file(output, download_name="stock_report.pdf", as_attachment=True)

# 📊 Excel export with active and deleted product sheets
@bp.route("/excel", methods=["GET"])
def export_excel():
    active = Product.query.filter(Product.date_deleted.is_(None)).all()
    deleted = Product.query.filter(Product.date_deleted.isnot(None)).all()

    if not active and not deleted:
        return jsonify({"error": "No products found"}), 404

    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        # Sheet 1: Active
        df_active = pd.DataFrame([{
            "Product Name": p.name,
            "Stock": p.stock,
            "Threshold": p.threshold,
            "Price": p.price,
            "Blacklisted": p.is_blacklisted,
            "Date Added": p.date_added,
            "Date Blacklisted": p.date_blacklisted
        } for p in active])
        df_active.to_excel(writer, index=False, sheet_name="Active Products")

        # Sheet 2: Deleted
        df_deleted = pd.DataFrame([{
            "Product Name": p.name,
            "Price": p.price,
            "Deleted On": p.date_deleted
        } for p in deleted])
        df_deleted.to_excel(writer, index=False, sheet_name="Deleted Products")

    output.seek(0)
    return send_file(output, download_name="stock_report.xlsx", as_attachment=True)

# 📦 ZIP export of both PDF and Excel files
@bp.route("/zip", methods=["GET"])
def export_zip():
    active = Product.query.filter(Product.date_deleted.is_(None)).all()
    deleted = Product.query.filter(Product.date_deleted.isnot(None)).all()

    if not active and not deleted:
        return jsonify({"error": "No products found"}), 404

    # Generate PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="📦 ShelfIQ Stock Report", ln=1, align="C")
    pdf.ln(10)
    for p in active:
        line = f"{p.name} | Stock: {p.stock} | Threshold: {p.threshold} | Price: ${p.price:.2f}"
        pdf.cell(200, 10, txt=line, ln=1)
    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)

    # Generate Excel
    excel_output = io.BytesIO()
    with pd.ExcelWriter(excel_output, engine="xlsxwriter") as writer:
        df_active = pd.DataFrame([{
            "Product Name": p.name,
            "Stock": p.stock,
            "Threshold": p.threshold,
            "Price": p.price,
            "Blacklisted": p.is_blacklisted,
            "Date Added": p.date_added,
            "Date Blacklisted": p.date_blacklisted
        } for p in active])
        df_deleted = pd.DataFrame([{
            "Product Name": p.name,
            "Price": p.price,
            "Deleted On": p.date_deleted
        } for p in deleted])

        df_active.to_excel(writer, index=False, sheet_name="Active Products")
        df_deleted.to_excel(writer, index=False, sheet_name="Deleted Products")
    excel_output.seek(0)

    # Package into ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zip_file:
        zip_file.writestr("stock_report.pdf", pdf_output.read())
        zip_file.writestr("stock_report.xlsx", excel_output.read())

    zip_buffer.seek(0)
    return send_file(zip_buffer, download_name="ShelfIQ_Report.zip", as_attachment=True)
