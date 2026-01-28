from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os

# Use different engine config for SQLite vs PostgreSQL/Supabase
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False}  # SQLite specific
    )
else:
    # PostgreSQL/Supabase configuration
    # Supabase requires SSL connections - psycopg2 handles this automatically
    # For connection pooling with Supabase, use the pooler URL format
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=10,  # Number of connections to maintain
        max_overflow=20,  # Maximum overflow connections
        echo=False  # Set to True for SQL query logging (useful for debugging)
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

