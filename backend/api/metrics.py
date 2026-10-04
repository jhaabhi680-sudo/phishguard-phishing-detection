"""
backend/api/metrics.py
FastAPI router for GET /api/metrics and GET /api/model-info.
Combines real trained ML metrics with live SQLite scan analytics.
"""

import os
import json
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ScanRecord

router = APIRouter(prefix="/api", tags=["Metrics"])

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
METRICS_FILE = os.path.join(MODELS_DIR, "metrics.json")
METADATA_FILE = os.path.join(MODELS_DIR, "feature_metadata.json")


def _read_json(path: str):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    ml_data = _read_json(METRICS_FILE)
    all_scans = db.query(ScanRecord).order_by(ScanRecord.timestamp.asc()).all()

    total_scans = len(all_scans)
    phishing_detected = sum(1 for s in all_scans if s.prediction == "phishing")
    legitimate_detected = sum(1 for s in all_scans if s.prediction == "legitimate")
    phishing_percentage = round((phishing_detected / total_scans) * 100, 1) if total_scans > 0 else 0.0

    # Group scans by date for the Scan History Chart
    by_date = defaultdict(lambda: {"date": "", "phishing": 0, "legitimate": 0, "total": 0})
    for s in all_scans:
        date_key = s.timestamp.strftime("%Y-%m-%d") if s.timestamp else "Unknown"
        by_date[date_key]["date"] = date_key
        by_date[date_key]["total"] += 1
        if s.prediction == "phishing":
            by_date[date_key]["phishing"] += 1
        else:
            by_date[date_key]["legitimate"] += 1

    scan_history_chart = list(by_date.values())[-14:]

    if not ml_data:
        return {
            "model_trained": False,
            "message": "Train model to view metrics. Run: python backend/ml/train.py",
            "scan_stats": {
                "total_scans": total_scans,
                "phishing_detected": phishing_detected,
                "legitimate_detected": legitimate_detected,
                "phishing_percentage": phishing_percentage,
                "scan_history_chart": scan_history_chart,
            },
        }

    models_dict = ml_data.get("models", {})
    model_comparison = [
        {
            "model": name,
            "accuracy": round(vals["accuracy"] * 100, 2),
            "precision": round(vals["precision"] * 100, 2),
            "recall": round(vals["recall"] * 100, 2),
            "f1_score": round(vals["f1_score"] * 100, 2),
            "roc_auc": round(vals["roc_auc"] * 100, 2),
            "train_time_seconds": vals.get("train_time_seconds", 0),
            "confusion_matrix": vals.get("confusion_matrix", [[0, 0], [0, 0]]),
        }
        for name, vals in models_dict.items()
    ]

    return {
        "model_trained": True,
        "selected_model": ml_data.get("selected_model"),
        "selection_metric": ml_data.get("selection_metric", "f1_score"),
        "is_demo_dataset": ml_data.get("is_demo_dataset", True),
        "dataset_note": ml_data.get("dataset_note", ""),
        "dataset_summary": ml_data.get("dataset_summary", {}),
        "trained_at": ml_data.get("trained_at"),
        "best_model_metrics": ml_data.get("best_model_metrics", {}),
        "model_comparison": model_comparison,
        "feature_importances": ml_data.get("feature_importances", []),
        "scan_stats": {
            "total_scans": total_scans,
            "phishing_detected": phishing_detected,
            "legitimate_detected": legitimate_detected,
            "phishing_percentage": phishing_percentage,
            "scan_history_chart": scan_history_chart,
        },
    }


@router.get("/model-info")
def get_model_info():
    metadata = _read_json(METADATA_FILE)
    metrics = _read_json(METRICS_FILE)

    if not metadata or not metrics:
        return {
            "model_trained": False,
            "message": "ML model is not trained yet. Run: python backend/ml/train.py",
        }

    return {
        "model_trained": True,
        "selected_model": metadata.get("selected_model"),
        "selection_metric": metadata.get("selection_metric"),
        "selection_rationale": metadata.get("selection_rationale"),
        "num_features": metadata.get("num_features"),
        "feature_names": metadata.get("feature_names", []),
        "label_mapping": metadata.get("label_mapping", {}),
        "feature_importances": metadata.get("feature_importances", []),
        "best_model_metrics": metrics.get("best_model_metrics", {}),
        "is_demo_dataset": metrics.get("is_demo_dataset", True),
        "dataset_note": metrics.get("dataset_note", ""),
        "trained_at": metrics.get("trained_at"),
    }
