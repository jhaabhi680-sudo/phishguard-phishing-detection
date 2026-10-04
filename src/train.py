"""
train.py
Model training module for the Phishing URL Detection System.
Trains multiple ML models, evaluates them, and saves the best model.
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)
import warnings
warnings.filterwarnings('ignore')

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("XGBoost not installed. Skipping XGBoost model.")


def get_models() -> dict:
    """
    Return a dictionary of ML models to train and compare.
    Each model is configured with reasonable hyperparameters
    suitable for a dataset of ~235K records.
    """
    models = {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,
            random_state=42,
            n_jobs=-1
        ),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=15,
            min_samples_split=20,
            random_state=42
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=10,
            random_state=42,
            n_jobs=-1
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        ),
    }

    if XGBOOST_AVAILABLE:
        models['XGBoost'] = XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            eval_metric='logloss',
            random_state=42,
            n_jobs=-1
        )

    return models


def train_model(model, X_train, y_train) -> tuple:
    """
    Train a single model and return the trained model and training time.
    """
    start = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start
    return model, train_time


def evaluate_model(model, X_test, y_test) -> dict:
    """
    Evaluate a trained model on the test set.
    Returns a dictionary of all evaluation metrics.

    Metric importance for phishing detection:
    - Precision: Important to minimize false alarms (blocking legitimate sites).
    - Recall: Critical to catch all phishing sites (missing one can be dangerous).
    - F1: Balances precision and recall.
    - ROC-AUC: Overall discriminative power of the model.
    """
    start = time.time()
    y_pred = model.predict(X_test)
    pred_time = time.time() - start

    # Probability scores for ROC-AUC (if model supports it)
    if hasattr(model, 'predict_proba'):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, 'decision_function'):
        y_prob = model.decision_function(X_test)
    else:
        y_prob = y_pred

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0),
        'f1': f1_score(y_test, y_pred, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_prob),
        'confusion_matrix': confusion_matrix(y_test, y_pred),
        'y_pred': y_pred,
        'y_prob': y_prob,
        'prediction_time_s': round(pred_time, 4)
    }
    return metrics


def train_all_models(
    X_train, X_test, y_train, y_test,
    models_dir: str = 'models'
) -> dict:
    """
    Train all models, evaluate them, and return a complete results dictionary.
    Prints a summary table of all model metrics.
    """
    os.makedirs(models_dir, exist_ok=True)
    models = get_models()
    results = {}

    print("\n" + "="*70)
    print("  MODEL TRAINING AND EVALUATION")
    print("="*70)

    for name, model in models.items():
        print(f"\n[*] Training: {name}")
        trained_model, train_time = train_model(model, X_train, y_train)
        metrics = evaluate_model(trained_model, X_test, y_test)
        metrics['train_time_s'] = round(train_time, 2)
        metrics['model'] = trained_model

        results[name] = metrics

        print(f"    Train time : {train_time:.2f}s")
        print(f"    Accuracy   : {metrics['accuracy']:.4f}")
        print(f"    Precision  : {metrics['precision']:.4f}")
        print(f"    Recall     : {metrics['recall']:.4f}")
        print(f"    F1-Score   : {metrics['f1']:.4f}")
        print(f"    ROC-AUC    : {metrics['roc_auc']:.4f}")

        # Save each model
        model_path = os.path.join(models_dir, f"{name.replace(' ', '_').lower()}.pkl")
        joblib.dump(trained_model, model_path)
        print(f"    Saved to   : {model_path}")

    return results


def select_best_model(results: dict) -> str:
    """
    Select the best model using a documented multi-criteria methodology:

    Criteria (in order of priority for phishing detection):
    1. F1-Score      : Balances precision and recall.
    2. ROC-AUC       : Measures overall discriminative power.
    3. Recall        : Critical — we must catch as many phishing sites as possible.
    4. Precision     : Important — minimize false alarms for legitimate sites.
    5. Training time : Secondary consideration.

    Returns the name of the selected best model.
    """
    print("\n" + "="*70)
    print("  MODEL SELECTION METHODOLOGY")
    print("="*70)
    print("""
  For phishing detection, the cost of a False Negative (missing a phishing
  site) is much higher than a False Positive (blocking a legitimate site).
  Therefore, Recall is weighted heavily. F1-Score balances precision and
  recall, making it our primary metric for model selection.
  """)

    scores = {}
    for name, m in results.items():
        # Composite score: 40% F1 + 30% ROC-AUC + 20% Recall + 10% Precision
        composite = (
            0.40 * m['f1'] +
            0.30 * m['roc_auc'] +
            0.20 * m['recall'] +
            0.10 * m['precision']
        )
        scores[name] = composite
        print(f"  {name:25s} | Composite Score: {composite:.4f} "
              f"(F1={m['f1']:.4f}, AUC={m['roc_auc']:.4f}, "
              f"Recall={m['recall']:.4f})")

    best_name = max(scores, key=scores.get)
    print(f"\n  >>> Selected Model: {best_name} (Score={scores[best_name]:.4f}) <<<")
    return best_name


def save_final_model(
    model,
    model_path: str = 'models/final_model.pkl'
) -> None:
    """
    Save the final selected model to disk using joblib.
    """
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"\nFinal model saved to: {model_path}")


if __name__ == '__main__':
    # Standalone test — requires preprocessed data
    from preprocessing import run_full_preprocessing

    DATA_PATH = os.path.join('data', 'PhiUSIIL_Phishing_URL_Dataset.csv')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')

    X_train, X_test, y_train, y_test, scaler, features = run_full_preprocessing(
        DATA_PATH, scaler_path=SCALER_PATH
    )

    results = train_all_models(X_train, X_test, y_train, y_test)
    best_name = select_best_model(results)
    save_final_model(results[best_name]['model'])

    # Save feature names for prediction pipeline
    joblib.dump(features, 'models/feature_names.pkl')
    print("Feature names saved.")
