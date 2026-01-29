import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Setting up admin user...")

try:
    from app.database import SessionLocal, Base, engine
    from app.models.user import User
    import bcrypt
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created/verified")
    
    db = SessionLocal()
    
    # Password: Cadmin@1
    password = "Cadmin@1"
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    print(f"✓ Password hashed")
    
    # Delete existing admin user if exists
    db.query(User).filter(User.email == "admin@corpay.com").delete()
    print("✓ Cleared existing admin user")
    
    # Create new admin user
    admin = User(
        email="admin@corpay.com",
        name="Admin User",
        password_hash=password_hash,
        is_admin=1
    )
    db.add(admin)
    db.commit()
    print("✓ Admin user created")
    
    # Verify
    test = db.query(User).filter(User.email == "admin@corpay.com").first()
    if test:
        valid = bcrypt.checkpw(password.encode("utf-8"), test.password_hash.encode("utf-8"))
        print(f"✓ Verification: {'PASSED' if valid else 'FAILED'}")
        print(f"\n✓✓✓ SUCCESS ✓✓✓")
        print(f"Email: admin@corpay.com")
        print(f"Password: Cadmin@1")
    else:
        print("✗ FAILED - User not found after creation")
    
    db.close()
    
except Exception as e:
    print(f"✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
