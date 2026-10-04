import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Cpu, RotateCcw, Globe, Sliders } from 'lucide-react';
export default function ResultCard({
  result,
  onScanAnother
}) {
  if (!result) return null;
  const isPhishing = result.prediction === 'phishing';
  const confidencePct = Math.round((result.confidence || 0) * 100);
  const riskScore = result.risk_score ?? 0;

  // Radial gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - Math.min(100, Math.max(0, riskScore)) / 100 * circumference;
  const features = result.features || {};
  const featureHighlights = [{
    label: 'URL Length',
    value: `${features.url_length ?? 0} chars`
  }, {
    label: 'Hostname Length',
    value: `${features.hostname_length ?? 0} chars`
  }, {
    label: 'HTTPS Used',
    value: features.has_https ? 'Yes' : 'No'
  }, {
    label: 'Subdomains',
    value: features.num_subdomains ?? 0
  }, {
    label: 'Hyphens',
    value: features.num_hyphens ?? 0
  }, {
    label: 'Suspicious Keywords',
    value: features.suspicious_keyword_count ?? 0
  }, {
    label: 'Domain Entropy',
    value: features.domain_entropy ?? 0
  }, {
    label: 'Special Chars',
    value: features.num_special_chars ?? 0
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: `rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${isPhishing ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/35 via-[#0c1324] to-[#080d1a]' : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/35 via-[#0c1324] to-[#080d1a]'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800/80 pb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border ${ isPhishing ? 'border-rose-500/50 bg-rose-500/15 text-rose-300' : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' }"
  }, isPhishing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ShieldAlert, {
    className: "h-4 w-4 text-rose-400"
  }), /*#__PURE__*/React.createElement("span", null, "WARNING / PHISHING DETECTED")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ShieldCheck, {
    className: "h-4 w-4 text-emerald-400"
  }), /*#__PURE__*/React.createElement("span", null, "SAFE / LEGITIMATE"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-slate-300 break-all font-mono text-sm sm:text-base bg-slate-950/70 px-3.5 py-2.5 rounded-xl border border-slate-800"
  }, /*#__PURE__*/React.createElement(Globe, {
    className: "h-4 w-4 shrink-0 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, result.url))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-6 self-start lg:self-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex h-36 w-36 items-center justify-center"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "h-36 w-36 -rotate-90 transform",
    viewBox: "0 0 140 140"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "70",
    cy: "70",
    r: radius,
    stroke: "currentColor",
    strokeWidth: "10",
    fill: "transparent",
    className: "text-slate-800"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "70",
    cy: "70",
    r: radius,
    stroke: "currentColor",
    strokeWidth: "10",
    strokeDasharray: circumference,
    strokeDashoffset: strokeDashoffset,
    strokeLinecap: "round",
    fill: "transparent",
    className: riskScore >= 60 ? 'text-rose-500 transition-all duration-700' : riskScore >= 35 ? 'text-amber-400 transition-all duration-700' : 'text-emerald-400 transition-all duration-700'
  })), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 flex flex-col items-center justify-center text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: `text-3xl font-extrabold ${isPhishing ? 'text-rose-400' : 'text-emerald-400'}`
  }, riskScore, "%"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-semibold uppercase tracking-widest text-slate-400"
  }, "Risk Score"))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-800/90 bg-slate-900/60 p-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium uppercase tracking-wider text-slate-400"
  }, "Classification"), /*#__PURE__*/React.createElement("p", {
    className: `mt-1 text-xl font-extrabold uppercase ${isPhishing ? 'text-rose-400' : 'text-emerald-400'}`
  }, isPhishing ? 'PHISHING' : 'LEGITIMATE')), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-800/90 bg-slate-900/60 p-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium uppercase tracking-wider text-slate-400"
  }, "Confidence"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 text-xl font-extrabold text-cyan-400"
  }, confidencePct, "%")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-800/90 bg-slate-900/60 p-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium uppercase tracking-wider text-slate-400"
  }, "Model Used"), /*#__PURE__*/React.createElement("p", {
    className: "mt-1 flex items-center gap-2 text-lg font-bold text-white"
  }, /*#__PURE__*/React.createElement(Cpu, {
    className: "h-4 w-4 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, result.model)))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-800/90 bg-slate-950/60 p-5"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white"
  }, isPhishing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "h-4 w-4 text-rose-400"
  }), /*#__PURE__*/React.createElement("span", null, "Why was this URL flagged?")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CheckCircle2, {
    className: "h-4 w-4 text-emerald-400"
  }), /*#__PURE__*/React.createElement("span", null, "Why is this URL considered safe?"))), /*#__PURE__*/React.createElement("ul", {
    className: "mt-4 space-y-2.5"
  }, (result.reasons || []).map((reason, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx,
    className: "flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5 text-sm text-slate-200"
  }, isPhishing ? /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "mt-0.5 h-4 w-4 shrink-0 text-rose-400"
  }) : /*#__PURE__*/React.createElement(CheckCircle2, {
    className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
  }), /*#__PURE__*/React.createElement("span", null, reason))))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-800/90 bg-slate-950/60 p-5"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white"
  }, /*#__PURE__*/React.createElement(Sliders, {
    className: "h-4 w-4 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, "Extracted URL Characteristics")), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
  }, featureHighlights.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "rounded-lg border border-slate-800/80 bg-slate-900/50 p-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] font-medium text-slate-400"
  }, f.label), /*#__PURE__*/React.createElement("span", {
    className: "mt-1 block font-mono text-sm font-bold text-slate-100"
  }, f.value)))))), onScanAnother && /*#__PURE__*/React.createElement("div", {
    className: "mt-6 flex justify-end border-t border-slate-800/80 pt-5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onScanAnother,
    className: "inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-cyan-500/50 hover:bg-slate-800"
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    className: "h-4 w-4 text-cyan-400"
  }), /*#__PURE__*/React.createElement("span", null, "Scan Another URL"))));
}