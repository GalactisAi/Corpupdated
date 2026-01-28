#!/usr/bin/env python3
"""
Setup script to configure Supabase for the Corpay Dashboard backend.
This script helps you set up your .env file with Supabase configuration.
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file from user input"""
    env_path = Path(__file__).parent / ".env"
    
    if env_path.exists():
        response = input(".env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Keeping existing .env file.")
            return
    
    print("\n=== Supabase Database Setup ===\n")
    print("Get your connection string from: https://app.supabase.com/project/YOUR_PROJECT/settings/database")
    print("Select 'Connection string' -> 'URI' option\n")
    
    database_url = input("Enter your Supabase database URL: ").strip()
    if not database_url:
        print("Error: Database URL is required!")
        return
    
    jwt_secret = input("Enter JWT secret key (or press Enter for default): ").strip()
    if not jwt_secret:
        jwt_secret = "your-secret-key-here-change-in-production-use-a-strong-random-key"
    
    print("\n=== Optional Configuration ===")
    google_client_id = input("Google OAuth Client ID (optional): ").strip()
    google_client_secret = input("Google OAuth Client Secret (optional): ").strip()
    microsoft_client_id = input("Microsoft OAuth Client ID (optional): ").strip()
    microsoft_client_secret = input("Microsoft OAuth Client Secret (optional): ").strip()
    
    # Create .env file content
    env_content = f"""# Supabase Database Configuration
DATABASE_URL={database_url}

# JWT Configuration
JWT_SECRET_KEY={jwt_secret}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OAuth Configuration
GOOGLE_CLIENT_ID={google_client_id}
GOOGLE_CLIENT_SECRET={google_client_secret}
MICROSOFT_CLIENT_ID={microsoft_client_id}
MICROSOFT_CLIENT_SECRET={microsoft_client_secret}
OAUTH_REDIRECT_URI=http://localhost:8000/api/admin/auth/callback

# CORS Origins
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:5174","http://localhost:5176"]

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

# External APIs (optional)
SHARE_PRICE_API_URL=
SHARE_PRICE_API_KEY=
LINKEDIN_API_URL=
LINKEDIN_API_KEY=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_COMPANY_URL=https://www.linkedin.com/company/galactisaitech/posts/?feedView=all
LINKEDIN_COMPANY_URN=
LINKEDIN_VANITY_NAME=galactisaitech

# Power BI Configuration (optional)
POWERBI_CLIENT_ID=
POWERBI_CLIENT_SECRET=
POWERBI_TENANT_ID=
POWERBI_WORKSPACE_ID=

# Environment
ENVIRONMENT=production
"""
    
    # Write .env file
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"\n✓ .env file created at {env_path}")
    print("\nNext steps:")
    print("1. Run database migrations: alembic upgrade head")
    print("2. Start the server: python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")
    print("\nSee SUPABASE_SETUP.md for detailed instructions.")

if __name__ == "__main__":
    try:
        create_env_file()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
