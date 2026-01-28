"""add password_hash remove oauth fields

Revision ID: 001
Revises: 
Create Date: 2026-01-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add password_hash column
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=True))
    
    # For existing users without passwords, set a default (they'll need to reset)
    # In production, you might want to handle this differently
    op.execute("UPDATE users SET password_hash = '' WHERE password_hash IS NULL")
    
    # Make password_hash NOT NULL
    op.alter_column('users', 'password_hash', nullable=False)
    
    # Remove OAuth-related columns
    op.drop_column('users', 'provider')
    op.drop_column('users', 'provider_id')


def downgrade() -> None:
    # Add back OAuth columns
    op.add_column('users', sa.Column('provider', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('provider_id', sa.String(255), nullable=True))
    
    # Remove password_hash column
    op.drop_column('users', 'password_hash')
