from functools import wraps
from flask import request, jsonify
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret")

def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = None
            if "Authorization" in request.headers:
                token = request.headers["Authorization"].split(" ")[1]

            if not token:
                return jsonify({"error": "Missing token"}), 401

            try:
                decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                if decoded["role"] != role:
                    return jsonify({"error": "Unauthorized role"}), 403
            except Exception as e:
                return jsonify({"error": "Token error", "message": str(e)}), 401

            return f(*args, **kwargs)
        return wrapper
    return decorator

