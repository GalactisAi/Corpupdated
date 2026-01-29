"""Simple script to create admin login credentials"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User
import bcrypt

print("Creating admin login credentials...")
print("=" * 50)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Admin credentials
    email = "admin@corpay.com"
    password = "Cadmin@1"
    
    # Hash the password
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    # Check if user exists
    admin_user = db.query(User).filter(User.email == email).first()
    
    if admin_user:
        # Update existing user
        admin_user.password_hash = password_hash
        admin_user.is_admin = 1
        admin_user.name = "Admin User"
        db.commit()
        print(f"✓ Updated admin user")
    else:
        # Create new user
        admin_user = User(
            email=email,
            name="Admin User",
            password_hash=password_hash,
            is_admin=1
        )
        db.add(admin_user)
        db.commit()
        print(f"✓ Created admin user")
    
    # Verify
    verify_user = db.query(User).filter(User.email == email).first()
    is_valid = bcrypt.checkpw(
        password.encode("utf-8"),
        verify_user.password_hash.encode("utf-8")
    )
    
    print("=" * 50)
    print("ADMIN LOGIN CREDENTIALS:")
    print(f"Email:    {email}")
    print(f"Password: {password}")
    print("=" * 50)
    print(f"✓ Password verification: {'PASSED' if is_valid else 'FAILED'}")
    print("✓ Admin user is ready!")
    print("\nYou can now login to the admin dashboard.")
    
except Exception as e:
    print(f"✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    sys.exit(1)
finally:
    db.close()
