from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Payment, PaymentStatus, RecoveryStatus
from ..schemas import RecoveryRecommendationResponse
from ..services.recovery_ai import get_recovery_recommendation

router = APIRouter(prefix="/api/recovery", tags=["recovery"])

@router.get("/recommendation/{payment_id}", response_model=RecoveryRecommendationResponse)
def get_recommendation(payment_id: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status != PaymentStatus.failed.value or payment.recovery_status != RecoveryStatus.eligible.value:
        # It might still be valid to check, but usually only eligible at-risk are checked.
        # Allowing it to run for demo purposes, the policy will enforce rules.
        pass

    recommendation = get_recovery_recommendation(payment)
    return recommendation

@router.get("/recommendations", response_model=List[RecoveryRecommendationResponse])
def get_batch_recommendations(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.failed.value,
        Payment.recovery_status == RecoveryStatus.eligible.value
    ).limit(limit).all()
    
    recommendations = []
    for p in payments:
        recommendations.append(get_recovery_recommendation(p))
        
    return recommendations

from ..services.optimizer import optimize_budget
from ..schemas import OptimizationResponse

@router.get("/optimize", response_model=OptimizationResponse)
def get_optimization(budget: float = Query(100.0, ge=0), db: Session = Depends(get_db)):
    return optimize_budget(db, budget)

from ..services.simulator import simulate_policy
from ..schemas import SimulationResponse

@router.get("/simulate", response_model=SimulationResponse)
def get_simulation(
    budget: float = Query(5000.0, ge=0), 
    max_attempts: int = Query(3, ge=1), 
    db: Session = Depends(get_db)
):
    return simulate_policy(db, budget, max_attempts)

from ..services.executor import execute_recovery_action
from ..schemas import RecoveryExecuteRequest, RecoveryExecuteResponse, RecoveryAuditResponse
from ..models import RecoveryAudit

@router.post("/execute", response_model=RecoveryExecuteResponse)
def post_execute(request: RecoveryExecuteRequest, db: Session = Depends(get_db)):
    return execute_recovery_action(db, request.payment_id, request.action)

@router.get("/audit", response_model=List[RecoveryAuditResponse])
def get_audit_trail(limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db)):
    return db.query(RecoveryAudit).order_by(RecoveryAudit.created_at.desc()).limit(limit).all()
