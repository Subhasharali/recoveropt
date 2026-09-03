from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from ..database import get_db
from ..models import Payment, PaymentStatus, RecoveryStatus
from ..schemas import PaymentResponse, PaginatedPayments, MetricsResponse

router = APIRouter(prefix="/api", tags=["payments"])

@router.get("/payments", response_model=PaginatedPayments)
def get_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    status: Optional[str] = None
):
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    
    total = query.count()
    items = query.order_by(Payment.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return PaginatedPayments(
        items=items,
        total=total,
        page=page,
        size=size
    )

@router.get("/payments/at-risk", response_model=PaginatedPayments)
def get_at_risk_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100)
):
    query = db.query(Payment).filter(
        Payment.status == PaymentStatus.failed.value,
        Payment.recovery_status == RecoveryStatus.eligible.value
    )
    
    total = query.count()
    items = query.order_by(Payment.amount.desc()).offset((page - 1) * size).limit(size).all()
    
    return PaginatedPayments(
        items=items,
        total=total,
        page=page,
        size=size
    )

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(db: Session = Depends(get_db)):
    total_payments = db.query(Payment).count()
    
    # Failed payments that are eligible for recovery
    eligible_query = db.query(Payment).filter(
        Payment.status == PaymentStatus.failed.value,
        Payment.recovery_status == RecoveryStatus.eligible.value
    )
    eligible_opportunities = eligible_query.count()
    
    # Sum of amount for eligible failed payments
    revenue_at_risk = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.failed.value,
        Payment.recovery_status == RecoveryStatus.eligible.value
    ).scalar() or 0.0
    
    # Sum of recovered amount
    recovered_revenue = db.query(func.sum(Payment.recovered_amount)).scalar() or 0.0
    
    # Count of failed payments
    failed_payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.failed.value
    ).count()
    
    # Calculate recovery rate based on opportunities vs recovered (or similar logical metric)
    # Total opportunities = failed payments
    # For MVP, Recovery Rate = Recovered Revenue / (Recovered Revenue + Revenue At Risk) or by count
    # Let's do it by amount:
    total_recoverable_revenue = recovered_revenue + revenue_at_risk
    recovery_rate = 0.0
    if total_recoverable_revenue > 0:
        recovery_rate = (recovered_revenue / total_recoverable_revenue) * 100
        
    return MetricsResponse(
        total_payments=total_payments,
        revenue_at_risk=revenue_at_risk,
        recovered_revenue=recovered_revenue,
        recovery_rate=round(recovery_rate, 2),
        failed_payments=failed_payments,
        eligible_opportunities=eligible_opportunities
    )
