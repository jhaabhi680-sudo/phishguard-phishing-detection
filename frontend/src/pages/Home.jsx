import React, { useState } from 'react';
import {
  Shield,
  Search,
  Cpu,
  Zap,
  FileSearch,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  BarChart2,
  Eye,
} from 'lucide-react';

export default function Home({ onQuickScan, onNavigate }) {
  const [heroUrl, setHeroUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onQuickScan(heroUrl);
  };

  const featureCards = [
    {
      icon: Cpu,
      title: 'AI-Powered Detection',
      description:
        'Trained and evaluated across Logistic Regression, Decision Tree, Random Forest, Support Vector Machine, and XGBoost classifiers.',
      accent: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
    },
    {
      icon: Zap,
      title: 'Real-Time URL Analysis',
      description:
        'Extracts 22 deterministic lexical, structural, and entropy features in milliseconds without visiting or executing untrusted URLs.',
      accent: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
    },
    {
      icon: Eye,
      title: 'Explainable Results',
      description:
        'Provides transparent human-readable risk factors, confidence scores, and feature-level breakdowns for every scan.',
      accent: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    },
  ];

  const steps = [
    {
      step: 'Step 1',
      title: 'Enter URL',
      desc: 'Input or paste any suspicious website link into the scanner.',
      icon: Search,
    },
    {
      step: 'Step 2',
      title: 'Extract URL Features',
      desc: 'Compute 22 lexical, domain, HTTPS, keyword, and entropy signals.',
      icon: Sliders,
    },
    {
      step: 'Step 3',
      title: 'Run ML Model',
      desc: 'Evaluate scaled features through the highest-F1 trained classifier.',
      icon: Cpu,
    },
    {
      step: 'Step 4',
      title: 'Analyze Risk',
      desc: 'Calculate calibrated phishing probability and risk score (0–100%).',
      icon: FileSearch,
    },
    {
      step: 'Step 5',
      title: 'Display Result',
      desc: 'Present classification verdict, explainable reasons, and save to SQLite.',
      icon: BarChart2,
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span>AI-Powered Protection Against Phishing Websites</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
                Detect Phishing{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Before It Detects You.
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Analyze suspicious URLs using machine learning and identify potential phishing
                threats in seconds.
              </p>

              {/* Hero URL Input Box */}
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-700/80 bg-[#0c1324]/90 p-2.5 shadow-2xl shadow-cyan-500/10 backdrop-blur-md"
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 px-3 py-2">
                    <Search className="h-5 w-5 shrink-0 text-cyan-400" />
                    <input
                      type="text"
                      value={heroUrl}
                      onChange={(e) => setHeroUrl(e.target.value)}
                      placeholder="Enter a website URL (e.g., https://example.com)"
                      className="w-full bg-transparent font-mono text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500"
                  >
                    <span>Scan URL</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Quick Sample Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-500">Try sample:</span>
                <button
                  type="button"
                  onClick={() => onQuickScan('https://example.com')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  https://example.com
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onQuickScan('http://example-login-verify.com/account/update')
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-rose-300 transition hover:bg-rose-500/20"
                >
                  <AlertTriangle className="h-3 w-3" />
                  http://example-login-verify.com/account/update
                </button>
              </div>
            </div>

            {/* Right Column — Cybersecurity Visual Shield */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-slate-800 bg-gradient-to-b from-[#0e172c] to-[#080d1a] p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Threat Engine Active
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-cyan-400">
                    22 URL Features
                  </span>
                </div>

                {/* Custom SVG Cyber Shield Graphic */}
                <div className="my-6 flex flex-col items-center justify-center py-4">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/5 shadow-inner">
                    <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/30" />
                    <Shield className="h-16 w-16 text-cyan-400" />
                  </div>
                </div>

                {/* Simulated Live Example Card */}
                <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Sample Threat Detection
                    </span>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-rose-300">
                      Risk: 94%
                    </span>
                  </div>
                  <p className="truncate font-mono text-xs text-slate-300">
                    https://example-login-verify.com/account/update
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded bg-slate-900/90 px-2 py-0.5 text-[11px] text-slate-300">
                      Suspicious keywords
                    </span>
                    <span className="rounded bg-slate-900/90 px-2 py-0.5 text-[11px] text-slate-300">
                      Multiple hyphens
                    </span>
                    <span className="rounded bg-slate-900/90 px-2 py-0.5 text-[11px] text-slate-300">
                      Explainable AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/90 bg-[#0c1324]/90 p-6 shadow-lg transition-all hover:border-slate-700"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br ${card.accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How PhishGuard Works (5 Steps) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800/90 bg-[#0c1324]/70 p-6 sm:p-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              End-to-End Architecture
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              How PhishGuard Works
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              A complete defensive machine learning pipeline from raw URL input to explainable
              classification.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/20">
                        {s.step}
                      </span>
                      <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                    <h4 className="mt-4 text-base font-bold text-white">{s.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>
                Safe static inspection: PhishGuard never opens or executes untrusted URLs.
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                View Model Metrics
              </button>
              <button
                type="button"
                onClick={() => onNavigate('scanner')}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
              >
                Launch Scanner
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
