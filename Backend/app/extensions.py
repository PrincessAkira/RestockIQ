# app/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Database setup
db = SQLAlchemy()
migrate = Migrate()

# Initialize CORS with full config for local dev and auth-friendly headers
def init_cors(app):
    CORS(
        app,
        supports_credentials=True,  # Enable cookies/auth headers
        resources={
            r"/api/*": {
                "origins": "http://localhost:3000",  # Allow frontend origin
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        }
    )
