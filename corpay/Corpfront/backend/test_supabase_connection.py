#!/usr/bin/env python3
"""Test Supabase database connection"""
import sys
import os

try:
    from app.config import settings
    from app.database import engine
    
    print("=" * 50)
    print("Testing Supabase Connection")
    print("=" * 50)
    print(f"\nDatabase URL: {settings.database_url[:70]}...")
    print(f"Supabase URL: {settings.supabase_url}")
    print(f"Storage Bucket: {settings.supabase_storage_bucket}")
    
    # Test connection
    print("\nAttempting to connect to Supabase...")
    conn = engine.connect()
    print("✓ Successfully connected to Supabase PostgreSQL!")
    
    # Test a simple query
    result = conn.execute("SELECT version();")
    version = result.fetchone()[0]
    print(f"✓ Database version: {version[:50]}...")
    
    conn.close()
    print("\n" + "=" * 50)
    print("Connection test PASSED!")
    print("=" * 50)
    sys.exit(0)
    
except Exception as e:
    print(f"\n✗ Connection test FAILED!")
    print(f"Error: {str(e)}")
    print("\n" + "=" * 50)
    sys.exit(1)
