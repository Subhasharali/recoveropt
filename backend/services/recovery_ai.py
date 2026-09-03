import os
import json
from openai import OpenAI
from ..models import Payment, PaymentStatus

client = None
if os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_deterministic_recommendation(payment: Payment, max_attempts: int = 3) -> dict:
    if payment.status == PaymentStatus.recovered.value:
        action = "stop_recovery"
        reason = "Payment already recovered."
        prob = 0.0
    elif payment.retry_count >= max_attempts:
        action = "stop_recovery"
        reason = f"Maximum retry count ({max_attempts}) reached."
        prob = 0.0
    elif payment.amount < 100:
        action = "stop_recovery"
        reason = "Amount too low to justify recovery efforts."
        prob = 0.05
    elif payment.failure_reason in ["network_error", "timeout"]:
        action = "retry_payment"
        reason = "Transient error, likely to succeed on retry."
        prob = 0.8
    elif payment.failure_reason == "insufficient_funds":
        action = "retry_payment"
        reason = "Customer may have added funds."
        prob = 0.5
    elif payment.failure_reason in ["bank_declined", "payment_method_expired"]:
        action = "suggest_alternate_method"
        reason = "Current payment method is permanently failing."
        prob = 0.6
    else:
        action = "send_reminder"
        reason = "Standard reminder for unresolved failure."
        prob = 0.4

    return {
        "recommended_action": action,
        "confidence": 0.9 if action == "stop_recovery" else 0.7,
        "reason": reason,
        "estimated_recovery_amount": payment.amount if action != "stop_recovery" else 0.0,
        "estimated_recovery_probability": prob,
        "risk_level": "low",
    }

def validate_policy(payment: Payment, action: str, max_attempts: int = 3) -> (str, bool, str):
    if payment.status == PaymentStatus.recovered.value:
        return "stop_recovery", False, "Policy violation: Cannot recover already recovered payment."
    if action == "retry_payment" and payment.retry_count >= max_attempts:
        return "stop_recovery", False, "Policy violation: Maximum retry limit reached."
    if payment.amount < 100 and action != "stop_recovery":
        return "stop_recovery", False, "Policy violation: Amount too low for active recovery."
    if action not in ["retry_payment", "suggest_alternate_method", "send_reminder", "stop_recovery"]:
        return "stop_recovery", False, "Policy violation: Invalid action suggested."
    
    return action, True, ""

def get_recovery_recommendation(payment: Payment, max_attempts: int = 3) -> dict:
    # Use AI if available
    if client:
        try:
            prompt = f"""
You are a recovery optimization AI. Determine the best recovery action for a failed payment.
Possible actions: retry_payment, suggest_alternate_method, send_reminder, stop_recovery.

Payment Details:
ID: {payment.payment_id}
Amount: {payment.amount}
Failure Reason: {payment.failure_reason}
Payment Method: {payment.payment_method}
Retry Count: {payment.retry_count}
Status: {payment.status}

Output JSON with keys: recommended_action, confidence (float), reason (string), estimated_recovery_amount (float), estimated_recovery_probability (float), risk_level (string "low", "medium", "high").
"""
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": prompt}],
                temperature=0.0,
                response_format={ "type": "json_object" }
            )
            ai_data = json.loads(response.choices[0].message.content)
            action = ai_data.get("recommended_action", "stop_recovery")
            
            # Validate through deterministic policy
            valid_action, allowed, override_reason = validate_policy(payment, action, max_attempts)
            
            return {
                "payment_id": payment.payment_id,
                "recommended_action": valid_action,
                "confidence": float(ai_data.get("confidence", 0.5)),
                "reason": override_reason if not allowed else ai_data.get("reason", ""),
                "estimated_recovery_amount": float(ai_data.get("estimated_recovery_amount", 0.0)),
                "estimated_recovery_probability": float(ai_data.get("estimated_recovery_probability", 0.0)),
                "risk_level": ai_data.get("risk_level", "low"),
                "policy_allowed": allowed
            }
        except Exception as e:
            print(f"AI prediction failed: {e}")
            # Fall through to deterministic

    # Deterministic fallback
    det_data = get_deterministic_recommendation(payment, max_attempts)
    valid_action, allowed, override_reason = validate_policy(payment, det_data["recommended_action"], max_attempts)
    
    return {
        "payment_id": payment.payment_id,
        "recommended_action": valid_action,
        "confidence": det_data["confidence"],
        "reason": override_reason if not allowed else det_data["reason"],
        "estimated_recovery_amount": det_data["estimated_recovery_amount"],
        "estimated_recovery_probability": det_data["estimated_recovery_probability"],
        "risk_level": det_data["risk_level"],
        "policy_allowed": allowed
    }
