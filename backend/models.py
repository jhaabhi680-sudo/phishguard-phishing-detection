"""
backend/models.py
SQLAlchemy ORM models for PhishGuard SQLite database.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class ScanRecord(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2048), nullable=False, index=True)
    prediction = Column(String(32), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    model = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
