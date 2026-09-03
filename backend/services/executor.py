from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models import Payment, PaymentStatus, RecoveryStatus, RecoveryAudit
from .recovery_ai import get_recovery_recommendation

VALID_ACTIONS = {"retry_payment", "suggest_alternate_method", "send_reminder", "stop_recovery"}
COSTS = {
    "retry_payment": 2.0,
    "suggest_alternate_method": 0.5,
    "send_reminder": 1.0,
    "stop_recovery": 0.0
}

def execute_recovery_action(db: Session, payment_id: str, action: str, max_attempts: int = 3) -> dict:
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    
    if not payment:
        return {"payment_id": payment_id, "status": "FAILED", "message": "Payment not found", "recovered_amount": 0.0, "intervention_cost": 0.0, "action": action}
        
    # Get the AI recommendation to use in the audit log
    rec = get_recovery_recommendation(payment, max_attempts)
    recommended_action = rec["recommended_action"]
    
    audit_record = RecoveryAudit(
        payment_id=payment.payment_id,
        customer_id=payment.customer_id,
        amount=payment.amount,
        recommended_action=recommended_action,
        executed_action=action,
        intervention_cost=0.0,
        recovered_amount=0.0
    )
    
    # 1. Valid Actions
    if action not in VALID_ACTIONS:
        audit_record.execution_status = "BLOCKED"
        audit_record.reason = f"Unknown action: {action}"
        db.add(audit_record)
        db.commit()
        return {"payment_id": payment_id, "status": "BLOCKED", "message": audit_record.reason, "recovered_amount": 0.0, "intervention_cost": 0.0, "action": action}

    # 2. Duplicate Prevention
    if payment.status == PaymentStatus.recovered.value or payment.recovery_status == RecoveryStatus.recovered.value:
        audit_record.execution_status = "BLOCKED"
        audit_record.reason = "Payment already recovered"
        db.add(audit_record)
        db.commit()
        return {"payment_id": payment_id, "status": "BLOCKED", "message": audit_record.reason, "recovered_amount": 0.0, "intervention_cost": 0.0, "action": action}
        
    # 3. Stop action
    if action == "stop_recovery":
        payment.recovery_status = RecoveryStatus.stopped.value
        audit_record.execution_status = "STOPPED"
        audit_record.reason = "Recovery intentionally stopped"
        db.add(audit_record)
        db.commit()
        return {"payment_id": payment_id, "status": "STOPPED", "message": audit_record.reason, "recovered_amount": 0.0, "intervention_cost": 0.0, "action": action}

    # 4. Max Retries Check
    if action == "retry_payment" and payment.retry_count >= max_attempts:
        audit_record.execution_status = "BLOCKED"
        audit_record.reason = f"Maximum retry attempts reached"
        db.add(audit_record)
        db.commit()
        return {"payment_id": payment_id, "status": "BLOCKED", "message": audit_record.reason, "recovered_amount": 0.0, "intervention_cost": 0.0, "action": action}
        
    # 5. Sandbox Execution
    cost = COSTS.get(action, 0.0)
    audit_record.intervention_cost = cost
    
    # Deterministic simulation: based on probability >= 0.4
    success_probability = rec["estimated_recovery_probability"]
    is_success = success_probability >= 0.4

    # Update payment state
    if action == "retry_payment":
        payment.retry_count += 1

    payment.recovery_status = RecoveryStatus.attempted.value
    payment.last_action_at = datetime.now(timezone.utc)
    
    if is_success:
        payment.status = PaymentStatus.recovered.value
        payment.recovery_status = RecoveryStatus.recovered.value
        payment.recovered_amount = payment.amount
        audit_record.execution_status = "SUCCESS"
        audit_record.recovered_amount = payment.amount
        audit_record.reason = f"Simulated {action} successful"
        msg = f"Recovered ₹{payment.amount}"
    else:
        audit_record.execution_status = "FAILED"
        audit_record.reason = f"Simulated {action} unsuccessful"
        msg = "Recovery attempt unsuccessful"
        
    db.add(audit_record)
    db.commit()
    
    return {
        "payment_id": payment.payment_id,
        "status": audit_record.execution_status,
        "message": msg,
        "recovered_amount": audit_record.recovered_amount,
        "intervention_cost": cost,
        "action": action
    }
