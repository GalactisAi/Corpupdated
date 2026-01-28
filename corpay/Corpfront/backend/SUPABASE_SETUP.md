# Supabase Setup Guide

This guide will help you set up Supabase as the permanent database backend for the Corpay Admin Dashboard.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Corpay Dashboard (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with Free tier for development

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** from the dropdown
4. Copy the connection string. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

## Step 3: Configure Your Backend

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and update the `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://postgres:your-actual-password@db.your-project-ref.supabase.co:5432/postgres
   ```

3. Update other configuration values as needed (JWT secret, OAuth credentials, etc.)

## Step 4: Run Database Migrations

1. Make sure you're in the backend directory:
   ```bash
   cd Corpfront/backend
   ```

2. Run Alembic migrations to create all tables in Supabase:
   ```bash
   alembic upgrade head
   ```

   This will create all the necessary tables in your Supabase database.

## Step 5: Verify Connection

1. Start your backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. Check the server logs - you should see no database connection errors

3. Visit the API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

4. Test an endpoint to verify data is being stored in Supabase

## Step 6: View Your Data in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** to see your tables
3. You can view, edit, and manage your data directly in Supabase

## Connection Pooling (Optional - Recommended for Production)

For better performance and connection management, use Supabase's connection pooler:

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **Connection pooling** section
3. Copy the **Connection string** from the **Session mode** or **Transaction mode**
4. Update your `.env` file with the pooled connection string:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Security Best Practices

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Use strong passwords** for your database
3. **Rotate your JWT secret key** regularly in production
4. **Enable Row Level Security (RLS)** in Supabase if needed for multi-tenant scenarios
5. **Use environment variables** in production deployments

## Troubleshooting

### Connection Refused
- Verify your connection string is correct
- Check that your IP is allowed (Supabase allows all IPs by default on free tier)
- Ensure the password doesn't contain special characters that need URL encoding

### Migration Errors
- Make sure you're using the correct database URL
- Check that the database user has proper permissions
- Review the Alembic migration logs for specific errors

### SSL Connection Issues
- Supabase requires SSL connections. The `psycopg2-binary` package handles this automatically
- If you see SSL errors, ensure your connection string includes SSL parameters

## Next Steps

- Set up automated backups in Supabase dashboard
- Configure database backups schedule
- Set up monitoring and alerts
- Consider enabling Supabase Auth for additional security features
