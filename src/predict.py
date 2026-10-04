"""
predict.py
Prediction pipeline for the Phishing URL Detection System.
Loads the trained model, extracts features, and generates risk analysis.
"""

import os
import re
import joblib
import numpy as np
import pandas as pd
from urllib.parse import urlparse
import warnings
warnings.filterwarnings('ignore')

# Import feature engineering
import sys
sys.path.insert(0, os.path.dirname(__file__))
from feature_engineering import extract_url_features, get_interpretable_features, FEATURE_EXPLANATIONS


MODEL_PATH = os.path.join('models', 'final_model.pkl')
SCALER_PATH = os.path.join('models', 'scaler.pkl')
FEATURE_NAMES_PATH = os.path.join('models', 'feature_names.pkl')


def validate_url(url: str) -> tuple:
    """
    Validate that the input is a properly formatted URL.
    Returns (is_valid: bool, cleaned_url: str, error_message: str)
    """
    if not url or not isinstance(url, str):
        return False, '', 'Please enter a URL.'

    url = url.strip()
    if not url:
        return False, '', 'URL cannot be empty.'

    # Add scheme if missing
    if not url.startswith(('http://', 'https://', 'ftp://')):
        url = 'http://' + url

    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            return False, '', 'Invalid URL: No domain found.'
        # Basic domain validation
        domain = parsed.netloc.split(':')[0]
        if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9.\-]*[a-zA-Z0-9]$', domain) and '.' not in domain:
            return False, '', 'Invalid domain name.'
        return True, url, ''
    except Exception as e:
        return False, '', f'URL parsing error: {str(e)}'


_ARTIFACTS_CACHE = None

def load_artifacts():
    """
    Load the trained model, scaler, and feature names from disk (cached in memory).
    Returns (model, scaler, feature_names) or raises FileNotFoundError.
    """
    global _ARTIFACTS_CACHE
    if _ARTIFACTS_CACHE is not None:
        return _ARTIFACTS_CACHE

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f'Trained model not found at {MODEL_PATH}. '
            f'Please run training first: python src/train.py'
        )

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    feature_names = joblib.load(FEATURE_NAMES_PATH) if os.path.exists(FEATURE_NAMES_PATH) else None

    _ARTIFACTS_CACHE = (model, scaler, feature_names)
    return _ARTIFACTS_CACHE


def build_feature_vector(url: str, feature_names: list) -> np.ndarray:
    """
    Build a feature vector for the URL that matches the training feature set.
    Features not available from static URL analysis are set to 0 (safe default).
    """
    # Extract features from URL
    url_features = extract_url_features(url)

    # Build a row matching the training feature names exactly
    row = {}
    for feat in feature_names:
        row[feat] = url_features.get(feat, 0)  # Default to 0 if not available

    return np.array([list(row.values())])


def calculate_risk_score(probability: float, interpretable: dict) -> float:
    """
    Calculate an adjusted risk score combining model probability with
    URL heuristic signals. Score ranges from 0 to 100.

    Base: model probability * 100
    Adjusted by: suspicious keywords, IP address, no HTTPS, many subdomains, etc.
    """
    base_score = probability * 100

    # Heuristic adjustments (bounded to not exceed 100)
    adjustments = 0
    if not interpretable.get('has_https', True):
        adjustments += 5
    if interpretable.get('num_subdomains', 0) > 3:
        adjustments += 3
    if interpretable.get('has_suspicious_keywords', False):
        adjustments += 5
    if interpretable.get('has_bank_keywords', False) and not interpretable.get('has_https', True):
        adjustments += 7
    if interpretable.get('num_at_signs', 0) > 0:
        adjustments += 8
    if interpretable.get('has_obfuscation', False):
        adjustments += 5
    if interpretable.get('url_length', 0) > 200:
        adjustments += 3

    # If model says legitimate, adjustments reduce score instead
    if probability < 0.5:
        adjustments = -adjustments

    adjusted = base_score + adjustments
    return round(min(max(adjusted, 0), 100), 1)


def get_risk_level(risk_score: float) -> str:
    """
    Convert risk score to human-readable risk level.
    """
    if risk_score >= 75:
        return 'HIGH'
    elif risk_score >= 45:
        return 'MEDIUM'
    else:
        return 'LOW'


