"""add post_url and source to social_posts

Revision ID: 003
Revises: 002
Create Date: 2026-02-02 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add post_url column
    op.add_column('social_posts', sa.Column('post_url', sa.String(length=500), nullable=True))
    
    # Add source column with default 'api'
    op.add_column('social_posts', sa.Column('source', sa.String(length=50), nullable=True, server_default='api'))


def downgrade():
    op.drop_column('social_posts', 'source')
    op.drop_column('social_posts', 'post_url')
