"""
backend/api/history.py
FastAPI router for SQLite scan history management:
GET /api/history, POST /api/history, DELETE /api/history
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from database import get_db
from models import ScanRecord
from schemas import HistoryCreateRequest, HistoryItemResponse

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history", response_model=List[HistoryItemResponse])
def get_history(
    search: Optional[str] = Query(None, description="Search substring in URL"),
    prediction: Optional[str] = Query(None, description="Filter by 'phishing' or 'legitimate'"),
    sort: str = Query("desc", description="Sort by timestamp: 'desc' or 'asc'"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(ScanRecord)

    if search and search.strip():
        query = query.filter(ScanRecord.url.ilike(f"%{search.strip()}%"))

    if prediction and prediction.lower() in ("phishing", "legitimate"):
        query = query.filter(ScanRecord.prediction == prediction.lower())

    if sort.lower() == "asc":
        query = query.order_by(asc(ScanRecord.timestamp), asc(ScanRecord.id))
    else:
        query = query.order_by(desc(ScanRecord.timestamp), desc(ScanRecord.id))

    return query.limit(limit).all()


@router.post("/history", response_model=HistoryItemResponse)
def add_history_item(payload: HistoryCreateRequest, db: Session = Depends(get_db)):
    record = ScanRecord(
        url=payload.url.strip(),
        prediction=payload.prediction.lower(),
        risk_score=payload.risk_score,
        confidence=payload.confidence,
        model=payload.model,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    deleted_count = db.query(ScanRecord).delete()
    db.commit()
    return {"status": "success", "deleted_count": deleted_count, "message": "Scan history cleared."}


@router.delete("/history/{record_id}")
def delete_single_history(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    db.delete(record)
    db.commit()
    return {"status": "success", "deleted_id": record_id}
