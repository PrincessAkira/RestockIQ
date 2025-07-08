from flask import Blueprint, jsonify
from app.models import AuditLog

bp = Blueprint("audit_logs", __name__)

@bp.route("/", methods=["GET"])
def get_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    return jsonify([
        {
            "user": log.user,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ])

