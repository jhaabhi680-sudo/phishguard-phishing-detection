# PhishGuard – AI-Based Phishing URL Detection System

**AI/ML Mini Project (Experiment 12)**  
*Real-time URL threat intelligence, 22-feature lexical & entropy extraction, 5-model machine learning benchmark, Explainable AI (XAI), and persistent SQLite audit logging.*

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jhaabhi680-sudo/phishguard-phishing-detection)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jhaabhi680-sudo/phishguard-phishing-detection)

---

## 1. Project Overview & Problem Statement

Phishing websites mimic trusted banking, cloud, and e-commerce portals to steal user credentials and financial data. Traditional blacklist approaches fail against zero-hour phishing domains that remain active for only hours, while crawling unknown websites introduces latency and security risks.

**PhishGuard** solves this problem by performing **safe, zero-touch static URL inspection**. It extracts **22 deterministic lexical, structural, and statistical features** directly from the URL string and runs a trained Machine Learning classifier to determine whether a URL is:
- **LEGITIMATE / SAFE (`0`)**
- **PHISHING / MALICIOUS (`1`)**

Every classification includes a **0–100% Risk Score**, **Classifier Confidence**, **Model Used**, and **Explainable AI (XAI) human-readable reasons** derived from the actual extracted features.

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide React Icons, Recharts (Responsive Dark Cybersecurity UI) |
| **Backend API** | Python 3.13, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | Scikit-Learn, XGBoost, Pandas, NumPy, Joblib |
| **Database** | SQLite + SQLAlchemy ORM (`phishguard.db`) |

---

## 3. Repository Structure

```text
phishing-detection/
│
├── backend/
│   ├── main.py                 # FastAPI entry point & CORS setup
│   ├── database.py             # SQLAlchemy SQLite engine & session management
│   ├── models.py               # ScanRecord ORM model
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── requirements.txt        # Python dependencies
│   │
│   ├── api/
│   │   ├── prediction.py       # POST /api/predict
│   │   ├── history.py          # GET/POST/DELETE /api/history
│   │   └── metrics.py          # GET /api/metrics & GET /api/model-info
│   │
│   ├── features/
│   │   └── url_features.py     # 22 deterministic URL features + XAI reason generator
│   │
│   ├── ml/
│   │   ├── train.py            # End-to-end preprocessing, training & model selection
│   │   ├── predict.py          # Real-time inference & risk score calculation
│   │   └── evaluate.py         # Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
│   │
│   └── models/                 # Saved Joblib models, scaler, feature metadata & metrics.json
│
├── frontend/
│   ├── index.html              # App shell with Tailwind CSS & ESM import map
│   ├── dev-server.mjs          # Node.js development server (port 5173) with /api proxy
│   ├── package.json            # Frontend package manifest
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/         # Navbar.jsx, Footer.jsx, ResultCard.jsx
│       ├── pages/              # Home.jsx, Scanner.jsx, Dashboard.jsx, History.jsx, About.jsx
│       ├── services/           # api.js (REST client)
│       └── hooks/              # useScanner.js
│
├── dataset/
│   └── phishing_dataset.csv    # Labeled URL dataset (url, label)
│
├── notebooks/
│   └── analysis.ipynb          # Exploratory Data Analysis & model benchmark notebook
│
└── README.md
```

---

## 4. URL Feature Engineering (22 Features)

Implemented in `backend/features/url_features.py`:
1. `url_length` – Total character length of the URL
2. `hostname_length` – Character length of the domain/host
3. `path_length` – Character length of the URL path
4. `num_dots` – Count of `.` characters
5. `num_hyphens` – Count of `-` characters (common in brand-spoofing domains)
6. `num_underscores` – Count of `_` characters
7. `num_slashes` – Count of `/` characters
8. `num_question_marks` – Count of `?` characters
9. `num_equals` – Count of `=` characters
10. `num_at` – Count of `@` characters (credential/redirect obfuscation)
11. `num_ampersands` – Count of `&` characters
12. `num_digits` – Total numeric characters in the URL
13. `num_special_chars` – Total non-alphanumeric special delimiters
14. `num_subdomains` – Subdomain nesting depth
15. `has_https` – `1` if HTTPS protocol is used, `0` otherwise
16. `has_ip_address` – `1` if hostname is a raw IPv4 address, `0` otherwise
17. `is_shortened` – `1` if domain matches known URL shorteners (`bit.ly`, `tinyurl.com`, etc.)
18. `suspicious_keyword_count` – Count of phishing keywords (`login`, `verify`, `account`, `secure`, `bank`, `update`, `password`, `confirm`, `signin`, `wallet`, `payment`, etc.)
19. `has_suspicious_keyword` – Binary indicator of suspicious keyword presence
20. `domain_entropy` – Shannon entropy of the hostname (detects random DGA/spoofed strings)
21. `digit_ratio` – Ratio of digits to total URL length
22. `longest_token_length` – Length of the longest contiguous token in the URL

---

## 5. Machine Learning Pipeline & Model Comparison

Running `python backend/ml/train.py` executes:
1. **Data Cleaning**: Strips whitespace, drops missing values, removes duplicate URLs, and validates binary labels (`0` = legitimate, `1` = phishing).
2. **Stratified Train/Test Split**: 80% training (`1,421` samples) / 20% testing (`356` samples) with `random_state=42`.
3. **Feature Scaling**: Fits `StandardScaler` on training features and serializes `scaler.joblib`.
4. **Multi-Model Training & Evaluation**:

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Selected Best)** | **97.47%** | **97.25%** | **97.79%** | **97.52%** | **97.55%** |
| **Random Forest** | 97.47% | 97.25% | 97.79% | 97.52% | 97.24% |
| **Support Vector Machine (RBF)** | 97.47% | 97.25% | 97.79% | 97.52% | 97.14% |
| **Logistic Regression** | 96.63% | 97.21% | 96.13% | 96.67% | 97.55% |
| **Decision Tree** | 96.35% | 96.65% | 96.13% | 96.38% | 96.69% |

> **Dataset Transparency Note:** If no external CSV is supplied, `train.py` generates a realistic labeled demonstration dataset (`dataset/phishing_dataset.csv`, 1,777 unique URLs) clearly flagged as demonstration data (`is_demo_dataset: true`). You can train on any real-world CSV dataset (`url,label`) via `python backend/ml/train.py --data path/to/dataset.csv`.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and model loaded status |
| `POST` | `/api/predict` | Analyze a URL, return prediction, risk score, reasons, features & log to SQLite |
| `GET` | `/api/history` | Retrieve paginated SQLite scan history & summary counts |
| `POST` | `/api/history` | Manually store a scan result record in SQLite |
| `DELETE` | `/api/history` | Clear all scan history records from SQLite |
| `GET` | `/api/metrics` | Return real trained model metrics, confusion matrices, and feature importances |
| `GET` | `/api/model-info` | Return selected model metadata and feature list |

---

## 7. How to Run the Project

### Step 1: Train Models (Optional – Pre-trained models are already included)
```powershell
python backend/ml/train.py
```

### Step 2: Start the FastAPI Backend Server (Port 8000)
```powershell
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 3: Start the React Frontend Server (Port 5173)
```powershell
cd frontend
node dev-server.mjs
```
Then open **http://localhost:5173** in your browser.
