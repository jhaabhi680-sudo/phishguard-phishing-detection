import React from 'react';
import { Shield, Lock, Cpu, Database } from 'lucide-react';
export default function Footer({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "mt-20 border-t border-slate-800/80 bg-[#050811] text-slate-400"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-8 md:grid-cols-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 text-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
  }, /*#__PURE__*/React.createElement(Shield, {
    className: "h-4 w-4"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-bold tracking-tight"
  }, "Phish", /*#__PURE__*/React.createElement("span", {
    className: "text-cyan-400"
  }, "Guard"))), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 max-w-md text-sm leading-relaxed text-slate-400"
  }, "AI-powered protection against phishing websites. An academic AI/ML mini-project demonstrating data preprocessing, URL feature extraction, multi-model training, explainable AI, and real-time classification."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 flex flex-wrap gap-4 text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Lock, {
    className: "h-3.5 w-3.5 text-emerald-400"
  }), "Zero-Execution Static URL Inspection"), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Cpu, {
    className: "h-3.5 w-3.5 text-cyan-400"
  }), "Scikit-Learn & XGBoost Pipeline"), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Database, {
    className: "h-3.5 w-3.5 text-blue-400"
  }), "SQLite History Persistence"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-200"
  }, "Navigation"), /*#__PURE__*/React.createElement("ul", {
    className: "mt-3 space-y-2 text-sm"
  }, [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'scanner',
    label: 'URL Scanner'
  }, {
    id: 'dashboard',
    label: 'Analytics Dashboard'
  }, {
    id: 'history',
    label: 'Scan History'
  }, {
    id: 'about',
    label: 'About Project'
  }].map(link => /*#__PURE__*/React.createElement("li", {
    key: link.id
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onNavigate(link.id),
    className: "text-slate-400 transition-colors hover:text-cyan-400"
  }, link.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-semibold uppercase tracking-wider text-slate-200"
  }, "Security Notice"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs leading-relaxed text-slate-400"
  }, "PhishGuard evaluates URLs statically using lexical and structural machine learning features. It never visits, crawls, or executes submitted websites."))), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 border-t border-slate-800/70 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 ", new Date().getFullYear(), " PhishGuard \u2014 AI/ML Academic Mini Project."), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 sm:mt-0"
  }, "React \u2022 FastAPI \u2022 Scikit-Learn \u2022 SQLite"))));
}