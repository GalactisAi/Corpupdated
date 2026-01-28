# Quick Start: Supabase Setup

## Step 1: Create Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project name: **Corpay Dashboard**
4. Set a strong database password (save it!)
5. Choose your region
6. Click "Create new project"

## Step 2: Get Connection String
1. In your project, go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** format
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

## Step 3: Configure Backend
Run the setup script:
```bash
cd Corpfront/backend
python setup_supabase.py
```

Or manually create `.env` file:
```env
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
JWT_SECRET_KEY=your-strong-secret-key-here
```

## Step 4: Run Migrations
```bash
alembic upgrade head
```

## Step 5: Start Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Step 6: Verify
- Visit: http://localhost:8000/docs
- Check Supabase dashboard → Table Editor to see your tables
- Test API endpoints

## Done! 🎉
Your backend is now using Supabase as the permanent database.
