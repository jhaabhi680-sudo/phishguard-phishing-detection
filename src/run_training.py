"""
run_training.py
Complete training pipeline for the Phishing URL Detection System.
Run this script to train all models, generate plots, and save artifacts.

Usage:
    python src/run_training.py

Requirements:
    - Dataset at: data/PhiUSIIL_Phishing_URL_Dataset.csv
    - All packages in requirements.txt installed
"""

import os
import sys
import json
import warnings
import numpy as np
import pandas as pd
warnings.filterwarnings('ignore')

# Make src importable
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from preprocessing import run_full_preprocessing, load_dataset, check_quality, remove_irrelevant_columns, encode_categorical, check_class_distribution
from train import train_all_models, select_best_model, save_final_model
from evaluate import generate_all_eda_plots, generate_all_model_plots
import joblib

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join('data', 'PhiUSIIL_Phishing_URL_Dataset.csv')
MODELS_DIR = 'models'
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')
FINAL_MODEL_PATH = os.path.join(MODELS_DIR, 'final_model.pkl')
FEATURE_NAMES_PATH = os.path.join(MODELS_DIR, 'feature_names.pkl')
METRICS_PATH = os.path.join(MODELS_DIR, 'metrics.json')
DATASET_INFO_PATH = os.path.join(MODELS_DIR, 'dataset_info.json')
PLOT_DIR = os.path.join('static', 'plots')
TARGET_COL = 'label'


def serialize_metrics(results: dict) -> dict:
    """
    Serialize model results for JSON storage.
    Removes non-serializable objects (numpy arrays, model objects).
    """
    serializable = {}
    for name, metrics in results.items():
        serializable[name] = {
            'accuracy': float(metrics['accuracy']),
            'precision': float(metrics['precision']),
            'recall': float(metrics['recall']),
            'f1': float(metrics['f1']),
            'roc_auc': float(metrics['roc_auc']),
            'train_time_s': float(metrics['train_time_s']),
            'prediction_time_s': float(metrics['prediction_time_s']),
            'confusion_matrix': metrics['confusion_matrix'].tolist(),
        }
    return serializable


def save_dataset_info(df_original: pd.DataFrame) -> None:
    """Save dataset information for display in the web app."""
    counts = df_original[TARGET_COL].value_counts()
    total = len(df_original)
    info = {
        'name': 'PhiUSIIL Phishing URL Dataset',
        'source': 'UCI Machine Learning Repository',
        'url': 'https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset',
        'total_records': total,
        'total_features': df_original.shape[1] - 1,  # exclude label
        'phishing_count': int(counts.get(0, 0)),
        'legitimate_count': int(counts.get(1, 0)),
        'phishing_pct': round(counts.get(0, 0) / total * 100, 2),
        'legitimate_pct': round(counts.get(1, 0) / total * 100, 2),
    }
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(DATASET_INFO_PATH, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"Dataset info saved to: {DATASET_INFO_PATH}")


def main():
    print("\n" + "#" * 70)
    print("  AI-BASED PHISHING URL DETECTION SYSTEM")
    print("  Full Training Pipeline")
    print("#" * 70)

    # ------------------------------------------------------------------
    # Step 1: Verify dataset exists
    # ------------------------------------------------------------------
    if not os.path.exists(DATA_PATH):
        print(f"\n[ERROR] Dataset not found at: {DATA_PATH}")
        print("Please download from:")
        print("  https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset")
        print("And place it at: data/PhiUSIIL_Phishing_URL_Dataset.csv")
        sys.exit(1)

    # ------------------------------------------------------------------
    # Step 2: Load raw dataset for EDA plots and dataset info
    # ------------------------------------------------------------------
    print("\n[1/6] Loading and inspecting dataset...")
    df_raw = load_dataset(DATA_PATH)
    save_dataset_info(df_raw)

    # ------------------------------------------------------------------
    # Step 3: Generate EDA plots (on raw data before removing text cols)
    # ------------------------------------------------------------------
    print("\n[2/6] Generating EDA visualizations...")
    df_for_eda = df_raw.copy()
    # Drop text columns for numeric plots
    for col in ['FILENAME', 'Domain', 'URL', 'Title']:
        if col in df_for_eda.columns:
            df_for_eda = df_for_eda.drop(columns=[col])
    generate_all_eda_plots(df_for_eda, TARGET_COL, PLOT_DIR)

    # ------------------------------------------------------------------
    # Step 4: Preprocessing
    # ------------------------------------------------------------------
    print("\n[3/6] Preprocessing data...")
    X_train, X_test, y_train, y_test, scaler, feature_names = run_full_preprocessing(
        DATA_PATH,
        target_col=TARGET_COL,
        test_size=0.2,
        random_state=42,
        scaler_path=SCALER_PATH
    )
    joblib.dump(feature_names, FEATURE_NAMES_PATH)
    print(f"Feature names saved to: {FEATURE_NAMES_PATH}")

    # ------------------------------------------------------------------
    # Step 5: Train all models
    # ------------------------------------------------------------------
    print("\n[4/6] Training all models...")
    results = train_all_models(X_train, X_test, y_train, y_test, MODELS_DIR)

    # ------------------------------------------------------------------
    # Step 6: Select best model and save
    # ------------------------------------------------------------------
    print("\n[5/6] Selecting best model...")
    best_name = select_best_model(results)
    save_final_model(results[best_name]['model'], FINAL_MODEL_PATH)

    # Save serializable metrics
    serialized = serialize_metrics(results)
    serialized['_best_model'] = best_name
    with open(METRICS_PATH, 'w') as f:
        json.dump(serialized, f, indent=2)
    print(f"Metrics saved to: {METRICS_PATH}")

    # ------------------------------------------------------------------
    # Step 7: Generate model evaluation plots
    # ------------------------------------------------------------------
    print("\n[6/6] Generating model evaluation plots...")
    generate_all_model_plots(
        results, y_test, feature_names, PLOT_DIR
    )

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("  TRAINING COMPLETE!")
    print("=" * 70)
    print(f"  Best Model    : {best_name}")
    print(f"  F1-Score      : {results[best_name]['f1']:.4f}")
    print(f"  ROC-AUC       : {results[best_name]['roc_auc']:.4f}")
    print(f"  Accuracy      : {results[best_name]['accuracy']:.4f}")
    print("")
    print(f"  Model saved   : {FINAL_MODEL_PATH}")
    print(f"  Scaler saved  : {SCALER_PATH}")
    print(f"  Metrics saved : {METRICS_PATH}")
    print("")
    print("  To start the web application, run:")
    print("      python app.py")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
