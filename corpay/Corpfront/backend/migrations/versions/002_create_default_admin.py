"""create default admin user

Revision ID: 002
Revises: 001
Create Date: 2026-01-29 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import bcrypt

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Hash the default admin password: Cadmin@1
    password = "Cadmin@1"
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    # Escape single quotes in password_hash for SQL
    password_hash_escaped = password_hash.replace("'", "''")
    
    # Insert default admin user if it doesn't exist
    op.execute(f"""
        INSERT INTO users (email, name, password_hash, is_admin, created_at)
        VALUES ('admin@corpay.com', 'Admin User', '{password_hash_escaped}', 1, NOW())
        ON CONFLICT (email) DO NOTHING
    """)


def downgrade() -> None:
    # Remove default admin user
    op.execute("DELETE FROM users WHERE email = 'admin@corpay.com'")
