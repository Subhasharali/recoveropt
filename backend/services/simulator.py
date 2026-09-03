from sqlalchemy.orm import Session
from .optimizer import optimize_budget

def simulate_policy(db: Session, proposed_budget: float, proposed_max_attempts: int) -> dict:
    # Get current policy results (assume baseline budget of 100.0 and max_attempts=3)
    current_budget = 100.0
    current_max_attempts = 3
    current_opt = optimize_budget(db, current_budget, current_max_attempts)
    
    # Get proposed policy results
    proposed_opt = optimize_budget(db, proposed_budget, proposed_max_attempts)
    
    current_eligible = current_opt["number_of_eligible_opportunities"]
    proposed_eligible = proposed_opt["number_of_eligible_opportunities"]
    
    current_expected = current_opt["estimated_recovery"]
    proposed_expected = proposed_opt["estimated_recovery"]
    incremental_expected = proposed_expected - current_expected
    
    current_cost = current_opt["estimated_intervention_cost"]
    proposed_cost = proposed_opt["estimated_intervention_cost"]
    incremental_cost = proposed_cost - current_cost
    
    current_at_risk_revenue = current_opt["eligible_at_risk_revenue"]
    proposed_at_risk_revenue = proposed_opt["eligible_at_risk_revenue"]
    
    current_rate = (current_expected / current_at_risk_revenue * 100) if current_at_risk_revenue > 0 else 0.0
    proposed_rate = (proposed_expected / proposed_at_risk_revenue * 100) if proposed_at_risk_revenue > 0 else 0.0
    
    projected_net_benefit = proposed_expected - proposed_cost
    
    # Recommendation logic
    current_net_benefit = current_expected - current_cost
    if projected_net_benefit > current_net_benefit:
        recommendation = "Beneficial: The proposed policy increases net benefit."
    elif projected_net_benefit == current_net_benefit:
        if proposed_cost < current_cost:
            recommendation = "Beneficial: Yields identical benefit at a lower cost."
        else:
            recommendation = "Neutral: The proposed policy yields identical or strictly worse results for the same benefit."
    else:
        recommendation = "Not Recommended: The proposed policy decreases net benefit compared to the current policy."
        
    return {
        "current_eligible_opportunities": current_eligible,
        "proposed_eligible_opportunities": proposed_eligible,
        "current_expected_recovered_revenue": round(current_expected, 2),
        "proposed_expected_recovered_revenue": round(proposed_expected, 2),
        "incremental_expected_recovery": round(incremental_expected, 2),
        "current_intervention_cost": round(current_cost, 2),
        "proposed_intervention_cost": round(proposed_cost, 2),
        "incremental_cost": round(incremental_cost, 2),
        "current_recovery_rate": round(current_rate, 2),
        "projected_recovery_rate": round(proposed_rate, 2),
        "projected_net_benefit": round(projected_net_benefit, 2),
        "recommendation": recommendation
    }
