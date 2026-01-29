from app.database import SessionLocal
from app.models.payments import PaymentData
from datetime import date

db = SessionLocal()
try:
    today = date.today()
    print(f"Today's date: {today}")
    
    payment = db.query(PaymentData).filter(PaymentData.date == today).first()
    
    if payment:
        print(f"Payment found: Amount={payment.amount_processed}, Transactions={payment.transaction_count}")
    else:
        print("No payment found for today")
        
    # List all payments
    all_payments = db.query(PaymentData).order_by(PaymentData.date.desc()).limit(5).all()
    print(f"\nLast 5 payments:")
    for p in all_payments:
        print(f"  Date: {p.date}, Amount: {p.amount_processed}, Transactions: {p.transaction_count}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
