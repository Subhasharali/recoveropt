from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, text
from sqlalchemy.sql import func
from .database import Base
import enum

class PaymentStatus(str, enum.Enum):
    failed = "failed"
    recovered = "recovered"
    pending = "pending"
    successful = "successful"

class RecoveryStatus(str, enum.Enum):
    not_attempted = "not_attempted"
    eligible = "eligible"
    attempted = "attempted"
    recovered = "recovered"
    stopped = "stopped"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, nullable=False) # e.g. failed, recovered, pending, successful
    failure_reason = Column(String, nullable=True)
    payment_method = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    retry_count = Column(Integer, default=0)
    recovery_status = Column(String, default="not_attempted")
    recovered_amount = Column(Float, default=0.0)
    last_action_at = Column(DateTime(timezone=True), nullable=True)

class RecoveryAudit(Base):
    __tablename__ = "recovery_audits"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, index=True, nullable=False)
    customer_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    recommended_action = Column(String, nullable=False)
    executed_action = Column(String, nullable=False)
    execution_status = Column(String, nullable=False) # e.g. success, failed, blocked, stopped
    intervention_cost = Column(Float, default=0.0)
    recovered_amount = Column(Float, default=0.0)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    razorpay_link_id = Column(String, nullable=True)
