"""
app.py
B.Tech AIML Mini Project (Experiment 12)
Project Title: AI-Based Phishing Website Detection & Classification System
"""

import os
import sys
import json
import time
from flask import Flask, render_template, request, jsonify, redirect, url_for
import warnings
warnings.filterwarnings('ignore')

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from predict import predict_url, validate_url, CASE_STUDY_URL, CASE_STUDY_CONTEXT

app = Flask(__name__)
app.config['SECRET_KEY'] = 'aiml-miniproject-exp12-2026'

# ---------------------------------------------------------------------------
# Helpers for loading metrics and dataset metadata safely
# ---------------------------------------------------------------------------

def load_model_metrics():
    """Load pre-computed model metrics from JSON file safely."""
    metrics_path = os.path.join('models', 'metrics.json')
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None
    return None


def get_model_summary(metrics):
    """Safely extract valid model dicts, best model name, and F1 score."""
    if not metrics:
        return {}, None, None

    valid_models = {k: v for k, v in metrics.items() if isinstance(v, dict)}
    if not valid_models:
        return {}, None, None

    best_name = metrics.get('_best_model')
    if not best_name or best_name not in valid_models:
        best_name = max(valid_models, key=lambda k: valid_models[k].get('f1', 0))

    best_f1 = valid_models[best_name].get('f1', 0)
    return valid_models, best_name, best_f1


def load_dataset_info():
    """Load dataset specifications from JSON or return defaults."""
    info_path = os.path.join('models', 'dataset_info.json')
    if os.path.exists(info_path):
        try:
            with open(info_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass

    return {
        'name': 'PhiUSIIL Phishing URL (Website) Dataset',
        'source': 'UCI Machine Learning Repository',
        'url': 'https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset',
        'total_records': 235795,
        'total_features': 54,
        'phishing_count': 100945,
        'legitimate_count': 134850,
        'phishing_pct': 42.8,
        'legitimate_pct': 57.2,
    }


def get_plots_info():
    """Return available plot filenames."""
    plot_dir = os.path.join('static', 'plots')
    plots = {}
    plot_files = [
        'class_distribution', 'url_length_distribution', 'domain_length_distribution',
        'https_distribution', 'subdomains_distribution', 'correlation_heatmap',
        'roc_curves', 'pr_curves', 'model_comparison',
    ]
    for pf in plot_files:
        fname = f'{pf}.png'
        if os.path.exists(os.path.join(plot_dir, fname)):
            plots[pf] = f'plots/{fname}'
    return plots


# ---------------------------------------------------------------------------
# College Mini Project Routes (Exp 12)
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    """1. Overview & Problem Statement: Explains problem, solution, dataset, and group info."""
    model_trained = os.path.exists(os.path.join('models', 'final_model.pkl'))
    dataset_info = load_dataset_info()
    metrics = load_model_metrics()
    models_dict, best_model, best_f1 = get_model_summary(metrics)

    return render_template(
        'index.html',
        model_trained=model_trained,
        dataset_info=dataset_info,
        best_model=best_model,
        best_f1=best_f1,
        models_count=len(models_dict) if models_dict else 5
    )


@app.route('/demonstration', methods=['GET', 'POST'])
@app.route('/analyze', methods=['GET', 'POST'])
def demonstration():
    """
    2. Final Result & Model Demonstration:
    Demonstrates what the model does (Binary Classification: Phishing vs Legitimate),
    shows actual prediction output, and explains whether classification is successful.
    """
    result = None
    error = None

    if request.method == 'POST':
        url = request.form.get('url', '').strip()
        if not url:
            error = 'Please enter or select a URL to test the model.'
        else:
            model_path = os.path.join('models', 'final_model.pkl')
            if not os.path.exists(model_path):
                error = 'Model artifacts not found. Please train models first.'
            else:
                result = predict_url(url)
                if result.get('error'):
                    error = result['error']
                    result = None

    return render_template('demonstration.html', result=result, error=error)


@app.route('/preprocessing')
def preprocessing():
    """
    3. Data Preprocessing & Visualizations (EDA):
    Demonstrates data cleaning, feature engineering, scaling, and distribution plots.
    """
    dataset_info = load_dataset_info()
    plots = get_plots_info()
    return render_template('preprocessing.html', dataset_info=dataset_info, plots=plots)


@app.route('/performance')
def performance():
    """
    4. Model Development & Comparison:
    Compares LR, Decision Tree, Random Forest, Gradient Boosting, XGBoost.
    Shows evaluation metrics, ROC-AUC, and Confusion Matrices.
    """
    raw_metrics = load_model_metrics()
    models_dict, best_model, best_f1 = get_model_summary(raw_metrics)
    plots = get_plots_info()
    model_trained = os.path.exists(os.path.join('models', 'final_model.pkl'))

    # Load confusion matrix and feature importance images
    cm_plots = {}
    fi_plots = {}
    plot_dir = os.path.join('static', 'plots')
    if models_dict:
        for model_name in models_dict.keys():
            clean_slug = model_name.replace(" ", "_").lower()
            cm_fname = f'cm_{clean_slug}.png'
            fi_fname = f'feature_importance_{clean_slug}.png'
            if os.path.exists(os.path.join(plot_dir, cm_fname)):
                cm_plots[model_name] = f'plots/{cm_fname}'
            if os.path.exists(os.path.join(plot_dir, fi_fname)):
                fi_plots[model_name] = f'plots/{fi_fname}'

    return render_template(
        'performance.html',
        metrics=raw_metrics,
        models_dict=models_dict,
        best_model=best_model,
        best_f1=best_f1,
        plots=plots,
        cm_plots=cm_plots,
        fi_plots=fi_plots,
        model_trained=model_trained
    )


@app.route('/report')
@app.route('/about')
@app.route('/case-study')
def report():
    """
    5. Academic Report & Viva Summary:
    Directly answers all criteria from the Experiment 12 rubric.
    """
    dataset_info = load_dataset_info()
    model_path = os.path.join('models', 'final_model.pkl')
    case_result = None
    if os.path.exists(model_path):
        case_result = predict_url(CASE_STUDY_URL)

    return render_template(
        'report.html',
        dataset_info=dataset_info,
        case_result=case_result,
        case_url=CASE_STUDY_URL,
        context=CASE_STUDY_CONTEXT
    )


# ---------------------------------------------------------------------------
# Lightweight API Endpoint for Live Demonstration
# ---------------------------------------------------------------------------

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    """API endpoint used for live in-page demo."""
    data = request.get_json(silent=True)
    if not data or 'url' not in data:
        return jsonify({'status': 'error', 'error': 'Missing URL parameter.'}), 400

    url = str(data['url']).strip()
    if not url:
        return jsonify({'status': 'error', 'error': 'URL cannot be empty.'}), 400

    result = predict_url(url)
    result.pop('_model', None)
    result['status'] = 'success'
    return jsonify(result)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  AIML Mini Project (Experiment 12) — Web Interface")
    print("  AI-Based Phishing Website Detection System")
    print("="*60)
    print("  Access at: http://127.0.0.1:5000")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
