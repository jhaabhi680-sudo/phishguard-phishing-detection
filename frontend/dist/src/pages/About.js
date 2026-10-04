import React from 'react';
import { Shield, BookOpen, Cpu, Database, Layers, CheckCircle2, AlertTriangle, Compass, Code2, Workflow, Award, ArrowRight } from 'lucide-react';
export default function About({
  onNavigate
}) {
  const modelsList = [{
    name: 'Logistic Regression',
    role: 'Linear Baseline Classifier',
    desc: 'Models the log-odds probability of a URL being malicious using L2-regularized linear combinations of scaled lexical features.'
  }, {
    name: 'Decision Tree',
    role: 'Non-Linear Rule Induction',
    desc: 'Recursively partitions URL features using Gini impurity to learn interpretable hierarchical thresholds (e.g., URL length & keyword count).'
  }, {
    name: 'Random Forest',
    role: 'Bagged Decision Ensemble',
    desc: 'Aggregates 150 decorrelated decision trees trained on bootstrapped samples to reduce variance and prevent overfitting.'
  }, {
    name: 'Support Vector Machine (RBF)',
    role: 'Maximum-Margin Kernel Classifier',
    desc: 'Projects standardized 22-dimensional URL feature vectors into a higher-dimensional space to separate subtle spoofing patterns.'
  }, {
    name: 'XGBoost',
    role: 'Gradient Boosted Decision Trees',
    desc: 'Sequentially builds trees that minimize second-order gradients of log-loss, achieving top F1 and ROC-AUC performance.'
  }];
  const featureGroups = [{
    category: 'Length & Structural Proportions',
    items: ['Full URL Length', 'Hostname Length', 'Path Length', 'Longest Token Length', 'Digit-to-Length Ratio']
  }, {
    category: 'Lexical & Delimiter Counts',
    items: ['Dot Count (.)', 'Hyphen Count (-)', 'Underscore Count (_)', 'Slash (/), Question (?), Equals (=), Ampersand (&)', 'At Symbol (@) & Special Char Count']
  }, {
    category: 'Network & Domain Anomalies',
    items: ['HTTPS Protocol Check', 'Raw IPv4 Hostname Detection', 'Subdomain Depth', 'URL Shortener Service Match', 'Port Number in Host']
  }, {
    category: 'Semantic & Information Theory',
    items: ['Suspicious Keyword Count (login, verify, bank, etc.)', 'Keyword Presence Flag', 'Shannon Entropy of Domain Name']
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800/90 shadow-xl relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider"
  }, /*#__PURE__*/React.createElement(Award, {
    className: "w-3.5 h-3.5 text-cyan-400"
  }), "AI / ML Mini Project (Experiment 12)"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
  }, "PhishGuard \u2013 AI-Based Phishing URL Detection System"), /*#__PURE__*/React.createElement("p", {
    className: "text-base text-slate-300 leading-relaxed"
  }, "An end-to-end machine learning cybersecurity application that classifies website URLs as", ' ', /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-semibold"
  }, "Legitimate (Safe)"), " or", ' ', /*#__PURE__*/React.createElement("span", {
    className: "text-rose-400 font-semibold"
  }, "Phishing (Malicious)"), " in real time using 22 deterministic lexical, structural, and statistical URL features."))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "w-5 h-5 text-rose-400"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white"
  }, "1. Problem Statement")), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-300 leading-relaxed"
  }, "Phishing attacks remain the primary initial access vector for credential theft and financial fraud. Traditional blacklist-based browsers fail to block zero-hour phishing domains that are registered and deployed within minutes."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-400 leading-relaxed"
  }, "Furthermore, server-side page crawling introduces latency and exposes security scanners to drive-by exploits. There is a critical need for a fast, zero-touch, explainable machine learning classifier that inspects only the URL string to detect malicious intent before a connection is ever made.")), /*#__PURE__*/React.createElement("div", {
    className: "p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(CheckCircle2, {
    className: "w-5 h-5 text-cyan-400"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white"
  }, "2. Project Objectives")), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2.5 text-sm text-slate-300"
  }, /*#__PURE__*/React.createElement("li", {
    className: "flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"
  }), /*#__PURE__*/React.createElement("span", null, "Engineer 22 deterministic lexical, host, and entropy features directly from raw URL strings without visiting target websites.")), /*#__PURE__*/React.createElement("li", {
    className: "flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"
  }), /*#__PURE__*/React.createElement("span", null, "Train, evaluate, and benchmark five distinct supervised ML classifiers using Accuracy, Precision, Recall, F1-Score, and ROC-AUC.")), /*#__PURE__*/React.createElement("li", {
    className: "flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"
  }), /*#__PURE__*/React.createElement("span", null, "Prioritize high Recall and F1-score to minimize dangerous false negatives in phishing detection.")), /*#__PURE__*/React.createElement("li", {
    className: "flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"
  }), /*#__PURE__*/React.createElement("span", null, "Provide human-readable Explainable AI (XAI) risk reasons for every prediction alongside persistent SQLite audit logging."))))), /*#__PURE__*/React.createElement("div", {
    className: "p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Workflow, {
    className: "w-5 h-5 text-indigo-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white"
  }, "3. End-to-End ML System Architecture"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "From dataset preprocessing and model serialization to real-time REST API inference"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, [{
    step: 'Stage 01',
    title: 'Data Preprocessing',
    desc: 'URL normalization, duplicate removal, missing value handling, and stratified 80/20 train-test split (random_state=42).'
  }, {
    step: 'Stage 02',
    title: 'Feature Engineering',
    desc: 'Extraction of 22 lexical, delimiter, subdomain, HTTPS, IP address, keyword, and Shannon entropy features.'
  }, {
    step: 'Stage 03',
    title: 'Multi-Model Training',
    desc: 'StandardScaler fitting and training of Logistic Regression, Decision Tree, Random Forest, SVM, and XGBoost.'
  }, {
    step: 'Stage 04',
    title: 'FastAPI & Explainable UI',
    desc: 'Best model serialized via Joblib, served over FastAPI with SQLite persistence and Recharts visual analytics.'
  }].map(stage => /*#__PURE__*/React.createElement("div", {
    key: stage.step,
    className: "p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-bold uppercase tracking-wider text-cyan-400"
  }, stage.step), /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-bold text-white"
  }, stage.title), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 leading-relaxed"
  }, stage.desc))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Layers, {
    className: "w-5 h-5 text-emerald-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white"
  }, "4. URL Feature Engineering (22 Features)"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Implemented in ", /*#__PURE__*/React.createElement("code", {
    className: "text-cyan-300 font-mono"
  }, "backend/features/url_features.py")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, featureGroups.map(group => /*#__PURE__*/React.createElement("div", {
    key: group.category,
    className: "p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-bold text-cyan-300 mb-3"
  }, group.category), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1.5 text-xs text-slate-300"
  }, group.items.map(item => /*#__PURE__*/React.createElement("li", {
    key: item,
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-slate-600"
  }), item))))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Cpu, {
    className: "w-5 h-5 text-cyan-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white"
  }, "5. Machine Learning Algorithms Compared"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Implemented in ", /*#__PURE__*/React.createElement("code", {
    className: "text-cyan-300 font-mono"
  }, "backend/ml/train.py"), " and ", /*#__PURE__*/React.createElement("code", {
    className: "text-cyan-300 font-mono"
  }, "backend/ml/evaluate.py")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
  }, modelsList.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.name,
    className: "p-5 rounded-2xl bg-slate-900/75 border border-slate-800/90 flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-semibold text-cyan-400 uppercase tracking-wider"
  }, m.role), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white mt-1 mb-2"
  }, m.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 leading-relaxed"
  }, m.desc)))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 text-white font-bold text-base"
  }, /*#__PURE__*/React.createElement(Code2, {
    className: "w-5 h-5 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, "6. Technology Stack")), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2 text-xs text-slate-300"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, "Frontend:"), " React 18, Tailwind CSS, Lucide Icons, Recharts"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, "Backend API:"), " Python, FastAPI, Uvicorn, Pydantic"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, "ML Pipeline:"), " Scikit-Learn, XGBoost, Pandas, NumPy, Joblib"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, "Database:"), " SQLite with SQLAlchemy ORM"))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 text-white font-bold text-base"
  }, /*#__PURE__*/React.createElement(Database, {
    className: "w-5 h-5 text-amber-400"
  }), /*#__PURE__*/React.createElement("span", null, "7. Dataset & Limitations")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 leading-relaxed"
  }, "The repository ships with a curated, labeled synthetic benchmark dataset of 1,777 unique URLs so the system runs out-of-the-box, while supporting any external PhishTank or Kaggle CSV dataset via ", /*#__PURE__*/React.createElement("code", {
    className: "text-cyan-300"
  }, "--data"), "."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 leading-relaxed"
  }, /*#__PURE__*/React.createElement("strong", null, "Limitation:"), " Because analysis is strictly static on the URL string for safety and speed, compromised legitimate domains hosting phishing pages on clean paths may require DOM or WHOIS inspection.")), /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 text-white font-bold text-base"
  }, /*#__PURE__*/React.createElement(Compass, {
    className: "w-5 h-5 text-emerald-400"
  }), /*#__PURE__*/React.createElement("span", null, "8. Future Scope")), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2 text-xs text-slate-300"
  }, /*#__PURE__*/React.createElement("li", null, "\u2022 Integration of passive DNS / WHOIS domain age lookup"), /*#__PURE__*/React.createElement("li", null, "\u2022 Browser extension for real-time link hover protection"), /*#__PURE__*/React.createElement("li", null, "\u2022 Character-level 1D-CNN / Transformer embeddings alongside lexical features"), /*#__PURE__*/React.createElement("li", null, "\u2022 Visual similarity detection against top targeted brand logos")))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "Ready to test the trained ML model?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Try scanning custom URLs or explore model evaluation metrics in the Dashboard.")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('scanner'),
    className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
  }, "Open URL Scanner", /*#__PURE__*/React.createElement(ArrowRight, {
    className: "w-4 h-4"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('dashboard'),
    className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
  }, "View ML Dashboard"))));
}