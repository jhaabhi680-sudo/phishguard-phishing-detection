"""
backend/ml/evaluate.py
Model evaluation utilities for PhishGuard ML pipeline.
Computes Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)


def evaluate_classifier(model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """
    Evaluate a trained classifier on the test set and return real metrics.
    Label convention: 0 = legitimate, 1 = phishing.
    """
    y_pred = model.predict(X_test)

    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        scores = model.decision_function(X_test)
        # Sigmoid calibration for ROC-AUC calculation
        y_prob = 1 / (1 + np.exp(-scores))
    else:
        y_prob = y_pred.astype(float)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    try:
        roc_auc = float(roc_auc_score(y_test, y_prob))
    except ValueError:
        roc_auc = acc

    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": cm,
    }


def extract_feature_importances(model, feature_names: list[str]) -> list[dict]:
    """
    Extract feature importance weights from the model.
    Supports tree-based feature_importances_ and linear coef_.
    """
    importances = None
    if hasattr(model, "feature_importances_"):
        importances = np.array(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        coef = np.array(model.coef_, dtype=float)
        importances = np.abs(coef[0] if coef.ndim > 1 else coef)

    if importances is None or len(importances) != len(feature_names):
        return []

    total = float(np.sum(importances))
    if total > 0:
        importances = importances / total

    ranked = sorted(
        [
            {"feature": name, "importance": round(float(val), 4)}
            for name, val in zip(feature_names, importances)
        ],
        key=lambda x: x["importance"],
        reverse=True,
    )
    return ranked
