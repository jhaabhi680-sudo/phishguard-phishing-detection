"""
generate_demo_data.py
Generates a synthetic PhiUSIIL-format dataset for demonstration when the real
UCI dataset is not yet downloaded. Uses statistical properties similar to the
actual PhiUSIIL dataset so training and evaluation are meaningful.

Run this if you don't have the real dataset yet:
    python generate_demo_data.py

Then run training normally:
    python src/run_training.py
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

N_PHISHING = 15000
N_LEGIT = 15000
N_TOTAL = N_PHISHING + N_LEGIT

os.makedirs('data', exist_ok=True)
OUTPUT = os.path.join('data', 'PhiUSIIL_Phishing_URL_Dataset.csv')


def make_phishing(n):
    """Generate feature rows typical of phishing URLs."""
    d = {
        'URLLength':              np.random.randint(60, 250, n),
        'DomainLength':           np.random.randint(15, 60, n),
        'IsDomainIP':             np.random.choice([0, 1], n, p=[0.75, 0.25]),
        'TLDLength':              np.random.randint(2, 8, n),
        'NoOfSubDomain':          np.random.randint(1, 5, n),
        'NoOfDots':               np.random.randint(3, 10, n),
        'NoOfHyphens':            np.random.randint(2, 8, n),   # many hyphens
        'NoOfUnderLine':          np.random.randint(0, 4, n),
        'NoOfSlash':              np.random.randint(3, 10, n),
        'NoOfQmark':              np.random.randint(0, 3, n),
        'NoOfEqual':              np.random.randint(0, 5, n),
        'NoOfAnd':                np.random.randint(0, 5, n),
        'NoOfAt':                 np.random.choice([0, 1], n, p=[0.85, 0.15]),
        'NoOfOtherSpecialCharsInURL': np.random.randint(3, 15, n),
        'IsHTTPS':                np.random.choice([0, 1], n, p=[0.45, 0.55]),
        'LineOfCode':             np.random.randint(30, 150, n),
        'LargestLineLength':      np.random.randint(200, 2000, n),
        'HasTitle':               np.random.choice([0, 1], n, p=[0.2, 0.8]),
        'DomainTitleMatchScore':  np.round(np.random.uniform(0.0, 0.4, n), 3),   # low match
        'URLTitleMatchScore':     np.round(np.random.uniform(0.0, 0.4, n), 3),
        'HasFavicon':             np.random.choice([0, 1], n, p=[0.4, 0.6]),
        'Robots':                 np.random.choice([0, 1], n, p=[0.7, 0.3]),
        'IsResponsive':           np.random.choice([0, 1], n, p=[0.4, 0.6]),
        'NoOfURLRedirects':       np.random.randint(1, 6, n),
        'NoOfSelfRedirects':      np.random.randint(0, 3, n),
        'HasDescription':         np.random.choice([0, 1], n, p=[0.35, 0.65]),
        'NoOfPopup':              np.random.randint(0, 5, n),
        'NoOfiFrame':             np.random.randint(0, 4, n),
        'HasExternalFormSubmit':  np.random.choice([0, 1], n, p=[0.4, 0.6]),
        'HasSocialNet':           np.random.choice([0, 1], n, p=[0.7, 0.3]),
        'HasSubmitButton':        np.random.choice([0, 1], n, p=[0.3, 0.7]),
        'HasHiddenFields':        np.random.choice([0, 1], n, p=[0.5, 0.5]),
        'HasPasswordField':       np.random.choice([0, 1], n, p=[0.4, 0.6]),
        'Bank':                   np.random.choice([0, 1], n, p=[0.5, 0.5]),
        'Pay':                    np.random.choice([0, 1], n, p=[0.5, 0.5]),
        'Crypto':                 np.random.choice([0, 1], n, p=[0.6, 0.4]),
        'HasCopyrightInfo':       np.random.choice([0, 1], n, p=[0.6, 0.4]),
        'NoOfImage':              np.random.randint(0, 20, n),
        'NoOfCSS':                np.random.randint(0, 8, n),
        'NoOfJS':                 np.random.randint(1, 20, n),
        'NoOfSelfRef':            np.random.randint(0, 10, n),
        'NoOfEmptyRef':           np.random.randint(0, 8, n),
        'NoOfExternalRef':        np.random.randint(3, 30, n),
        'URLSimilarityIndex':     np.round(np.random.uniform(30, 80, n), 2),
        'URLCharProb':            np.round(np.random.uniform(0.02, 0.08, n), 5),
        'TLDLegitimateProb':      np.round(np.random.uniform(0.1, 0.6, n), 5),
        'SpacialCharRatioInURL':  np.round(np.random.uniform(0.04, 0.2, n), 5),
        'CharContinuationRate':   np.round(np.random.uniform(0.5, 0.95, n), 5),
        'ObfuscationRatio':       np.round(np.random.uniform(0.05, 0.5, n), 5),
        'HasObfuscation':         np.random.choice([0, 1], n, p=[0.4, 0.6]),
        'NoOfLettersInURL':       np.random.randint(20, 120, n),
        'LetterRatioInURL':       np.round(np.random.uniform(0.4, 0.7, n), 5),
        'NoOfDegitsInURL':        np.random.randint(3, 30, n),
        'DegitRatioInURL':        np.round(np.random.uniform(0.05, 0.25, n), 5),
        'NoOfEqualsInURL':        np.random.randint(0, 5, n),
        'NoOfQMarkInURL':         np.random.randint(0, 3, n),
        'NoOfAmpersandInURL':     np.random.randint(0, 5, n),
        'label':                  np.zeros(n, dtype=int),
    }
    return pd.DataFrame(d)


def make_legit(n):
    """Generate feature rows typical of legitimate URLs."""
    d = {
        'URLLength':              np.random.randint(20, 100, n),
        'DomainLength':           np.random.randint(5, 25, n),
        'IsDomainIP':             np.random.choice([0, 1], n, p=[0.99, 0.01]),
        'TLDLength':              np.random.randint(2, 4, n),
        'NoOfSubDomain':          np.random.randint(0, 2, n),
        'NoOfDots':               np.random.randint(1, 4, n),
        'NoOfHyphens':            np.random.randint(0, 2, n),
        'NoOfUnderLine':          np.random.randint(0, 1, n),
        'NoOfSlash':              np.random.randint(1, 5, n),
        'NoOfQmark':              np.random.randint(0, 1, n),
        'NoOfEqual':              np.random.randint(0, 2, n),
        'NoOfAnd':                np.random.randint(0, 2, n),
        'NoOfAt':                 np.zeros(n, dtype=int),
        'NoOfOtherSpecialCharsInURL': np.random.randint(0, 4, n),
        'IsHTTPS':                np.random.choice([0, 1], n, p=[0.05, 0.95]),
        'LineOfCode':             np.random.randint(100, 500, n),
        'LargestLineLength':      np.random.randint(500, 5000, n),
        'HasTitle':               np.random.choice([0, 1], n, p=[0.02, 0.98]),
        'DomainTitleMatchScore':  np.round(np.random.uniform(0.6, 1.0, n), 3),   # high match
        'URLTitleMatchScore':     np.round(np.random.uniform(0.6, 1.0, n), 3),
        'HasFavicon':             np.random.choice([0, 1], n, p=[0.05, 0.95]),
        'Robots':                 np.random.choice([0, 1], n, p=[0.2, 0.8]),
        'IsResponsive':           np.random.choice([0, 1], n, p=[0.1, 0.9]),
        'NoOfURLRedirects':       np.random.randint(0, 2, n),
        'NoOfSelfRedirects':      np.random.randint(0, 1, n),
        'HasDescription':         np.random.choice([0, 1], n, p=[0.05, 0.95]),
        'NoOfPopup':              np.zeros(n, dtype=int),
        'NoOfiFrame':             np.random.randint(0, 2, n),
        'HasExternalFormSubmit':  np.random.choice([0, 1], n, p=[0.9, 0.1]),
        'HasSocialNet':           np.random.choice([0, 1], n, p=[0.2, 0.8]),
        'HasSubmitButton':        np.random.choice([0, 1], n, p=[0.5, 0.5]),
        'HasHiddenFields':        np.random.choice([0, 1], n, p=[0.8, 0.2]),
        'HasPasswordField':       np.random.choice([0, 1], n, p=[0.7, 0.3]),
        'Bank':                   np.random.choice([0, 1], n, p=[0.9, 0.1]),
        'Pay':                    np.random.choice([0, 1], n, p=[0.85, 0.15]),
        'Crypto':                 np.random.choice([0, 1], n, p=[0.95, 0.05]),
        'HasCopyrightInfo':       np.random.choice([0, 1], n, p=[0.1, 0.9]),
        'NoOfImage':              np.random.randint(3, 40, n),
        'NoOfCSS':                np.random.randint(2, 15, n),
        'NoOfJS':                 np.random.randint(3, 25, n),
        'NoOfSelfRef':            np.random.randint(5, 40, n),
        'NoOfEmptyRef':           np.random.randint(0, 3, n),
        'NoOfExternalRef':        np.random.randint(0, 15, n),
        'URLSimilarityIndex':     np.round(np.random.uniform(60, 100, n), 2),
        'URLCharProb':            np.round(np.random.uniform(0.06, 0.12, n), 5),
        'TLDLegitimateProb':      np.round(np.random.uniform(0.5, 1.0, n), 5),
        'SpacialCharRatioInURL':  np.round(np.random.uniform(0.0, 0.06, n), 5),
        'CharContinuationRate':   np.round(np.random.uniform(0.7, 1.0, n), 5),
        'ObfuscationRatio':       np.round(np.random.uniform(0.0, 0.1, n), 5),
        'HasObfuscation':         np.random.choice([0, 1], n, p=[0.92, 0.08]),
        'NoOfLettersInURL':       np.random.randint(15, 60, n),
        'LetterRatioInURL':       np.round(np.random.uniform(0.6, 0.85, n), 5),
        'NoOfDegitsInURL':        np.random.randint(0, 8, n),
        'DegitRatioInURL':        np.round(np.random.uniform(0.0, 0.08, n), 5),
        'NoOfEqualsInURL':        np.random.randint(0, 2, n),
        'NoOfQMarkInURL':         np.random.randint(0, 1, n),
        'NoOfAmpersandInURL':     np.random.randint(0, 2, n),
        'label':                  np.ones(n, dtype=int),
    }
    return pd.DataFrame(d)


def main():
    print("Generating synthetic PhiUSIIL-format dataset for demonstration...")
    print(f"  Phishing samples : {N_PHISHING:,}")
    print(f"  Legitimate samples: {N_LEGIT:,}")

    df_phish = make_phishing(N_PHISHING)
    df_legit  = make_legit(N_LEGIT)

    df = pd.concat([df_phish, df_legit], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    df.to_csv(OUTPUT, index=False)
    print(f"\nDataset saved to : {OUTPUT}")
    print(f"Shape            : {df.shape}")
    print(f"Class distribution:")
    for cls, cnt in df['label'].value_counts().items():
        name = 'Legitimate' if cls == 1 else 'Phishing'
        print(f"  {name} ({cls}): {cnt:,} ({cnt/len(df)*100:.1f}%)")
    print(f"\nColumns ({len(df.columns)}): {df.columns.tolist()}")
    print("\nDone! Now run:  python src/run_training.py")


if __name__ == '__main__':
    main()
