"""Create admin user - handles database setup"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
import bcrypt

# Database connection
DATABASE_URL = "postgresql://postgres.lrhcxoquqjqqaeqvlght:galactis%40123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
engine = create_engine(DATABASE_URL)

print("Setting up admin login credentials...")
print("=" * 50)

with engine.connect() as conn:
    # Start transaction
    trans = conn.begin()
    try:
        # Check if password_hash column exists, if not add it
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='password_hash'
        """))
        
        if result.fetchone() is None:
            print("Adding password_hash column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
            print("[OK] Column added")
        
        # Check if is_admin column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_admin'
        """))
        
        if result.fetchone() is None:
            print("Adding is_admin column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0"))
            print("[OK] Column added")
        
        # Hash password
        password = "Cadmin@1"
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        # Check if admin user exists
        result = conn.execute(text("""
            SELECT id FROM users WHERE email = :email
        """), {"email": "admin@corpay.com"})
        
        user = result.fetchone()
        
        if user:
            # Update existing user
            conn.execute(text("""
                UPDATE users 
                SET password_hash = :pwd_hash, is_admin = 1, name = :name
                WHERE email = :email
            """), {
                "pwd_hash": password_hash,
                "email": "admin@corpay.com",
                "name": "Admin User"
            })
            print("[OK] Updated admin user")
        else:
            # Create new user
            conn.execute(text("""
                INSERT INTO users (email, name, password_hash, is_admin, created_at)
                VALUES (:email, :name, :pwd_hash, 1, NOW())
            """), {
                "email": "admin@corpay.com",
                "name": "Admin User",
                "pwd_hash": password_hash
            })
            print("[OK] Created admin user")
        
        trans.commit()
        
        print("=" * 50)
        print("ADMIN LOGIN CREDENTIALS:")
        print("Email:    admin@corpay.com")
        print("Password: Cadmin@1")
        print("=" * 50)
        print("SUCCESS! Admin credentials are ready.")
        print("You can now login to the admin dashboard.")
        
    except Exception as e:
        trans.rollback()
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
