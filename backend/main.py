"""
backend/main.py
FastAPI entry point for PhishGuard — AI-Based Phishing URL Detection System.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import Base, engine, SessionLocal
from models import ScanRecord
from api.prediction import router as prediction_router
from api.history import router as history_router
from api.metrics import router as metrics_router
from ml.predict import predict_url_risk

# Create SQLite tables
Base.metadata.create_all(bind=engine)


def seed_initial_history():
    """Seed initial scan records if the database is empty so dashboard & history are populated on first launch."""
    db = SessionLocal()
    try:
        if db.query(ScanRecord).count() == 0:
            sample_urls = [
                "https://www.google.com",
                "http://paypal-secure-login-verify.tk/account/update",
                "https://github.com/fastapi/fastapi",
                "http://192.168.42.19/chase/login/verify.html",
                "https://docs.python.org/3/library/urllib.parse.html",
                "http://appleid-account-unlock-alert.xyz/signin?session=99812",
            ]
            for u in sample_urls:
                try:
                    res = predict_url_risk(u)
                    db.add(
                        ScanRecord(
                            url=res["url"],
                            prediction=res["prediction"],
                            risk_score=res["risk_score"],
                            confidence=res["confidence"],
                            model=res["model"],
                        )
                    )
                except Exception:
                    pass
            db.commit()
    finally:
        db.close()


seed_initial_history()

app = FastAPI(
    title="PhishGuard API",
    description="AI-Based Phishing URL Detection System — FastAPI + Scikit-Learn/XGBoost + SQLite",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)
app.include_router(history_router)
app.include_router(metrics_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    model_path = os.path.join(BACKEND_DIR, "models", "best_model.joblib")
    model_trained = os.path.exists(model_path)
    return {
        "status": "healthy" if model_trained else "model_untrained",
        "service": "PhishGuard API",
        "model_trained": model_trained,
        "version": "2.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
