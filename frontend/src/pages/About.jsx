import React from 'react';
import {
  Shield,
  BookOpen,
  Cpu,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Code2,
  Workflow,
  Award,
  ArrowRight
} from 'lucide-react';

export default function About({ onNavigate }) {
  const modelsList = [
    {
      name: 'Logistic Regression',
      role: 'Linear Baseline Classifier',
      desc: 'Models the log-odds probability of a URL being malicious using L2-regularized linear combinations of scaled lexical features.'
    },
    {
      name: 'Decision Tree',
      role: 'Non-Linear Rule Induction',
      desc: 'Recursively partitions URL features using Gini impurity to learn interpretable hierarchical thresholds (e.g., URL length & keyword count).'
    },
    {
      name: 'Random Forest',
      role: 'Bagged Decision Ensemble',
      desc: 'Aggregates 150 decorrelated decision trees trained on bootstrapped samples to reduce variance and prevent overfitting.'
    },
    {
      name: 'Support Vector Machine (RBF)',
      role: 'Maximum-Margin Kernel Classifier',
      desc: 'Projects standardized 22-dimensional URL feature vectors into a higher-dimensional space to separate subtle spoofing patterns.'
    },
    {
      name: 'XGBoost',
      role: 'Gradient Boosted Decision Trees',
      desc: 'Sequentially builds trees that minimize second-order gradients of log-loss, achieving top F1 and ROC-AUC performance.'
    }
  ];

  const featureGroups = [
    {
      category: 'Length & Structural Proportions',
      items: ['Full URL Length', 'Hostname Length', 'Path Length', 'Longest Token Length', 'Digit-to-Length Ratio']
    },
    {
      category: 'Lexical & Delimiter Counts',
      items: ['Dot Count (.)', 'Hyphen Count (-)', 'Underscore Count (_)', 'Slash (/), Question (?), Equals (=), Ampersand (&)', 'At Symbol (@) & Special Char Count']
    },
    {
      category: 'Network & Domain Anomalies',
      items: ['HTTPS Protocol Check', 'Raw IPv4 Hostname Detection', 'Subdomain Depth', 'URL Shortener Service Match', 'Port Number in Host']
    },
    {
      category: 'Semantic & Information Theory',
      items: ['Suspicious Keyword Count (login, verify, bank, etc.)', 'Keyword Presence Flag', 'Shannon Entropy of Domain Name']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800/90 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            AI / ML Mini Project (Experiment 12)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PhishGuard – AI-Based Phishing URL Detection System
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            An end-to-end machine learning cybersecurity application that classifies website URLs as{' '}
            <span className="text-emerald-400 font-semibold">Legitimate (Safe)</span> or{' '}
            <span className="text-rose-400 font-semibold">Phishing (Malicious)</span> in real time using 22 deterministic lexical, structural, and statistical URL features.
          </p>
        </div>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">1. Problem Statement</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Phishing attacks remain the primary initial access vector for credential theft and financial fraud. Traditional blacklist-based browsers fail to block zero-hour phishing domains that are registered and deployed within minutes.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Furthermore, server-side page crawling introduces latency and exposes security scanners to drive-by exploits. There is a critical need for a fast, zero-touch, explainable machine learning classifier that inspects only the URL string to detect malicious intent before a connection is ever made.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">2. Project Objectives</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>Engineer 22 deterministic lexical, host, and entropy features directly from raw URL strings without visiting target websites.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>Train, evaluate, and benchmark five distinct supervised ML classifiers using Accuracy, Precision, Recall, F1-Score, and ROC-AUC.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>Prioritize high Recall and F1-score to minimize dangerous false negatives in phishing detection.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>Provide human-readable Explainable AI (XAI) risk reasons for every prediction alongside persistent SQLite audit logging.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* System Architecture Pipeline */}
      <div className="p-7 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">3. End-to-End ML System Architecture</h2>
            <p className="text-xs text-slate-400">From dataset preprocessing and model serialization to real-time REST API inference</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: 'Stage 01',
              title: 'Data Preprocessing',
              desc: 'URL normalization, duplicate removal, missing value handling, and stratified 80/20 train-test split (random_state=42).'
            },
            {
              step: 'Stage 02',
              title: 'Feature Engineering',
              desc: 'Extraction of 22 lexical, delimiter, subdomain, HTTPS, IP address, keyword, and Shannon entropy features.'
            },
            {
              step: 'Stage 03',
              title: 'Multi-Model Training',
              desc: 'StandardScaler fitting and training of Logistic Regression, Decision Tree, Random Forest, SVM, and XGBoost.'
            },
            {
              step: 'Stage 04',
              title: 'FastAPI & Explainable UI',
              desc: 'Best model serialized via Joblib, served over FastAPI with SQLite persistence and Recharts visual analytics.'
            }
          ].map((stage) => (
            <div key={stage.step} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{stage.step}</span>
              <h3 className="text-sm font-bold text-white">{stage.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Engineering Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">4. URL Feature Engineering (22 Features)</h2>
            <p className="text-xs text-slate-400">Implemented in <code className="text-cyan-300 font-mono">backend/features/url_features.py</code></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureGroups.map((group) => (
            <div key={group.category} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
              <h3 className="text-sm font-bold text-cyan-300 mb-3">{group.category}</h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Learning Models Compared */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">5. Machine Learning Algorithms Compared</h2>
            <p className="text-xs text-slate-400">Implemented in <code className="text-cyan-300 font-mono">backend/ml/train.py</code> and <code className="text-cyan-300 font-mono">backend/ml/evaluate.py</code></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {modelsList.map((m) => (
            <div key={m.name} className="p-5 rounded-2xl bg-slate-900/75 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">{m.role}</span>
                <h3 className="text-base font-bold text-white mt-1 mb-2">{m.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack, Limitations & Future Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span>6. Technology Stack</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><strong className="text-white">Frontend:</strong> React 18, Tailwind CSS, Lucide Icons, Recharts</li>
            <li><strong className="text-white">Backend API:</strong> Python, FastAPI, Uvicorn, Pydantic</li>
            <li><strong className="text-white">ML Pipeline:</strong> Scikit-Learn, XGBoost, Pandas, NumPy, Joblib</li>
            <li><strong className="text-white">Database:</strong> SQLite with SQLAlchemy ORM</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Database className="w-5 h-5 text-amber-400" />
            <span>7. Dataset & Limitations</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The repository ships with a curated, labeled synthetic benchmark dataset of 1,777 unique URLs so the system runs out-of-the-box, while supporting any external PhishTank or Kaggle CSV dataset via <code className="text-cyan-300">--data</code>.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Limitation:</strong> Because analysis is strictly static on the URL string for safety and speed, compromised legitimate domains hosting phishing pages on clean paths may require DOM or WHOIS inspection.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/75 border border-slate-800/90 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>8. Future Scope</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Integration of passive DNS / WHOIS domain age lookup</li>
            <li>• Browser extension for real-time link hover protection</li>
            <li>• Character-level 1D-CNN / Transformer embeddings alongside lexical features</li>
            <li>• Visual similarity detection against top targeted brand logos</li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Ready to test the trained ML model?</h3>
          <p className="text-xs text-slate-400">Try scanning custom URLs or explore model evaluation metrics in the Dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            Open URL Scanner
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            View ML Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
