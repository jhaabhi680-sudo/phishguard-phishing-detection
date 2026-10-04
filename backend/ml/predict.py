"""
backend/ml/predict.py
Real-time ML inference and Explainable AI (XAI) module for PhishGuard.
"""

import os
import sys
import json
import joblib
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from features.url_features import (
    FEATURE_NAMES,
    validate_url,
    extract_features_dict,
    extract_features_vector,
    generate_explanations,
)

MODELS_DIR = os.path.join(BACKEND_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "feature_metadata.json")

_CACHE = {
    "model": None,
    "scaler": None,
    "metadata": None,
    "mtime": 0,
}


class ModelNotTrainedError(Exception):
    """Raised when ML model artifacts are missing."""
    pass


def load_inference_artifacts():
    """Load and cache trained model, scaler, and metadata."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise ModelNotTrainedError("ML model is not trained yet. Run the training script first.")

    current_mtime = os.path.getmtime(MODEL_PATH)
    if _CACHE["model"] is None or _CACHE["mtime"] != current_mtime:
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _CACHE["metadata"] = json.load(f)
        else:
            _CACHE["metadata"] = {"selected_model": "Random Forest", "feature_names": FEATURE_NAMES}

        try:
            _CACHE["model"] = joblib.load(MODEL_PATH)
        except Exception:
            rf_path = os.path.join(MODELS_DIR, "random_forest.joblib")
            _CACHE["model"] = joblib.load(rf_path)
            _CACHE["metadata"]["selected_model"] = "Random Forest"

        _CACHE["scaler"] = joblib.load(SCALER_PATH)
        _CACHE["mtime"] = current_mtime

    return _CACHE["model"], _CACHE["scaler"], _CACHE["metadata"]


def predict_url_risk(raw_url: str) -> dict:
    """
    Validate URL, extract features in exact training order, run ML inference,
    and return prediction, confidence, risk_score, model name, reasons, and features.
    """
    is_valid, normalized_url, err_msg = validate_url(raw_url)
    if not is_valid:
        raise ValueError(err_msg)

    model, scaler, metadata = load_inference_artifacts()
    model_name = metadata.get("selected_model", "Random Forest")

    # Extract features in exact training order
    features_dict = extract_features_dict(raw_url.strip())
    feature_vector = [features_dict[k] for k in FEATURE_NAMES]
    X = np.array([feature_vector], dtype=float)
    X_scaled = scaler.transform(X)

    # Predict probability of phishing (label = 1)
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_scaled)[0]
        phishing_prob = float(probs[1])
    else:
        pred_label = int(model.predict(X_scaled)[0])
        phishing_prob = 0.92 if pred_label == 1 else 0.08

    # Combine ML probability with structural security signals for risk score
    heuristic_boost = 0.0
    if features_dict["has_ip"] == 1:
        heuristic_boost += 0.25
    if features_dict["num_at"] > 0:
        heuristic_boost += 0.25
    if features_dict["suspicious_keyword_count"] >= 2:
        heuristic_boost += 0.15
    if features_dict["has_suspicious_tld"] == 1:
        heuristic_boost += 0.15
    if features_dict["num_hyphens"] >= 2 and features_dict["suspicious_keyword_count"] >= 1:
        heuristic_boost += 0.15
    if features_dict["has_https"] == 0 and features_dict["suspicious_keyword_count"] >= 1:
        heuristic_boost += 0.12

    adjusted_phish_prob = min(0.99, max(0.01, phishing_prob * 0.82 + heuristic_boost))
    if phishing_prob >= 0.5 or adjusted_phish_prob >= 0.5:
        is_phishing = True
        final_prob = max(phishing_prob, adjusted_phish_prob)
        risk_score = int(round(min(99, max(52, final_prob * 100))))
        confidence = round(min(0.99, max(0.55, final_prob)), 4)
        prediction_str = "phishing"
    else:
        is_phishing = False
        risk_score = int(round(max(1, min(45, adjusted_phish_prob * 100))))
        confidence = round(min(0.99, max(0.55, 1.0 - adjusted_phish_prob)), 4)
        prediction_str = "legitimate"

    reasons = generate_explanations(raw_url.strip(), features_dict, is_phishing)
    top_features = metadata.get("feature_importances", [])[:8]

    return {
        "url": raw_url.strip(),
        "normalized_url": normalized_url,
        "prediction": prediction_str,
        "confidence": confidence,
        "risk_score": risk_score,
        "model": model_name,
        "reasons": reasons,
        "important_features": top_features,
        "features": features_dict,
    }
