import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RotateCcw,
  Globe,
  Sliders,
} from 'lucide-react';

export default function ResultCard({ result, onScanAnother }) {
  if (!result) return null;

  const isPhishing = result.prediction === 'phishing';
  const confidencePct = Math.round((result.confidence || 0) * 100);
  const riskScore = result.risk_score ?? 0;

  // Radial gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, riskScore)) / 100) * circumference;

  const features = result.features || {};
  const featureHighlights = [
    { label: 'URL Length', value: `${features.url_length ?? 0} chars` },
    { label: 'Hostname Length', value: `${features.hostname_length ?? 0} chars` },
    { label: 'HTTPS Used', value: features.has_https ? 'Yes' : 'No' },
    { label: 'Subdomains', value: features.num_subdomains ?? 0 },
    { label: 'Hyphens', value: features.num_hyphens ?? 0 },
    { label: 'Suspicious Keywords', value: features.suspicious_keyword_count ?? 0 },
    { label: 'Domain Entropy', value: features.domain_entropy ?? 0 },
    { label: 'Special Chars', value: features.num_special_chars ?? 0 },
  ];

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
        isPhishing
          ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/35 via-[#0c1324] to-[#080d1a]'
          : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/35 via-[#0c1324] to-[#080d1a]'
      }`}
    >
      {/* Top Status Banner */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800/80 pb-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border ${
            isPhishing
              ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
              : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
          }">
            {isPhishing ? (
              <>
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>WARNING / PHISHING DETECTED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>SAFE / LEGITIMATE</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-300 break-all font-mono text-sm sm:text-base bg-slate-950/70 px-3.5 py-2.5 rounded-xl border border-slate-800">
            <Globe className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{result.url}</span>
          </div>
        </div>

        {/* Visual Risk Score Radial Indicator */}
        <div className="flex items-center gap-6 self-start lg:self-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={
                  riskScore >= 60
                    ? 'text-rose-500 transition-all duration-700'
                    : riskScore >= 35
                    ? 'text-amber-400 transition-all duration-700'
                    : 'text-emerald-400 transition-all duration-700'
                }
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-3xl font-extrabold ${
                  isPhishing ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {riskScore}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Risk Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Classification Metadata Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Classification
          </span>
          <p
            className={`mt-1 text-xl font-extrabold uppercase ${
              isPhishing ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isPhishing ? 'PHISHING' : 'LEGITIMATE'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Confidence
          </span>
          <p className="mt-1 text-xl font-extrabold text-cyan-400">{confidencePct}%</p>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Model Used
          </span>
          <p className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>{result.model}</span>
          </p>
        </div>
      </div>

      {/* Explainable AI Reasons Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            {isPhishing ? (
              <>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Why was this URL flagged?</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Why is this URL considered safe?</span>
              </>
            )}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {(result.reasons || []).map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5 text-sm text-slate-200"
              >
                {isPhishing ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                )}
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extracted URL Characteristics */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Extracted URL Characteristics</span>
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {featureHighlights.map((f, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3"
              >
                <span className="block text-[11px] font-medium text-slate-400">
                  {f.label}
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-slate-100">
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Another URL Action */}
      {onScanAnother && (
        <div className="mt-6 flex justify-end border-t border-slate-800/80 pt-5">
          <button
            type="button"
            onClick={onScanAnother}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-cyan-500/50 hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4 text-cyan-400" />
            <span>Scan Another URL</span>
          </button>
        </div>
      )}
    </div>
  );
}
