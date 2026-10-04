"""
backend/ml/train.py
End-to-end ML training pipeline for PhishGuard.
Pipeline:
Dataset -> Data Cleaning -> Duplicate Removal -> Missing Value Handling ->
Feature Extraction -> Stratified Train/Test Split -> StandardScaler ->
Multi-Model Training (LR, DT, RF, SVM, XGBoost) -> Evaluation ->
Best Model Selection (by F1-score) -> Artifact Serialization.
"""

import os
import sys
import json
import time
import random
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

warnings.filterwarnings("ignore")

# Ensure backend directory is on path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from features.url_features import FEATURE_NAMES, extract_features_vector
from ml.evaluate import evaluate_classifier, extract_feature_importances

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

RANDOM_SEED = 42
DATASET_PATH = os.path.join(PROJECT_ROOT, "dataset", "phishing_dataset.csv")
MODELS_DIR = os.path.join(BACKEND_DIR, "models")


def generate_demo_dataset(csv_path: str, num_samples: int = 1800):
    """
    Generate a diverse, realistic demonstration dataset of legitimate (0) and phishing (1) URLs
    with non-linear interaction patterns and realistic borderline cases (e.g., legitimate SSO
    login URLs and stealthy HTTPS phishing URLs) so linear vs tree ensemble models show
    authentic performance differentiation.
    """
    rng = random.Random(RANDOM_SEED)
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)

    legit_domains = [
        "google.com", "github.com", "microsoft.com", "apple.com", "amazon.com",
        "wikipedia.org", "stackoverflow.com", "python.org", "fastapi.tiangolo.com",
        "react.dev", "tailwindcss.com", "linkedin.com", "nytimes.com", "bbc.co.uk",
        "mit.edu", "stanford.edu", "harvard.edu", "coursera.org", "edx.org",
        "mozilla.org", "cloudflare.com", "npmjs.com", "pypi.org", "docker.com",
        "kubernetes.io", "postgresql.org", "sqlite.org", "ubuntu.com", "debian.org",
        "vercel.com", "netlify.com", "stripe.com", "shopify.com", "atlassian.com",
        "slack.com", "zoom.us", "notion.so", "figma.com", "canva.com", "medium.com"
    ]

    legit_paths = [
        "", "/", "/about", "/docs", "/documentation/getting-started", "/pricing",
        "/blog/2025/machine-learning-best-practices", "/products/cloud-compute",
        "/users/profile", "/search?q=python+tutorial", "/articles/cybersecurity-guide",
        "/repos/organization/project-name", "/help/contact-us", "/careers/engineering",
        "/news/technology-updates", "/community/discussions", "/learn/courses/ai-ml",
        "/api/v2/reference", "/downloads/latest", "/legal/privacy-policy"
    ]

    phish_brands = [
        "paypal", "appleid", "microsoft", "amazon", "netflix", "chase", "wellsfargo",
        "citibank", "binance", "coinbase", "metamask", "steam", "instagram", "facebook",
        "linkedin", "dropbox", "docusign", "icloud", "outlook", "office365"
    ]

    phish_words = [
        "login", "verify", "verification", "account", "secure", "security",
        "update", "password", "bank", "confirm", "signin", "authenticate",
        "wallet", "payment", "recover", "unlock", "suspend", "alert", "billing"
    ]

    suspicious_tlds = ["xyz", "tk", "ml", "ga", "cf", "gq", "top", "click", "link", "pw", "work", "loan", "zip"]
    common_tlds = ["com", "net", "org", "info", "co", "online", "site"]

    rows = []

    # 1. Standard Legitimate URLs (label = 0)
    for _ in range(int(num_samples * 0.36)):
        dom = rng.choice(legit_domains)
        path = rng.choice(legit_paths)
        sub = rng.choice(["", "www.", "docs.", "blog.", "developer.", "support."])
        scheme = "https://" if rng.random() < 0.92 else "http://"
        suffix = f"/{rng.randint(10, 9999)}" if rng.random() < 0.4 else ""
        url = f"{scheme}{sub}{dom}{path}{suffix}"
        rows.append((url, 0))

    # 2. Complex Legitimate URLs with auth/account paths or hyphens (label = 0)
    # Linear models often misclassify these as phishing unless non-linear tree splits check domain entropy & TLD
    for i in range(int(num_samples * 0.14)):
        dom = rng.choice(legit_domains)
        case = i % 4
        if case == 0:
            url = f"https://auth.{dom}/login/verify?client_id={rng.randint(1000,9999)}&redirect_uri=/account"
        elif case == 1:
            url = f"https://my-account-portal.{dom}/security/update-password/step-{rng.randint(1,5)}"
        elif case == 2:
            url = f"http://legacy-docs.{dom}/kb/article-{rng.randint(100,999)}-account-confirm-guide.html"
        else:
            url = f"https://www.{dom}/checkout/payment-confirm?order={rng.randint(10000,99999)}&status=secure"
        rows.append((url, 0))

    # 3. Standard Phishing URLs (label = 1)
    for _ in range(int(num_samples * 0.36)):
        brand = rng.choice(phish_brands)
        w1, w2 = rng.sample(phish_words, 2)
        tld = rng.choice(suspicious_tlds if rng.random() < 0.65 else common_tlds)
        scheme = "http://" if rng.random() < 0.6 else "https://"
        style = rng.choice(["hyphen_spoof", "subdomain_spoof", "ip_phish", "at_redirect", "long_obfuscated"])

        if style == "hyphen_spoof":
            url = f"{scheme}{brand}-{w1}-{w2}-{rng.randint(10,999)}.{tld}/{w1}/index.php?id={rng.randint(10000,99999)}"
        elif style == "subdomain_spoof":
            url = f"{scheme}{brand}.com.{w1}.{w2}-portal.{tld}/auth/{w1}?token={rng.randint(100000,999999)}"
        elif style == "ip_phish":
            ip = f"{rng.randint(11,220)}.{rng.randint(0,255)}.{rng.randint(0,255)}.{rng.randint(1,254)}"
            url = f"http://{ip}/{brand}/{w1}/verify.html"
        elif style == "at_redirect":
            url = f"{scheme}www.{brand}.com@{w1}-{w2}-srv.{tld}/signin"
        else:
            rand_hex = "".join(rng.choices("abcdef0123456789", k=14))
            url = f"{scheme}{brand}-{w1}.{tld}/account/{w2}/{rand_hex}?user=confirm&action={w1}"

        rows.append((url, 1))

    # 4. Stealthy / Borderline Phishing URLs (HTTPS, short URL or subtle typosquatting, label = 1)
    for i in range(int(num_samples * 0.14)):
        brand = rng.choice(phish_brands)
        w1 = rng.choice(phish_words)
        case = i % 4
        if case == 0:
            # Looks clean, HTTPS, no keywords, but suspicious TLD + digits
            url = f"https://{brand}{rng.randint(10,99)}.{rng.choice(suspicious_tlds)}/home"
        elif case == 1:
            # URL shortener hiding destination
            shortener = rng.choice(["bit.ly", "tinyurl.com", "rb.gy", "cutt.ly"])
            code = "".join(rng.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=7))
            url = f"https://{shortener}/{code}?ref={rng.randint(1,99)}"
        elif case == 2:
            # HTTP on normal-looking domain with 1 keyword
            url = f"http://www.{brand}support-{rng.randint(1,99)}.com/{w1}"
        else:
            # Subtle multi-dot domain without obvious keywords
            url = f"https://portal.id-{rng.randint(100,999)}.{brand}-service.net/app/session"
        rows.append((url, 1))

    # Add 2.5% label noise to simulate real-world dataset ambiguity
    noisy_rows = []
    for url, lbl in rows:
        if rng.random() < 0.025:
            lbl = 1 - lbl
        noisy_rows.append((url, lbl))

    rng.shuffle(noisy_rows)
    df = pd.DataFrame(noisy_rows, columns=["url", "label"])
    df.to_csv(csv_path, index=False)
    return df


