import React, { useEffect } from 'react';
import {
  Search,
  XCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lock,
} from 'lucide-react';
import ResultCard from '../components/ResultCard.jsx';

const SAMPLE_URLS = [
  {
    label: 'Google (Legitimate)',
    url: 'https://www.google.com',
    type: 'safe',
  },
  {
    label: 'GitHub Docs (Legitimate)',
    url: 'https://docs.github.com/en/get-started',
    type: 'safe',
  },
  {
    label: 'Account Verify Spoof (Phishing)',
    url: 'http://example-login-verify.com/account/update',
    type: 'phishing',
  },
  {
    label: 'PayPal Subdomain Lure (Phishing)',
    url: 'http://paypal.com.secure-account-update.tk/signin?confirm=1',
    type: 'phishing',
  },
  {
    label: 'Raw IP Banking Lure (Phishing)',
    url: 'http://192.168.42.19/chase/login/verify.html',
    type: 'phishing',
  },
];

export default function Scanner({ scanner, initialUrl, onClearInitialUrl }) {
  const {
    url,
    setUrl,
    isScanning,
    scanStepIndex,
    scanSteps,
    result,
    error,
    scanUrl,
    resetScanner,
  } = scanner;

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      scanUrl(initialUrl);
      if (onClearInitialUrl) onClearInitialUrl();
    }
  }, [initialUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    scanUrl(url);
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    scanUrl(sampleUrl);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>Static Lexical &amp; Structural ML Scanner</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          URL Phishing Scanner
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400">
          Enter or paste any website URL below. PhishGuard extracts 22 structural features
          statically without visiting or executing the target site.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1324]/95 p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="scanner-url-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Enter or Paste Website URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-cyan-400" />
              <input
                id="scanner-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example-login-verify.com/account/update"
                disabled={isScanning}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-3.5 pl-12 pr-4 font-mono text-sm sm:text-base text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={isScanning}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Scan URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetScanner}
                disabled={isScanning}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Presets */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <span className="block text-xs font-medium text-slate-400 mb-2.5">
            Quick test URLs:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((s, i) => (
              <button
                key={i}
                type="button"
                disabled={isScanning}
                onClick={() => handleSampleClick(s.url)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  s.type === 'safe'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                {s.type === 'safe' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>
            Safe execution guarantee: PhishGuard only parses the URL string and never makes
            outbound requests to submitted addresses.
          </span>
        </div>
      </div>

      {/* Animated Loading State */}
      {isScanning && (
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0c1324] p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {scanSteps[scanStepIndex]}
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">{url}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scanSteps.map((stepLabel, idx) => {
              const isDone = idx < scanStepIndex;
              const isCurrent = idx === scanStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200'
                      : isDone
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{stepLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friendly Error Message */}
      {error && !isScanning && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <h4 className="font-bold text-rose-300">Scan Error</h4>
            <p className="mt-1 text-slate-300">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !isScanning && (
        <ResultCard result={result} onScanAnother={resetScanner} />
      )}
    </div>
  );
}
