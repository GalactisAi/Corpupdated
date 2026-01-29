#!/usr/bin/env python3
"""Create default admin user"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import SessionLocal, engine, Base
    from app.models.user import User
    import bcrypt
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@corpay.com").first()
        
        if admin_user:
            print("Admin user already exists!")
            print(f"Email: {admin_user.email}")
            print(f"Name: {admin_user.name}")
            print(f"Is Admin: {admin_user.is_admin}")
            
            # Update password to ensure it's correct
            password = "Cadmin@1"
            password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            admin_user.password_hash = password_hash
            admin_user.is_admin = 1
            db.commit()
            print("Password updated to: Cadmin@1")
        else:
            print("Creating admin user...")
            # Create admin user
            password = "Cadmin@1"
            password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            admin_user = User(
                email="admin@corpay.com",
                name="Admin User",
                password_hash=password_hash,
                is_admin=1
            )
            db.add(admin_user)
            db.commit()
            print("✓ Admin user created successfully!")
            print("Email: admin@corpay.com")
            print("Password: Cadmin@1")
            
        # Verify password
        test_password = "Cadmin@1"
        is_valid = bcrypt.checkpw(
            test_password.encode("utf-8"),
            admin_user.password_hash.encode("utf-8")
        )
        print(f"Password verification: {'✓ PASSED' if is_valid else '✗ FAILED'}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()
        
except Exception as e:
    print(f"Failed to import modules: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