def run_training_pipeline(force_regenerate_demo: bool = False):
    print("=" * 65)
    print("  PhishGuard - Machine Learning Training Pipeline")
    print("=" * 65)

    os.makedirs(MODELS_DIR, exist_ok=True)
    is_demo_dataset = False

    if force_regenerate_demo or not os.path.exists(DATASET_PATH):
        print(f"[1/7] Generating demonstration dataset at {DATASET_PATH}...")
        df = generate_demo_dataset(DATASET_PATH, num_samples=1800)
        is_demo_dataset = True
    else:
        print(f"[1/7] Loading dataset from {DATASET_PATH}...")
        df = pd.read_csv(DATASET_PATH)
        if len(df) <= 2500:
            is_demo_dataset = True

    initial_count = len(df)
    print(f"      Initial rows: {initial_count}")

    # Step 2: Data cleaning, missing value handling, duplicate removal
    print("[2/7] Cleaning dataset (handling missing values & removing duplicates)...")
    if "url" not in df.columns or "label" not in df.columns:
        raise ValueError("Dataset CSV must contain 'url' and 'label' columns (0=legitimate, 1=phishing).")

    df = df.dropna(subset=["url", "label"]).copy()
    df["url"] = df["url"].astype(str).str.strip()
    df = df[df["url"] != ""]
    df["label"] = pd.to_numeric(df["label"], errors="coerce")
    df = df.dropna(subset=["label"])
    df["label"] = df["label"].astype(int)
    df = df[df["label"].isin([0, 1])]
    df = df.drop_duplicates(subset=["url"]).reset_index(drop=True)

    cleaned_count = len(df)
    duplicates_removed = initial_count - cleaned_count
    legit_count = int((df["label"] == 0).sum())
    phish_count = int((df["label"] == 1).sum())
    print(f"      Cleaned rows: {cleaned_count} (Removed {duplicates_removed} duplicates/nulls)")
    print(f"      Class distribution: Legitimate (0) = {legit_count}, Phishing (1) = {phish_count}")

    # Step 3: Feature Extraction
    print(f"[3/7] Extracting {len(FEATURE_NAMES)} URL features per sample...")
    X_list = [extract_features_vector(u) for u in df["url"]]
    X = np.array(X_list, dtype=float)
    y = df["label"].values

    # Step 4: Stratified Train/Test Split
    print("[4/7] Performing stratified 80/20 train/test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    # Step 5: Feature Scaling (fit strictly on training data)
    print("[5/7] Fitting StandardScaler on training split only...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Step 6: Train & Evaluate Multiple Models
    print("[6/7] Training and evaluating candidate ML models...")
    candidate_models = {
        "Logistic Regression": LogisticRegression(C=0.5, max_iter=1000, random_state=RANDOM_SEED),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, min_samples_leaf=8, random_state=RANDOM_SEED),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_leaf=2, random_state=RANDOM_SEED, n_jobs=-1),
        "Support Vector Machine": SVC(kernel="rbf", C=0.8, probability=True, random_state=RANDOM_SEED),
    }

    if HAS_XGBOOST:
        candidate_models["XGBoost"] = XGBClassifier(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            random_state=RANDOM_SEED,
            eval_metric="logloss",
        )

    all_metrics = {}
    trained_objects = {}
    feature_importances_map = {}

    for name, clf in candidate_models.items():
        t0 = time.time()
        clf.fit(X_train_scaled, y_train)
        train_time = round(time.time() - t0, 4)

        eval_res = evaluate_classifier(clf, X_test_scaled, y_test)
        eval_res["train_time_seconds"] = train_time
        all_metrics[name] = eval_res
        trained_objects[name] = clf
        feature_importances_map[name] = extract_feature_importances(clf, FEATURE_NAMES)

        print(
            f"      - {name:<24} | F1: {eval_res['f1_score']:.4f} | "
            f"Recall: {eval_res['recall']:.4f} | Acc: {eval_res['accuracy']:.4f} | "
            f"ROC-AUC: {eval_res['roc_auc']:.4f}"
        )

    # Step 7: Automatic Model Selection by F1-score (with Recall tie-breaker)
    best_model_name = max(
        all_metrics.keys(),
        key=lambda m: (all_metrics[m]["f1_score"], all_metrics[m]["recall"], all_metrics[m]["roc_auc"]),
    )
    best_model = trained_objects[best_model_name]
    best_metrics = all_metrics[best_model_name]

    print("=" * 65)
    print(f"[7/7] Selected Best Model: {best_model_name} (F1-Score: {best_metrics['f1_score']:.4f})")
    print("=" * 65)

    # Save artifacts
    joblib.dump(best_model, os.path.join(MODELS_DIR, "best_model.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))

    for name, clf in trained_objects.items():
        slug = name.lower().replace(" ", "_")
        joblib.dump(clf, os.path.join(MODELS_DIR, f"{slug}.joblib"))

    # Use tree-based feature importances if best model has them, else Random Forest importances
    best_fi = feature_importances_map.get(best_model_name) or feature_importances_map.get("Random Forest", [])

    feature_metadata = {
        "feature_names": FEATURE_NAMES,
        "num_features": len(FEATURE_NAMES),
        "label_mapping": {"0": "legitimate", "1": "phishing"},
        "selected_model": best_model_name,
        "selection_metric": "f1_score",
        "selection_rationale": (
            "Automatically selected based on highest test F1-score with Recall priority. "
            "In phishing detection, minimizing False Negatives (maximizing Recall) is critical "
            "because missing an active phishing attack exposes users to credential theft."
        ),
        "feature_importances": best_fi,
    }

    with open(os.path.join(MODELS_DIR, "feature_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(feature_metadata, f, indent=2)

    metrics_payload = {
        "selected_model": best_model_name,
        "selection_metric": "f1_score",
        "is_demo_dataset": is_demo_dataset,
        "dataset_note": (
            "Demonstration dataset (1,800 URLs with realistic borderline cases). "
            "Replace dataset/phishing_dataset.csv with a larger real-world dataset and re-run train.py anytime."
            if is_demo_dataset
            else "Trained on supplied CSV dataset."
        ),
        "dataset_summary": {
            "total_rows": cleaned_count,
            "duplicates_removed": duplicates_removed,
            "legitimate_count": legit_count,
            "phishing_count": phish_count,
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        },
        "best_model_metrics": best_metrics,
        "models": all_metrics,
        "feature_importances": best_fi,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    with open(os.path.join(MODELS_DIR, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Saved artifacts to: {MODELS_DIR}")
    return metrics_payload


if __name__ == "__main__":
    regen = "--regen" in sys.argv
    run_training_pipeline(force_regenerate_demo=regen)
