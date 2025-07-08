#!/usr/bin/env python
"""
run.py – Development / Gunicorn entry-point with rich route introspection
------------------------------------------------------------------------
✓ Console + rotating file logging
✓ Lists every blueprint
✓ Prints every route (methods · URL · endpoint · blueprint)
✓ Probes simple GET routes and shows PASS / FAIL / SKIP
"""

from __future__ import annotations

import logging
import os
import sys
import urllib.parse
from logging.handlers import RotatingFileHandler
from typing import List, Tuple

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from werkzeug.routing import Rule

from app import create_app

# ──────────────────────────── 1. App & env ────────────────────────────
load_dotenv()
app: Flask = create_app()

# ───────────────────── 2. Configure structured logging ────────────────
def configure_logging() -> None:
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)

    fmt = "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"
    formatter = logging.Formatter(fmt, datefmt)

    # -> Console (use system codec, avoid emojis)
    console = logging.StreamHandler(stream=sys.stdout)
    console.setFormatter(formatter)
    console.setLevel(logging.INFO)

    # -> All logs, UTF-8
    file_all = RotatingFileHandler(
        os.path.join(log_dir, "shelfiq.log"),
        maxBytes=2 * 1024**2,
        backupCount=5,
        encoding="utf-8",
    )
    file_all.setFormatter(formatter)

    # -> Errors only, UTF-8
    file_err = RotatingFileHandler(
        os.path.join(log_dir, "error.log"),
        maxBytes=1 * 1024**2,
        backupCount=3,
        encoding="utf-8",
    )
    file_err.setLevel(logging.ERROR)
    file_err.setFormatter(formatter)

    app.logger.setLevel(logging.DEBUG)
    for h in (console, file_all, file_err):
        app.logger.addHandler(h)

    app.logger.info("Logging configured")

# ───────────────────────── 3. Route introspection ─────────────────────
def _probe_rule(rule: Rule) -> Tuple[str, str]:
    """
    Probe a route if it is GET and has no parameters.
    Returns ('PASS' | 'FAIL' | 'SKIP', detail)
    """
    if "GET" not in rule.methods or "<" in rule.rule:
        return "—", ""
    try:
        with app.test_client() as client:
            resp = client.get(rule.rule)
            return ("PASS" if resp.ok else "FAIL", str(resp.status_code))
    except Exception as exc:  # pragma: no cover
        return "SKIP", exc.__class__.__name__

def list_blueprints() -> None:
    print("\n📚  Blueprints")
    print("-" * 80)
    for name, bp in app.blueprints.items():
        print(f"• {name:20} → {bp.import_name}")
    print("-" * 80)

def list_routes() -> None:
    print("\n🌐  Routes")
    print("-" * 120)
    print(f"{'METHODS':10} {'URL':40} {'→ ENDPOINT':30} {'BLUEPRINT':15} TEST")
    print("-" * 120)

    rules: List[Rule] = sorted(app.url_map.iter_rules(), key=lambda r: r.rule)
    for r in rules:
        methods = ",".join(sorted(r.methods - {"HEAD", "OPTIONS"}))
        url = urllib.parse.unquote(str(r))
        bp = r.endpoint.split(".")[0] if "." in r.endpoint else "-"
        result, detail = _probe_rule(r)
        print(f"{methods:10} {url:40} {r.endpoint:30} {bp:15} {result} {detail}")
    print("-" * 120 + "\n")

# ─────────────────────── 4. Hooks & health check ──────────────────────
@app.before_request
def log_req():
    app.logger.info(f"[REQ] {request.method} {request.path} ({request.remote_addr})")

@app.errorhandler(Exception)
def handle_exc(e: Exception):
    app.logger.error("Unhandled exception", exc_info=e)
    return (
        jsonify({"error": "Internal server error", "message": str(e), "type": e.__class__.__name__}),
        500,
    )

@app.route("/health-check")
def health():
    return jsonify({"status": "healthy"}), 200

# ─────────────────────────────── 5. Run ───────────────────────────────
if __name__ == "__main__":
    configure_logging()
    list_blueprints()
    list_routes()

    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    host = "0.0.0.0"
    port = 5000
    app.logger.info(f"Starting Flask on http://{host}:{port}")
    try:
        app.run(host=host, port=port, debug=debug, use_reloader=False)
    except Exception as exc:
        app.logger.critical("Server failed to start", exc_info=exc)

# Production example:
#   gunicorn run:app --bind 0.0.0.0:5000 --workers 3