def get_top_contributing_factors(interpretable: dict, is_phishing: bool) -> list:
    """
    Return a list of human-readable top contributing factors for the prediction.
    This is explainable AI at the feature level.
    """
    factors = []

    if interpretable.get('url_length', 0) > 100:
        factors.append(f"High URL length ({interpretable['url_length']} characters) — obfuscation indicator")
    if interpretable.get('num_subdomains', 0) > 2:
        factors.append(f"Multiple subdomains ({interpretable['num_subdomains']}) — mimicry tactic")
    if not interpretable.get('has_https', True):
        factors.append('Missing HTTPS — insecure connection')
    if interpretable.get('has_suspicious_keywords', False):
        kws = interpretable.get('suspicious_keywords', [])
        factors.append(f"Suspicious keywords found: {', '.join(kws[:3])}")
    if interpretable.get('num_at_signs', 0) > 0:
        factors.append('@ symbol in URL — can redirect to different host')
    if interpretable.get('num_hyphens', 0) > 2:
        factors.append(f"Multiple hyphens ({interpretable['num_hyphens']}) in domain — brand mimicry")
    if interpretable.get('has_obfuscation', False):
        factors.append('URL obfuscation detected (suspicious TLD or encoding)')
    if interpretable.get('entropy', 0) > 4.5:
        factors.append(f"High URL entropy ({interpretable['entropy']:.2f}) — randomized/encoded URL")
    if interpretable.get('num_redirects', 0) > 1:
        factors.append(f"Multiple URL redirects ({interpretable['num_redirects']}) detected")
    if interpretable.get('has_bank_keywords', False):
        factors.append('Banking/finance keywords — impersonation attempt')
    if interpretable.get('has_pay_keywords', False):
        factors.append('Payment keywords — potential financial scam')
    if interpretable.get('has_crypto_keywords', False):
        factors.append('Cryptocurrency keywords — common in crypto scams')
    if interpretable.get('domain_length', 0) > 30:
        factors.append(f"Long domain name ({interpretable['domain_length']} chars) — unusual for legitimate sites")

    # If nothing suspicious found, add positive signals
    if not factors and not is_phishing:
        factors.append('Standard URL structure')
        if interpretable.get('has_https', False):
            factors.append('HTTPS enabled — encrypted connection')
        if interpretable.get('num_subdomains', 0) <= 1:
            factors.append('Clean domain structure')

    return factors[:6]  # Return top 6 factors


def get_safety_recommendation(is_phishing: bool, risk_score: float, interpretable: dict) -> str:
    """
    Generate a safety recommendation based on prediction and risk score.
    """
    if is_phishing and risk_score >= 75:
        return (
            '[HIGH RISK]: This URL has strong indicators of a phishing attack. '
            'Do NOT visit this website. Do not enter any personal, financial, or login '
            'information. Report this URL to your organization\'s IT security team.'
        )
    elif is_phishing and risk_score >= 45:
        return (
            '[MEDIUM RISK]: This URL shows several phishing indicators. '
            'Exercise extreme caution. Verify the URL with the official website directly. '
            'Do not enter sensitive information. Consider reporting this URL.'
        )
    elif is_phishing:
        return (
            '[LOW-MEDIUM RISK]: This URL has some phishing indicators but the model '
            'confidence is moderate. Proceed with caution. Verify the website authenticity '
            'before entering any information.'
        )
    elif risk_score >= 45:
        return (
            '[CAUTION]: Although this URL is predicted as legitimate, some risk indicators '
            'are present. Verify the website before sharing sensitive information.'
        )
    else:
        return (
            '[LOW RISK]: This URL appears to be legitimate based on our ML analysis. '
            'However, always verify the website identity and look for the padlock icon. '
            'This system provides AI-based risk assessment, not a guarantee of safety.'
        )


