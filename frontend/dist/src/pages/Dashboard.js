import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, ShieldAlert, ShieldCheck, Percent, Award, Cpu, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { phishguardApi } from '../services/api.js';
const PIE_COLORS = ['#f43f5e', '#10b981'];
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await phishguardApi.getMetrics();
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard metrics from server.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx-auto max-w-7xl px-4 py-16 text-center"
    }, /*#__PURE__*/React.createElement(RefreshCw, {
      className: "mx-auto h-8 w-8 animate-spin text-cyan-400"
    }), /*#__PURE__*/React.createElement("p", {
      className: "mt-3 text-sm text-slate-400"
    }, "Loading real-time ML metrics and scan analytics..."));
  }
  if (error) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx-auto max-w-4xl px-4 py-12"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rounded-2xl border border-rose-500/40 bg-rose-950/25 p-6 text-center"
    }, /*#__PURE__*/React.createElement(AlertCircle, {
      className: "mx-auto h-10 w-10 text-rose-400"
    }), /*#__PURE__*/React.createElement("h3", {
      className: "mt-3 text-lg font-bold text-white"
    }, "Backend Connection Error"), /*#__PURE__*/React.createElement("p", {
      className: "mt-1 text-sm text-slate-300"
    }, error), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: fetchDashboard,
      className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950"
    }, /*#__PURE__*/React.createElement(RefreshCw, {
      className: "h-4 w-4"
    }), "Retry")));
  }
  if (!data || !data.model_trained) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx-auto max-w-4xl px-4 py-12"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rounded-2xl border border-amber-500/40 bg-amber-950/25 p-8 text-center"
    }, /*#__PURE__*/React.createElement(AlertCircle, {
      className: "mx-auto h-12 w-12 text-amber-400"
    }), /*#__PURE__*/React.createElement("h2", {
      className: "mt-4 text-xl font-bold text-white"
    }, "Train Model to View Metrics"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2 text-sm text-slate-300"
    }, data?.message || 'ML model is not trained yet. Run python backend/ml/train.py first.')));
  }
  const scanStats = data.scan_stats || {
    total_scans: 0,
    phishing_detected: 0,
    legitimate_detected: 0,
    phishing_percentage: 0,
    scan_history_chart: []
  };
  const best = data.best_model_metrics || {};
  const cm = best.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] ?? 0;
  const fp = cm[0]?.[1] ?? 0;
  const fn = cm[1]?.[0] ?? 0;
  const tp = cm[1]?.[1] ?? 0;
  const topFeatures = (data.feature_importances || []).slice(0, 10).map(item => ({
    feature: item.feature,
    importancePct: Number((item.importance * 100).toFixed(2))
  }));
  const distributionData = [{
    name: 'Phishing Detected',
    value: scanStats.phishing_detected || 0
  }, {
    name: 'Legitimate Detected',
    value: scanStats.legitimate_detected || 0
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold uppercase tracking-widest text-cyan-400"
  }, "Real-Time Telemetry & Evaluation"), /*#__PURE__*/React.createElement("h1", {
    className: "mt-1 text-3xl font-extrabold text-white"
  }, "Analytics & Model Performance Dashboard")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: fetchDashboard,
    className: "inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
  }, /*#__PURE__*/React.createElement(RefreshCw, {
    className: "h-3.5 w-3.5 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, "Refresh Metrics"))), data.dataset_note && /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-slate-300"
  }, /*#__PURE__*/React.createElement(Info, {
    className: "mt-0.5 h-4 w-4 shrink-0 text-cyan-400"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-white"
  }, "Dataset & Selection Note: "), data.dataset_note, " Total cleaned samples:", ' ', /*#__PURE__*/React.createElement("strong", {
    className: "text-cyan-300"
  }, data.dataset_summary?.total_rows), " (Train:", ' ', data.dataset_summary?.train_samples, ", Test: ", data.dataset_summary?.test_samples, ").")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-400"
  }, "Total Scans"), /*#__PURE__*/React.createElement(Activity, {
    className: "h-5 w-5 text-cyan-400"
  })), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-3xl font-extrabold text-white"
  }, scanStats.total_scans), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-500"
  }, "Stored in SQLite history")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-400"
  }, "Phishing Detected"), /*#__PURE__*/React.createElement(ShieldAlert, {
    className: "h-5 w-5 text-rose-400"
  })), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-3xl font-extrabold text-rose-400"
  }, scanStats.phishing_detected), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-500"
  }, "Flagged high-risk URLs")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-400"
  }, "Legitimate Detected"), /*#__PURE__*/React.createElement(ShieldCheck, {
    className: "h-5 w-5 text-emerald-400"
  })), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-3xl font-extrabold text-emerald-400"
  }, scanStats.legitimate_detected), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-500"
  }, "Verified safe URLs")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-400"
  }, "Phishing Percentage"), /*#__PURE__*/React.createElement(Percent, {
    className: "h-5 w-5 text-amber-400"
  })), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-3xl font-extrabold text-amber-400"
  }, scanStats.phishing_percentage, "%"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-500"
  }, "Ratio of malicious scans"))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400"
  }, /*#__PURE__*/React.createElement(Award, {
    className: "h-5 w-5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-400"
  }, "Automatically Selected Best Model (by F1-Score & Recall)"), /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-extrabold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "Selected Model: ", data.selected_model)))), /*#__PURE__*/React.createElement("span", {
    className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-300"
  }, "Trained: ", data.trained_at)), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5"
  }, [{
    label: 'Accuracy',
    val: best.accuracy
  }, {
    label: 'Precision',
    val: best.precision
  }, {
    label: 'Recall',
    val: best.recall
  }, {
    label: 'F1 Score',
    val: best.f1_score
  }, {
    label: 'ROC-AUC',
    val: best.roc_auc
  }].map((m, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium uppercase tracking-wider text-slate-400"
  }, m.label), /*#__PURE__*/React.createElement("p", {
    className: "mt-1.5 font-mono text-2xl font-extrabold text-cyan-400"
  }, m.val !== undefined ? `${(m.val * 100).toFixed(2)}%` : 'N/A'))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-6 lg:grid-cols-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "1. Multi-Model Performance Comparison (%)"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-400"
  }, "Comparing Accuracy, Precision, Recall, F1-Score, and ROC-AUC across all trained classifiers."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-80 w-full"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: data.model_comparison || [],
    margin: {
      top: 10,
      right: 15,
      left: 0,
      bottom: 20
    }
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#1e293b"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "model",
    tick: {
      fill: '#94a3b8',
      fontSize: 11
    },
    interval: 0,
    angle: -12,
    textAnchor: "end"
  }), /*#__PURE__*/React.createElement(YAxis, {
    domain: [80, 100],
    tick: {
      fill: '#94a3b8',
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      color: '#f8fafc',
      fontSize: '12px'
    }
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontSize: '12px',
      paddingTop: '10px'
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "f1_score",
    name: "F1-Score (%)",
    fill: "#06b6d4",
    radius: [4, 4, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "recall",
    name: "Recall (%)",
    fill: "#3b82f6",
    radius: [4, 4, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "accuracy",
    name: "Accuracy (%)",
    fill: "#10b981",
    radius: [4, 4, 0, 0]
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1324] p-6 flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "2. Confusion Matrix (", data.selected_model, ")"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-400"
  }, "Test set evaluation breakdown showing True Positives, True Negatives, False Positives, and False Negatives."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 grid grid-cols-2 gap-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] font-bold uppercase tracking-wider text-emerald-300"
  }, "True Negative (TN)"), /*#__PURE__*/React.createElement("span", {
    className: "mt-2 block font-mono text-3xl font-extrabold text-white"
  }, tn), /*#__PURE__*/React.createElement("span", {
    className: "mt-1 block text-[11px] text-slate-400"
  }, "Legitimate correctly identified")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-amber-500/30 bg-amber-950/25 p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] font-bold uppercase tracking-wider text-amber-300"
  }, "False Positive (FP)"), /*#__PURE__*/React.createElement("span", {
    className: "mt-2 block font-mono text-3xl font-extrabold text-white"
  }, fp), /*#__PURE__*/React.createElement("span", {
    className: "mt-1 block text-[11px] text-slate-400"
  }, "Legitimate flagged as phishing")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-rose-500/30 bg-rose-950/25 p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] font-bold uppercase tracking-wider text-rose-300"
  }, "False Negative (FN)"), /*#__PURE__*/React.createElement("span", {
    className: "mt-2 block font-mono text-3xl font-extrabold text-white"
  }, fn), /*#__PURE__*/React.createElement("span", {
    className: "mt-1 block text-[11px] text-slate-400"
  }, "Missed phishing URLs (Critical)")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] font-bold uppercase tracking-wider text-cyan-300"
  }, "True Positive (TP)"), /*#__PURE__*/React.createElement("span", {
    className: "mt-2 block font-mono text-3xl font-extrabold text-white"
  }, tp), /*#__PURE__*/React.createElement("span", {
    className: "mt-1 block text-[11px] text-slate-400"
  }, "Phishing correctly detected")))), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 text-[11px] leading-relaxed text-slate-400 border-t border-slate-800 pt-3"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Why Recall Matters:"), " A low False Negative count (", fn, ") ensures malicious phishing websites do not slip past detection."))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-6 lg:grid-cols-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "3. Top Feature Importances (%)"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-400"
  }, "Relative weight of extracted URL features in model decisions."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-72 w-full"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: topFeatures,
    layout: "vertical",
    margin: {
      top: 5,
      right: 20,
      left: 30,
      bottom: 5
    }
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#1e293b"
  }), /*#__PURE__*/React.createElement(XAxis, {
    type: "number",
    tick: {
      fill: '#94a3b8',
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    dataKey: "feature",
    type: "category",
    width: 125,
    tick: {
      fill: '#cbd5e1',
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      color: '#f8fafc',
      fontSize: '12px'
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "importancePct",
    name: "Importance (%)",
    fill: "#38bdf8",
    radius: [0, 4, 4, 0]
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-4 rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "4. Scan History Activity"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-400"
  }, "Daily scan volume broken down by classification outcome."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-72 w-full"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: scanStats.scan_history_chart || [],
    margin: {
      top: 10,
      right: 10,
      left: -15,
      bottom: 0
    }
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#1e293b"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "date",
    tick: {
      fill: '#94a3b8',
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    allowDecimals: false,
    tick: {
      fill: '#94a3b8',
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      color: '#f8fafc',
      fontSize: '12px'
    }
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontSize: '11px'
    }
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "phishing",
    name: "Phishing",
    stroke: "#f43f5e",
    fill: "#f43f5e",
    fillOpacity: 0.25
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "legitimate",
    name: "Legitimate",
    stroke: "#10b981",
    fill: "#10b981",
    fillOpacity: 0.25
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-3 rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "5. Scan Distribution"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xs text-slate-400"
  }, "Phishing vs. Legitimate scans in SQLite."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-72 w-full"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(PieChart, null, /*#__PURE__*/React.createElement(Pie, {
    data: distributionData,
    cx: "50%",
    cy: "45%",
    innerRadius: 48,
    outerRadius: 76,
    paddingAngle: 4,
    dataKey: "value"
  }, distributionData.map((entry, index) => /*#__PURE__*/React.createElement(Cell, {
    key: `cell-${index}`,
    fill: PIE_COLORS[index % PIE_COLORS.length]
  }))), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      color: '#f8fafc',
      fontSize: '12px'
    }
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontSize: '11px'
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border border-slate-800 bg-[#0c1324] p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white mb-4"
  }, "All Trained Models \u2014 Detailed Evaluation Benchmarks"), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-sm"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Algorithm"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Accuracy"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Precision"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Recall"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "F1-Score"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "ROC-AUC"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Train Time"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-800/70"
  }, (data.model_comparison || []).map((row, idx) => {
    const isSelected = row.model === data.selected_model;
    return /*#__PURE__*/React.createElement("tr", {
      key: idx,
      className: isSelected ? 'bg-cyan-500/10 font-semibold' : 'hover:bg-slate-900/40'
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 text-white flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(Cpu, {
      className: "h-4 w-4 text-cyan-400"
    }), /*#__PURE__*/React.createElement("span", null, row.model), isSelected && /*#__PURE__*/React.createElement("span", {
      className: "rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-300 border border-cyan-500/30"
    }, "Best Model")), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono text-slate-200"
    }, row.accuracy, "%"), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono text-slate-200"
    }, row.precision, "%"), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono text-slate-200"
    }, row.recall, "%"), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono font-bold text-cyan-400"
    }, row.f1_score, "%"), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono text-slate-200"
    }, row.roc_auc, "%"), /*#__PURE__*/React.createElement("td", {
      className: "py-3.5 px-4 font-mono text-slate-400"
    }, row.train_time_seconds, "s"));
  }))))));
}