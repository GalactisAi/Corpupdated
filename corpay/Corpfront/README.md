# Corpay Dashboard System

Complete dashboard system with backend API, admin interface, and frontend dashboard.

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   ├── migrations/      # Database migrations
│   └── requirements.txt
├── admin-dashboard/     # React admin UI
│   └── src/
└── src/                 # Main dashboard frontend
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file from .env.example
# Configure database and OAuth credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at http://localhost:8000
API Documentation: http://localhost:8000/docs

### 2. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
npm run dev
```

Admin dashboard will run on http://localhost:5174

### 3. Main Dashboard Setup

```bash
# From root directory
npm install
npm run dev
```

Main dashboard will run on http://localhost:3000

## Features

### Backend API
- FastAPI REST API
- PostgreSQL database
- OAuth2 authentication (Google/Microsoft)
- Excel file parsing and upload
- External API integrations (Share price, LinkedIn posts, PowerBI)
- Caching and error handling

### Admin Dashboard
- OAuth login
- Revenue management
- Posts management
- Employee milestones
- Payments & System performance
- API configuration

### Main Dashboard
- Real-time data display
- Auto-refreshing content
- Responsive design
- Charts and visualizations

## Data Sources

1. **Total Revenue** - Excel file upload
2. **Share Price** - External API (with mock fallback)
3. **Revenue Proportions** - Excel/PowerBI
4. **Revenue Trends** - Excel/PowerBI
5. **Cross-Border Posts** - External API
6. **Payments Processed** - Excel file upload
7. **Employee Milestones** - Excel upload + photo management
8. **System Performance** - Excel file upload
9. **Corpay Posts** - External API

## Configuration

### Backend Environment Variables

See `backend/.env.example` for all required variables:
- Database connection
- OAuth credentials
- External API keys
- File storage paths

### Frontend Environment Variables

Create `.env` in root:
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Public Endpoints
- `GET /api/dashboard/revenue` - Get revenue data
- `GET /api/dashboard/share-price` - Get share price
- `GET /api/dashboard/revenue-trends` - Get trends
- `GET /api/dashboard/revenue-proportions` - Get proportions
- `GET /api/dashboard/posts` - Get posts
- `GET /api/dashboard/cross-border-posts` - Get cross-border posts
- `GET /api/dashboard/employees` - Get employee milestones
- `GET /api/dashboard/payments` - Get payment data
- `GET /api/dashboard/system-performance` - Get system metrics

### Admin Endpoints (Protected)
- `POST /api/admin/revenue/upload` - Upload revenue Excel
- `POST /api/admin/posts` - Create post
- `POST /api/admin/employees/upload` - Upload employee data
- `POST /api/admin/payments/upload` - Upload payments Excel
- `POST /api/admin/system/upload` - Upload system performance Excel
- `GET /api/admin/config` - Get API config
- `PUT /api/admin/config` - Update API config

## Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

Backend API includes Swagger documentation at `/docs` for testing endpoints.

## Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy backend API
5. Deploy admin dashboard
6. Deploy main dashboard
7. Configure external API credentials

## Support

For issues or questions, refer to the API documentation at `/docs` when the backend is running.
