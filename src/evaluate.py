"""
evaluate.py
Evaluation and visualization module for the Phishing URL Detection System.
Generates all evaluation plots and performance charts.
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server-side rendering
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc, precision_recall_curve
)
import warnings
warnings.filterwarnings('ignore')

# Global plot style
plt.style.use('seaborn-v0_8-darkgrid')
SNS_PALETTE = 'viridis'
FIG_SIZE = (10, 6)
PLOT_DIR = os.path.join('static', 'plots')


def ensure_plot_dir(plot_dir: str = PLOT_DIR) -> None:
    os.makedirs(plot_dir, exist_ok=True)


# ---------------------------------------------------------------------------
# EDA Visualizations
# ---------------------------------------------------------------------------

def plot_class_distribution(df, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Plot the distribution of phishing vs legitimate URLs.
    Interpretation: Shows class balance. Significant imbalance could bias the model.
    """
    ensure_plot_dir(plot_dir)
    counts = df[target_col].value_counts()
    labels = ['Phishing (0)', 'Legitimate (1)']
    colors = ['#e74c3c', '#2ecc71']

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Bar chart
    axes[0].bar([labels[1], labels[0]], [counts.get(1, 0), counts.get(0, 0)],
                color=[colors[1], colors[0]], edgecolor='black', linewidth=0.7)
    axes[0].set_title('Class Distribution (Count)', fontsize=14, fontweight='bold')
    axes[0].set_ylabel('Number of Samples')
    axes[0].set_xlabel('Class')
    for i, v in enumerate([counts.get(1, 0), counts.get(0, 0)]):
        axes[0].text(i, v + 500, f'{v:,}', ha='center', fontweight='bold')

    # Pie chart
    axes[1].pie(
        [counts.get(1, 0), counts.get(0, 0)],
        labels=labels[::-1], colors=colors[::-1],
        autopct='%1.1f%%', startangle=90,
        wedgeprops={'edgecolor': 'white', 'linewidth': 1.5}
    )
    axes[1].set_title('Class Distribution (%)', fontsize=14, fontweight='bold')

    fig.suptitle('Phishing vs Legitimate URL Distribution', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    path = os.path.join(plot_dir, 'class_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_url_length_distribution(df, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Plot URL length distribution for phishing vs legitimate URLs.
    Interpretation: Phishing URLs tend to be longer to embed fake paths.
    """
    ensure_plot_dir(plot_dir)
    col = 'URLLength' if 'URLLength' in df.columns else None
    if col is None:
        print("URLLength column not found, skipping.")
        return None

    fig, ax = plt.subplots(figsize=FIG_SIZE)
    for label, color, name in [(0, '#e74c3c', 'Phishing'), (1, '#2ecc71', 'Legitimate')]:
        subset = df[df[target_col] == label][col]
        subset = subset[subset < subset.quantile(0.99)]  # clip outliers for readability
        ax.hist(subset, bins=50, alpha=0.6, color=color, label=name, edgecolor='none')

    ax.set_title('URL Length Distribution: Phishing vs Legitimate', fontsize=14, fontweight='bold')
    ax.set_xlabel('URL Length (characters)', fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.legend(fontsize=11)
    ax.text(0.98, 0.95,
            'Phishing URLs tend to be longer\nto hide the real destination',
            transform=ax.transAxes, ha='right', va='top',
            bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8), fontsize=9)

    plt.tight_layout()
    path = os.path.join(plot_dir, 'url_length_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_domain_length_distribution(df, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Plot domain length distribution by class.
    Interpretation: Domain name length differences between phishing and legitimate.
    """
    ensure_plot_dir(plot_dir)
    col = 'DomainLength' if 'DomainLength' in df.columns else None
    if col is None:
        print("DomainLength column not found, skipping.")
        return None

    fig, ax = plt.subplots(figsize=FIG_SIZE)
    for label, color, name in [(0, '#e74c3c', 'Phishing'), (1, '#2ecc71', 'Legitimate')]:
        subset = df[df[target_col] == label][col]
        subset = subset[subset < subset.quantile(0.99)]
        ax.hist(subset, bins=40, alpha=0.6, color=color, label=name, edgecolor='none')

    ax.set_title('Domain Length Distribution: Phishing vs Legitimate', fontsize=14, fontweight='bold')
    ax.set_xlabel('Domain Length (characters)', fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.legend(fontsize=11)
    ax.text(0.98, 0.95,
            'Domain length can indicate auto-generated\nor obfuscated phishing domains',
            transform=ax.transAxes, ha='right', va='top',
            bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8), fontsize=9)

    plt.tight_layout()
    path = os.path.join(plot_dir, 'domain_length_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_https_distribution(df, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Plot HTTPS usage distribution by class.
    Interpretation: Legitimate sites predominantly use HTTPS.
    """
    ensure_plot_dir(plot_dir)
    col = 'IsHTTPS' if 'IsHTTPS' in df.columns else None
    if col is None:
        print("IsHTTPS column not found, skipping.")
        return None

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    for idx, (label, color, name) in enumerate([(0, '#e74c3c', 'Phishing'), (1, '#2ecc71', 'Legitimate')]):
        subset = df[df[target_col] == label][col].value_counts(normalize=True) * 100
        axes[idx].bar(['HTTP', 'HTTPS'],
                      [subset.get(0, 0), subset.get(1, 0)],
                      color=['#95a5a6', color], edgecolor='black', linewidth=0.7)
        axes[idx].set_title(f'{name} - HTTPS Usage', fontsize=13, fontweight='bold')
        axes[idx].set_ylabel('Percentage (%)')
        axes[idx].set_ylim(0, 110)
        for i, v in enumerate([subset.get(0, 0), subset.get(1, 0)]):
            axes[idx].text(i, v + 1, f'{v:.1f}%', ha='center', fontweight='bold')

    fig.suptitle('HTTPS Usage: Phishing vs Legitimate', fontsize=15, fontweight='bold')
    plt.tight_layout()
    path = os.path.join(plot_dir, 'https_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_subdomains_distribution(df, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Plot number of subdomains by class.
    Interpretation: Phishing sites often use many subdomains to mimic legitimate URLs.
    """
    ensure_plot_dir(plot_dir)
    col = 'NoOfSubDomain' if 'NoOfSubDomain' in df.columns else None
    if col is None:
        print("NoOfSubDomain not found, skipping.")
        return None

    fig, ax = plt.subplots(figsize=FIG_SIZE)
    for label, color, name in [(0, '#e74c3c', 'Phishing'), (1, '#2ecc71', 'Legitimate')]:
        subset = df[df[target_col] == label][col].value_counts().sort_index()
        subset = subset[subset.index <= 5]
        ax.bar(subset.index + (0.2 if label == 1 else -0.2),
               subset.values, width=0.35,
               color=color, label=name, alpha=0.8, edgecolor='black', linewidth=0.5)

    ax.set_title('Number of Subdomains: Phishing vs Legitimate', fontsize=14, fontweight='bold')
    ax.set_xlabel('Number of Subdomains', fontsize=12)
    ax.set_ylabel('Count', fontsize=12)
    ax.set_xticks(range(0, 6))
    ax.legend(fontsize=11)
    ax.text(0.98, 0.95,
            'Multiple subdomains are a common\nphishing tactic (e.g., login.secure.bank.evil.com)',
            transform=ax.transAxes, ha='right', va='top',
            bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8), fontsize=9)

    plt.tight_layout()
    path = os.path.join(plot_dir, 'subdomains_distribution.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_correlation_heatmap(df, target_col: str = 'label', plot_dir: str = PLOT_DIR, top_n: int = 20):
    """
    Plot correlation heatmap of the top N features most correlated with the label.
    Interpretation: Reveals which features are most linearly associated with phishing.
    """
    ensure_plot_dir(plot_dir)
    numeric_df = df.select_dtypes(include=[np.number])

    # Select top N features by absolute correlation with label
    corr_with_label = numeric_df.corr()[target_col].abs().sort_values(ascending=False)
    top_features = corr_with_label.index[:top_n + 1].tolist()  # +1 for label itself

    corr_matrix = numeric_df[top_features].corr()

    fig, ax = plt.subplots(figsize=(14, 11))
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    sns.heatmap(
        corr_matrix, mask=mask, annot=True, fmt='.2f',
        cmap='RdYlGn', center=0, linewidths=0.5,
        ax=ax, annot_kws={'size': 7}
    )
    ax.set_title(
        f'Correlation Heatmap — Top {top_n} Features Most Correlated with Label',
        fontsize=13, fontweight='bold'
    )
    plt.xticks(rotation=45, ha='right', fontsize=8)
    plt.yticks(fontsize=8)
    plt.tight_layout()
    path = os.path.join(plot_dir, 'correlation_heatmap.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_feature_vs_label(df, feature: str, target_col: str = 'label', plot_dir: str = PLOT_DIR):
    """
    Generic plot for a single feature distribution by class.
    """
    ensure_plot_dir(plot_dir)
    if feature not in df.columns:
        return None
    fig, ax = plt.subplots(figsize=(8, 5))
    for label, color, name in [(0, '#e74c3c', 'Phishing'), (1, '#2ecc71', 'Legitimate')]:
        subset = df[df[target_col] == label][feature]
        subset = subset[subset < subset.quantile(0.99)]
        ax.hist(subset, bins=40, alpha=0.6, color=color, label=name, edgecolor='none')
    ax.set_title(f'{feature} Distribution by Class', fontsize=13, fontweight='bold')
    ax.set_xlabel(feature)
    ax.set_ylabel('Frequency')
    ax.legend()
    plt.tight_layout()
    fname = f'{feature.lower().replace(" ", "_")}_distribution.png'
    path = os.path.join(plot_dir, fname)
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    return path


# ---------------------------------------------------------------------------
# Model Evaluation Plots
# ---------------------------------------------------------------------------

def plot_confusion_matrix(y_test, y_pred, model_name: str, plot_dir: str = PLOT_DIR):
    """
    Plot a styled confusion matrix for a model.
    Interpretation: Shows True Positives, True Negatives, False Positives, False Negatives.
    """
    ensure_plot_dir(plot_dir)
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    fig, ax = plt.subplots(figsize=(7, 5))
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=['Phishing (0)', 'Legitimate (1)']
    )
    disp.plot(ax=ax, cmap='Blues', colorbar=False)
    ax.set_title(f'Confusion Matrix — {model_name}', fontsize=13, fontweight='bold')

    # Annotate with TN, FP, FN, TP
    ax.text(0, 1.15, f'TN={tn:,}  FP={fp:,}  FN={fn:,}  TP={tp:,}',
            transform=ax.transAxes, fontsize=9, ha='left',
            bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))

    plt.tight_layout()
    fname = f'cm_{model_name.replace(" ", "_").lower()}.png'
    path = os.path.join(plot_dir, fname)
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_roc_curves(results: dict, y_test, plot_dir: str = PLOT_DIR):
    """
    Plot ROC curves for all models on a single chart.
    Interpretation: The curve closest to the top-left corner has the best discriminative power.
    """
    ensure_plot_dir(plot_dir)
    fig, ax = plt.subplots(figsize=(9, 7))
    colors = plt.cm.tab10(np.linspace(0, 1, len(results)))

    for (name, metrics), color in zip(results.items(), colors):
        fpr, tpr, _ = roc_curve(y_test, metrics['y_prob'])
        roc_auc = metrics['roc_auc']
        ax.plot(fpr, tpr, color=color, lw=2,
                label=f'{name} (AUC = {roc_auc:.4f})')

    ax.plot([0, 1], [0, 1], 'k--', lw=1.5, label='Random Classifier')
    ax.fill_between([0, 1], [0, 1], alpha=0.05, color='gray')
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('False Positive Rate', fontsize=12)
    ax.set_ylabel('True Positive Rate (Recall)', fontsize=12)
    ax.set_title('ROC Curves — All Models Comparison', fontsize=14, fontweight='bold')
    ax.legend(loc='lower right', fontsize=10)
    ax.grid(True, alpha=0.4)

    plt.tight_layout()
    path = os.path.join(plot_dir, 'roc_curves.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_precision_recall_curves(results: dict, y_test, plot_dir: str = PLOT_DIR):
    """
    Plot Precision-Recall curves for all models.
    Interpretation: High area under PR curve means good performance on imbalanced data.
    """
    ensure_plot_dir(plot_dir)
    fig, ax = plt.subplots(figsize=(9, 7))
    colors = plt.cm.tab10(np.linspace(0, 1, len(results)))

    for (name, metrics), color in zip(results.items(), colors):
        precision, recall, _ = precision_recall_curve(y_test, metrics['y_prob'])
        pr_auc = auc(recall, precision)
        ax.plot(recall, precision, color=color, lw=2,
                label=f'{name} (PR-AUC = {pr_auc:.4f})')

    ax.set_xlabel('Recall', fontsize=12)
    ax.set_ylabel('Precision', fontsize=12)
    ax.set_title('Precision-Recall Curves — All Models', fontsize=14, fontweight='bold')
    ax.legend(loc='lower left', fontsize=10)
    ax.grid(True, alpha=0.4)

    plt.tight_layout()
    path = os.path.join(plot_dir, 'pr_curves.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_model_comparison(results: dict, plot_dir: str = PLOT_DIR):
    """
    Plot a grouped bar chart comparing all models across all metrics.
    Interpretation: Provides a quick visual comparison of model strengths and weaknesses.
    """
    ensure_plot_dir(plot_dir)
    metrics_to_plot = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    metric_labels = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']

    model_names = list(results.keys())
    x = np.arange(len(metrics_to_plot))
    width = 0.8 / len(model_names)
    colors = plt.cm.tab10(np.linspace(0, 1, len(model_names)))

    fig, ax = plt.subplots(figsize=(13, 7))
    for i, (name, color) in enumerate(zip(model_names, colors)):
        values = [results[name][m] for m in metrics_to_plot]
        bars = ax.bar(x + i * width - (len(model_names) - 1) * width / 2,
                      values, width, label=name, color=color, alpha=0.85,
                      edgecolor='black', linewidth=0.5)

    ax.set_xlabel('Metric', fontsize=12)
    ax.set_ylabel('Score', fontsize=12)
    ax.set_title('Model Performance Comparison — All Metrics', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=11)
    ax.set_ylim(0, 1.08)
    ax.legend(fontsize=10, loc='lower right')
    ax.grid(axis='y', alpha=0.4)
    ax.axhline(y=0.9, color='red', linestyle='--', alpha=0.4, label='90% threshold')

    plt.tight_layout()
    path = os.path.join(plot_dir, 'model_comparison.png')
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def plot_feature_importance(model, feature_names: list, model_name: str,
                             top_n: int = 20, plot_dir: str = PLOT_DIR):
    """
    Plot feature importance for tree-based models.
    Interpretation: Shows which features most contribute to phishing detection.
    """
    ensure_plot_dir(plot_dir)
    if not hasattr(model, 'feature_importances_'):
        print(f"Model '{model_name}' does not support feature_importances_. Skipping.")
        return None

    importances = model.feature_importances_
    indices = np.argsort(importances)[-top_n:]
    top_features = [feature_names[i] for i in indices]
    top_values = importances[indices]

    fig, ax = plt.subplots(figsize=(10, 8))
    colors = plt.cm.YlOrRd(top_values / top_values.max())
    bars = ax.barh(range(len(indices)), top_values, color=colors, edgecolor='black', linewidth=0.5)
    ax.set_yticks(range(len(indices)))
    ax.set_yticklabels(top_features, fontsize=9)
    ax.set_xlabel('Feature Importance Score', fontsize=12)
    ax.set_title(f'Top {top_n} Feature Importances — {model_name}', fontsize=13, fontweight='bold')
    ax.grid(axis='x', alpha=0.4)

    # Add value labels
    for bar, val in zip(bars, top_values):
        ax.text(val + 0.001, bar.get_y() + bar.get_height() / 2,
                f'{val:.4f}', va='center', fontsize=7)

    plt.tight_layout()
    fname = f'feature_importance_{model_name.replace(" ", "_").lower()}.png'
    path = os.path.join(plot_dir, fname)
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {path}")
    return path


def generate_all_eda_plots(df, target_col: str = 'label', plot_dir: str = PLOT_DIR) -> list:
    """
    Generate all EDA plots and return list of saved paths.
    """
    paths = []
    paths.append(plot_class_distribution(df, target_col, plot_dir))
    paths.append(plot_url_length_distribution(df, target_col, plot_dir))
    paths.append(plot_domain_length_distribution(df, target_col, plot_dir))
    paths.append(plot_https_distribution(df, target_col, plot_dir))
    paths.append(plot_subdomains_distribution(df, target_col, plot_dir))
    paths.append(plot_correlation_heatmap(df, target_col, plot_dir))

    # Additional feature plots
    for feat in ['URLSimilarityIndex', 'NoOfOtherSpecialCharsInURL',
                 'NoOfURLRedirects', 'DomainTitleMatchScore', 'URLTitleMatchScore']:
        p = plot_feature_vs_label(df, feat, target_col, plot_dir)
        if p:
            paths.append(p)

    return [p for p in paths if p is not None]


def generate_all_model_plots(results: dict, y_test, feature_names: list,
                              plot_dir: str = PLOT_DIR) -> dict:
    """
    Generate all model evaluation plots.
    Returns a dict of {plot_name: path}.
    """
    plot_paths = {}
    for name, metrics in results.items():
        path = plot_confusion_matrix(y_test, metrics['y_pred'], name, plot_dir)
        plot_paths[f'cm_{name}'] = path

    plot_paths['roc_curves'] = plot_roc_curves(results, y_test, plot_dir)
    plot_paths['pr_curves'] = plot_precision_recall_curves(results, y_test, plot_dir)
    plot_paths['model_comparison'] = plot_model_comparison(results, plot_dir)

    for name, metrics in results.items():
        model = metrics['model']
        path = plot_feature_importance(model, feature_names, name, plot_dir=plot_dir)
        if path:
            plot_paths[f'fi_{name}'] = path

    return plot_paths
