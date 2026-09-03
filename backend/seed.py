import random
import uuid
from datetime import datetime, timedelta
from .database import SessionLocal, engine, Base
from .models import Payment, PaymentStatus, RecoveryStatus

# Indian Names
FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", 
               "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Diya", "Navya", "Myra", "Ira"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Kumar", "Das", "Kaur", "Gupta", "Nair", "Reddy", "Iyer", 
              "Jain", "Bose", "Verma", "Chauhan", "Yadav", "Menon", "Joshi", "Bhatt", "Chakraborty", "Desai"]

PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet"]
FAILURE_REASONS = [
    "insufficient_funds",
    "bank_declined",
    "network_error",
    "authentication_failed",
    "payment_method_expired",
    "timeout"
]

def generate_customer_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_payment_amount():
    # Mix of low, medium, high value transactions
    amount_tiers = [
        random.randint(50, 500),      # Small
        random.randint(500, 2500),    # Medium
        random.randint(2500, 15000)   # High
    ]
    return float(random.choice(amount_tiers))

def seed_data(num_records=10000):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check idempotency
    if db.query(Payment).count() >= num_records:
        print(f"Database already has {db.query(Payment).count()} records. Skipping seed.")
        db.close()
        return

    print("Generating synthetic payment data...")
    
    # Deterministic seeding
    random.seed(42)
    
    payments = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90) # Last 90 days

    for _ in range(num_records):
        payment_id = f"pay_{uuid.uuid4().hex[:16]}"
        customer_id = f"cust_{uuid.uuid4().hex[:8]}"
        created_at = start_date + timedelta(seconds=random.randint(0, int((end_date - start_date).total_seconds())))
        amount = generate_payment_amount()
        
        # Decide status (60% success, 40% failed)
        is_success = random.random() < 0.6
        
        if is_success:
            status = PaymentStatus.successful.value
            failure_reason = None
            recovery_status = RecoveryStatus.not_attempted.value
            retry_count = 0
            recovered_amount = 0.0
            last_action_at = created_at
        else:
            failure_reason = random.choice(FAILURE_REASONS)
            
            # Further split failed: pending/eligible vs recovered vs stopped
            recovery_outcome = random.random()
            if recovery_outcome < 0.2: # 20% recovered
                status = PaymentStatus.recovered.value
                recovery_status = RecoveryStatus.recovered.value
                retry_count = random.randint(1, 3)
                recovered_amount = amount
                last_action_at = created_at + timedelta(hours=random.randint(1, 48))
            elif recovery_outcome < 0.6: # 40% still eligible
                status = PaymentStatus.failed.value
                recovery_status = RecoveryStatus.eligible.value
                retry_count = random.randint(0, 1)
                recovered_amount = 0.0
                last_action_at = created_at + timedelta(hours=random.randint(0, 5))
            elif recovery_outcome < 0.8: # 20% attempted but pending
                status = PaymentStatus.failed.value
                recovery_status = RecoveryStatus.attempted.value
                retry_count = random.randint(1, 2)
                recovered_amount = 0.0
                last_action_at = created_at + timedelta(hours=random.randint(1, 24))
            else: # 20% stopped/abandoned
                status = PaymentStatus.failed.value
                recovery_status = RecoveryStatus.stopped.value
                retry_count = random.randint(1, 5)
                recovered_amount = 0.0
                last_action_at = created_at + timedelta(hours=random.randint(24, 72))
                
        payment = Payment(
            payment_id=payment_id,
            customer_id=customer_id,
            customer_name=generate_customer_name(),
            amount=amount,
            currency="INR",
            status=status,
            failure_reason=failure_reason,
            payment_method=random.choice(PAYMENT_METHODS),
            created_at=created_at,
            retry_count=retry_count,
            recovery_status=recovery_status,
            recovered_amount=recovered_amount,
            last_action_at=last_action_at
        )
        payments.append(payment)
        
        # Batch insert every 1000 records
        if len(payments) >= 1000:
            db.add_all(payments)
            db.commit()
            payments = []

    # Insert remaining
    if payments:
        db.add_all(payments)
        db.commit()

    print(f"Successfully seeded {num_records} payment records.")
    db.close()

if __name__ == "__main__":
    seed_data()
