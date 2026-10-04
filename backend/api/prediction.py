"""
backend/api/prediction.py
FastAPI router for POST /api/predict.
Validates URL, runs ML inference, persists scan record to SQLite, and returns JSON.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ScanRecord
from schemas import PredictRequest, PredictResponse
from ml.predict import predict_url_risk, ModelNotTrainedError

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(payload: PredictRequest, db: Session = Depends(get_db)):
    try:
        result = predict_url_risk(payload.url)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except ModelNotTrainedError as mn:
        raise HTTPException(status_code=503, detail=str(mn))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(exc)}")

    # Save scan record in SQLite database
    record = ScanRecord(
        url=result["url"],
        prediction=result["prediction"],
        risk_score=result["risk_score"],
        confidence=result["confidence"],
        model=result["model"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    result["id"] = record.id
    result["timestamp"] = record.timestamp
    return result