def predict_url(url: str) -> dict:
    """
    Complete prediction pipeline for a single URL.
    Returns a structured result dict for use in the web application.

    Steps:
    1. Validate URL format
    2. Extract features
    3. Apply training preprocessing
    4. Load model
    5. Generate prediction and probability
    6. Calculate risk score
    7. Generate explanation
    8. Return result
    """
    result = {
        'url': url,
        'is_valid': False,
        'prediction': None,
        'prediction_label': None,
        'probability': None,
        'confidence': None,
        'risk_score': None,
        'risk_level': None,
        'contributing_factors': [],
        'safety_recommendation': None,
        'interpretable_features': {},
        'error': None,
        'disclaimer': (
            'This is an ML-based risk assessment system for educational purposes. '
            'Results are probabilistic and should not be the sole basis for security decisions.'
        )
    }

    # Step 1: Validate URL
    is_valid, cleaned_url, error_msg = validate_url(url)
    if not is_valid:
        result['error'] = error_msg
        return result

    result['url'] = cleaned_url
    result['is_valid'] = True

    try:
        # Step 2: Load model and preprocessing artifacts
        model, scaler, feature_names = load_artifacts()

        # Step 3: Extract features
        interpretable = get_interpretable_features(cleaned_url)
        result['interpretable_features'] = interpretable

        # Step 4: Build feature vector aligned to training features
        if feature_names:
            X = build_feature_vector(cleaned_url, feature_names)
        else:
            # Fallback: use extract_url_features directly
            raw_feats = extract_url_features(cleaned_url)
            X = np.array([list(raw_feats.values())])

        # Step 5: Scale features (if scaler was used during training)
        if scaler is not None:
            try:
                X = scaler.transform(X)
            except Exception:
                pass  # If shape mismatch, skip scaling

        # Step 6: Predict
        y_pred = model.predict(X)[0]
        is_phishing = (int(y_pred) == 0)

        # Get probability
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(X)[0]
            # proba[0] = phishing probability, proba[1] = legitimate probability
            phishing_prob = proba[0]
            legit_prob = proba[1]
        else:
            phishing_prob = 0.8 if is_phishing else 0.2
            legit_prob = 1 - phishing_prob

        confidence = phishing_prob if is_phishing else legit_prob

        # Step 7: Calculate risk score
        risk_score = calculate_risk_score(phishing_prob, interpretable)

        # Step 8: Build result
        result['prediction'] = 'PHISHING' if is_phishing else 'LEGITIMATE'
        result['prediction_label'] = int(y_pred)
        result['probability'] = round(float(phishing_prob), 4)
        result['confidence'] = round(float(confidence) * 100, 1)
        result['risk_score'] = risk_score
        result['risk_level'] = get_risk_level(risk_score)
        result['contributing_factors'] = get_top_contributing_factors(interpretable, is_phishing)
        result['safety_recommendation'] = get_safety_recommendation(is_phishing, risk_score, interpretable)

    except FileNotFoundError as e:
        result['error'] = str(e)
    except Exception as e:
        result['error'] = f'Prediction error: {str(e)}'

    return result


# ---------------------------------------------------------------------------
# Case Study
# ---------------------------------------------------------------------------

CASE_STUDY_URL = 'https://secure-account-verification-example.com/login'

CASE_STUDY_CONTEXT = """
CASE STUDY: Detection of a Suspicious Login Website

Scenario:
A user receives an email claiming that their online account needs urgent verification.
The email contains the link below. The user submits it to this ML-based detection system.

IMPORTANT DISCLAIMER:
This is a simulated educational example. The domain 'secure-account-verification-example.com'
is used purely for demonstration purposes and is not claimed to be an actual malicious website.

The ML model analyzes the URL based on structural features — not live content.
"""


if __name__ == '__main__':
    # Test prediction
    test_urls = [
        'https://www.google.com',
        'http://secure-account-verification-example.com/login',
        'https://paypal-secure-update.tk/verify?user=123',
        'https://amazon.com/products',
    ]

    print("\n" + "="*60)
    print("PHISHING DETECTION — PREDICTION PIPELINE TEST")
    print("="*60)

    for url in test_urls:
        print(f"\nURL: {url}")
        result = predict_url(url)
        if result['error']:
            print(f"  Error: {result['error']}")
        else:
            print(f"  Prediction : {result['prediction']}")
            print(f"  Risk Score : {result['risk_score']}%")
            print(f"  Confidence : {result['confidence']}%")
            print(f"  Risk Level : {result['risk_level']}")
            print(f"  Top Factors: {result['contributing_factors'][:2]}")
