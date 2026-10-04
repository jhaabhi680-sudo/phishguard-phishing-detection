"""
preprocessing.py
Data preprocessing module for the Phishing URL Detection System.
Handles data loading, cleaning, encoding, scaling, and train-test splitting.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
import joblib
import os
import warnings
warnings.filterwarnings('ignore')


def load_dataset(filepath: str) -> pd.DataFrame:
    """
    Load the PhiUSIIL Phishing URL dataset from a CSV file.
    Prints shape, columns, dtypes, and basic statistics.
    """
    print(f"Loading dataset from: {filepath}")
    df = pd.read_csv(filepath)
    print(f"\n--- Dataset Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    print(f"\n--- Columns ---")
    print(df.columns.tolist())
    print(f"\n--- Data Types ---")
    print(df.dtypes)
    print(f"\n--- Basic Statistics ---")
    print(df.describe())
    return df


def check_quality(df: pd.DataFrame) -> pd.DataFrame:
    """
    Check and report data quality: missing values, duplicates.
    Returns a cleaned DataFrame.
    """
    print("\n--- Missing Values ---")
    missing = df.isnull().sum()
    print(missing[missing > 0] if missing.sum() > 0 else "No missing values found.")

    print("\n--- Duplicate Records ---")
    n_dupes = df.duplicated().sum()
    print(f"Duplicate rows: {n_dupes}")
    if n_dupes > 0:
        df = df.drop_duplicates().reset_index(drop=True)
        print(f"Duplicates removed. New shape: {df.shape}")

    return df


def remove_irrelevant_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove columns that are not useful for ML:
    - FILENAME (if present)
    - URL (raw string, not useful as-is after feature extraction)
    - Any other identifier columns
    """
    drop_cols = []
    for col in ['FILENAME', 'Domain', 'URL', 'Title']:
        if col in df.columns:
            drop_cols.append(col)
    if drop_cols:
        print(f"\nDropping irrelevant/raw text columns: {drop_cols}")
        df = df.drop(columns=drop_cols)
    return df


def check_class_distribution(df: pd.DataFrame, target_col: str = 'label') -> dict:
    """
    Print and return class distribution for the target column.
    Label 1 = Legitimate, Label 0 = Phishing
    """
    print(f"\n--- Class Distribution ({target_col}) ---")
    dist = df[target_col].value_counts()
    pct = df[target_col].value_counts(normalize=True) * 100
    for cls in dist.index:
        name = 'Legitimate' if cls == 1 else 'Phishing'
        print(f"  {name} ({cls}): {dist[cls]} ({pct[cls]:.2f}%)")
    return dist.to_dict()


def encode_categorical(df: pd.DataFrame, target_col: str = 'label') -> pd.DataFrame:
    """
    Encode any remaining categorical (object) columns using LabelEncoder.
    Skips the target column.
    """
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    cat_cols = [c for c in cat_cols if c != target_col]
    if cat_cols:
        print(f"\nEncoding categorical columns: {cat_cols}")
        le = LabelEncoder()
        for col in cat_cols:
            df[col] = le.fit_transform(df[col].astype(str))
    else:
        print("\nNo categorical columns to encode (all numeric).")
    return df


def split_data(
    df: pd.DataFrame,
    target_col: str = 'label',
    test_size: float = 0.2,
    random_state: int = 42
):
    """
    Stratified train-test split to prevent data leakage and maintain class balance.
    Returns X_train, X_test, y_train, y_test.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y  # Stratified to preserve class ratio
    )
    print(f"\n--- Train-Test Split ---")
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set:     {X_test.shape[0]} samples")
    print(f"Train class balance: {y_train.value_counts().to_dict()}")
    print(f"Test class balance:  {y_test.value_counts().to_dict()}")
    return X_train, X_test, y_train, y_test


def scale_features(X_train, X_test, save_path: str = None):
    """
    Fit StandardScaler on training data and transform both train and test sets.
    Saves the scaler to disk if save_path is provided.
    """
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)  # Use training stats only -- no data leakage

    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        joblib.dump(scaler, save_path)
        print(f"Scaler saved to: {save_path}")

    return X_train_scaled, X_test_scaled, scaler


def run_full_preprocessing(
    filepath: str,
    target_col: str = 'label',
    test_size: float = 0.2,
    random_state: int = 42,
    scaler_path: str = None
):
    """
    Run the complete preprocessing pipeline:
    1. Load data
    2. Quality checks
    3. Remove irrelevant columns
    4. Encode categorical
    5. Check class distribution
    6. Split
    7. Scale
    Returns: X_train, X_test, y_train, y_test, scaler, feature_names
    """
    df = load_dataset(filepath)
    df = check_quality(df)
    df = remove_irrelevant_columns(df)
    df = encode_categorical(df, target_col)
    check_class_distribution(df, target_col)

    X_train, X_test, y_train, y_test = split_data(df, target_col, test_size, random_state)
    feature_names = X_train.columns.tolist()

    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test, scaler_path)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_names


if __name__ == '__main__':
    DATA_PATH = os.path.join('data', 'PhiUSIIL_Phishing_URL_Dataset.csv')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')
    X_train, X_test, y_train, y_test, scaler, features = run_full_preprocessing(
        DATA_PATH, scaler_path=SCALER_PATH
    )
    print("\nPreprocessing complete.")
    print(f"Feature count: {len(features)}")
