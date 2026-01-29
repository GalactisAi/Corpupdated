#!/usr/bin/env python3
"""Start the backend server with admin user setup"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# First, ensure admin user exists
print("Setting up admin user...")
try:
    from app.database import SessionLocal, engine, Base
    from app.models.user import User
    import bcrypt
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        password = "Cadmin@1"
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        admin_user = db.query(User).filter(User.email == "admin@corpay.com").first()
        
        if admin_user:
            admin_user.password_hash = password_hash
            admin_user.is_admin = 1
            print("✓ Admin user password updated")
        else:
            admin_user = User(
                email="admin@corpay.com",
                name="Admin User",
                password_hash=password_hash,
                is_admin=1
            )
            db.add(admin_user)
            print("✓ Admin user created")
        
        db.commit()
        print("✓ Login credentials: admin@corpay.com / Cadmin@1")
    except Exception as e:
        print(f"✗ Error setting up admin: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Now start the server
print("\nStarting backend server on http://0.0.0.0:8000")
print("Press Ctrl+C to stop\n")

import uvicorn
uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
