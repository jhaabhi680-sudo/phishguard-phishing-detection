"""
backend/schemas.py
Pydantic request and response schemas for PhishGuard REST API.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Website URL to analyze")


class PredictResponse(BaseModel):
    id: Optional[int] = None
    url: str
    normalized_url: str
    prediction: str
    confidence: float
    risk_score: int
    model: str
    reasons: List[str]
    important_features: List[Dict[str, Any]]
    features: Dict[str, Any]
    timestamp: Optional[datetime] = None


class HistoryCreateRequest(BaseModel):
    url: str
    prediction: str
    risk_score: int
    confidence: float
    model: str


class HistoryItemResponse(BaseModel):
    id: int
    url: str
    prediction: str
    risk_score: int
    confidence: float
    model: str
    timestamp: datetime

    class Config:
        from_attributes = True
