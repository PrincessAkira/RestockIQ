# create_admin.py

from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    existing_admin = User.query.filter_by(email="admin@example.com").first()
    if existing_admin:
        print("⚠️ Admin already exists!")
    else:
        admin = User(
            name="Super Admin",
            email="admin@example.com",
            password=generate_password_hash("YourStrongPassword123"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created successfully!")
