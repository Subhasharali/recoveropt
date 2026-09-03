from typing import List, Dict
from sqlalchemy.orm import Session
from ..models import Payment, PaymentStatus, RecoveryStatus
from .recovery_ai import get_recovery_recommendation

# Configurable intervention costs per action (in INR)
ACTION_COSTS = {
    "retry_payment": 5.0,
    "suggest_alternate_method": 15.0,
    "send_reminder": 2.0,
    "stop_recovery": 0.0
}

def optimize_budget(db: Session, budget: float, max_attempts: int = 3) -> dict:
    # 1. Fetch eligible at-risk payments
    payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.failed.value,
        Payment.recovery_status == RecoveryStatus.eligible.value
    ).all()
    
    total_eligible_revenue = 0.0
    opportunities = []
    
    for payment in payments:
        total_eligible_revenue += payment.amount
        
        # Get AI/deterministic recommendation
        rec = get_recovery_recommendation(payment, max_attempts)
        
        if not rec["policy_allowed"] or rec["recommended_action"] == "stop_recovery":
            continue
            
        action = rec["recommended_action"]
        cost = ACTION_COSTS.get(action, 0.0)
        
        # Prevent 0 cost items from breaking division, though they shouldn't exist unless stop_recovery
        if cost <= 0:
            continue
            
        expected_recovery = rec["estimated_recovery_amount"] * rec["estimated_recovery_probability"]
        expected_net_benefit = expected_recovery - cost
        
        if expected_net_benefit > 0:
            roi = expected_net_benefit / cost
            opportunities.append({
                "payment_id": payment.payment_id,
                "recommended_action": action,
                "estimated_recovery": round(expected_recovery, 2),
                "intervention_cost": round(cost, 2),
                "expected_net_benefit": round(expected_net_benefit, 2),
                "roi": roi
            })
            
    # 2. Sort opportunities by ROI descending (Knapsack greedy approach)
    opportunities.sort(key=lambda x: x["roi"], reverse=True)
    
    # 3. Allocate budget
    selected = []
    total_cost = 0.0
    total_expected_recovery = 0.0
    total_net_benefit = 0.0
    
    for opp in opportunities:
        if total_cost + opp["intervention_cost"] <= budget:
            selected.append(opp)
            total_cost += opp["intervention_cost"]
            total_expected_recovery += opp["estimated_recovery"]
            total_net_benefit += opp["expected_net_benefit"]
            
    budget_remaining = budget - total_cost
    
    return {
        "available_budget": round(budget, 2),
        "eligible_at_risk_revenue": round(total_eligible_revenue, 2),
        "number_of_eligible_opportunities": len(payments),
        "selected_opportunity_count": len(selected),
        "selected_opportunities": selected,
        "estimated_recovery": round(total_expected_recovery, 2),
        "estimated_intervention_cost": round(total_cost, 2),
        "expected_net_benefit": round(total_net_benefit, 2),
        "budget_remaining": round(budget_remaining, 2),
        "explanation": "Opportunities were ranked by expected Return on Investment (ROI) (Expected Net Benefit / Intervention Cost) and selected sequentially until the budget constraint was reached."
    }
