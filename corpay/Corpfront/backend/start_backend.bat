@echo off
cd /d "%~dp0"
echo Setting up admin user...
python ensure_admin.py
echo.
echo Starting backend server on http://localhost:8000
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
