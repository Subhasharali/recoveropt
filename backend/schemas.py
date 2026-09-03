from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class PaymentBase(BaseModel):
    payment_id: str
    customer_id: str
    customer_name: str
    amount: float
    currency: str
    status: str
    failure_reason: Optional[str] = None
    payment_method: str
    retry_count: int
    recovery_status: str
    recovered_amount: float

class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    last_action_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedPayments(BaseModel):
    items: List[PaymentResponse]
    total: int
    page: int
    size: int

class MetricsResponse(BaseModel):
    total_payments: int
    revenue_at_risk: float
    recovered_revenue: float
    recovery_rate: float
    failed_payments: int
    eligible_opportunities: int

class RecoveryRecommendationResponse(BaseModel):
    payment_id: str
    recommended_action: str
    confidence: float
    reason: str
    estimated_recovery_amount: float
    estimated_recovery_probability: float
    risk_level: str
    policy_allowed: bool

class OptimizerSelectedOpportunity(BaseModel):
    payment_id: str
    recommended_action: str
    estimated_recovery: float
    intervention_cost: float
    expected_net_benefit: float

class OptimizationResponse(BaseModel):
    available_budget: float
    eligible_at_risk_revenue: float
    number_of_eligible_opportunities: int
    selected_opportunity_count: int
    selected_opportunities: List[OptimizerSelectedOpportunity]
    estimated_recovery: float
    estimated_intervention_cost: float
    expected_net_benefit: float
    budget_remaining: float
    explanation: str

class SimulationResponse(BaseModel):
    current_eligible_opportunities: int
    proposed_eligible_opportunities: int
    current_expected_recovered_revenue: float
    proposed_expected_recovered_revenue: float
    incremental_expected_recovery: float
    current_intervention_cost: float
    proposed_intervention_cost: float
    incremental_cost: float
    current_recovery_rate: float
    projected_recovery_rate: float
    projected_net_benefit: float
    recommendation: str

class RecoveryExecuteRequest(BaseModel):
    payment_id: str
    action: str

class RecoveryExecuteResponse(BaseModel):
    payment_id: str
    status: str
    message: str
    recovered_amount: float
    intervention_cost: float
    action: str
    payment_link_url: Optional[str] = None

class RecoveryAuditResponse(BaseModel):
    id: int
    payment_id: str
    customer_id: str
    amount: float
    recommended_action: str
    executed_action: str
    execution_status: str
    intervention_cost: float
    recovered_amount: float
    reason: Optional[str] = None
    created_at: datetime
    razorpay_link_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
