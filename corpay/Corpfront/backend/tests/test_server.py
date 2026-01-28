import sys
import traceback

try:
    print("Testing backend startup...")
    print("Step 1: Importing app.main...")
    from app.main import app
    print("✅ App imported successfully!")
    
    print("\nStep 2: Testing database connection...")
    from app.database import engine
    print("✅ Database engine created!")
    
    print("\nStep 3: Testing uvicorn import...")
    import uvicorn
    print("✅ Uvicorn imported successfully!")
    
    print("\n✅ All checks passed! Starting server...")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
    print("\nFull traceback:")
    traceback.print_exc()
    sys.exit(1)
