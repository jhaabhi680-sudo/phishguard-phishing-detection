import React, { useState, useEffect, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { fetchHistory, clearHistory } from '../services/api.js';

export default function History({ onRescan }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'phishing' | 'legitimate'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [clearing, setClearing] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory({ limit: 200 });
      const items = Array.isArray(data) ? data : (data.items || []);
      setRecords(items);
      setTotal(Array.isArray(data) ? data.length : (data.total ?? items.length));
    } catch (err) {
      setError(err.message || 'Failed to load scan history from SQLite database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all scan history records from the SQLite database?')) {
      return;
    }
    setClearing(true);
    try {
      await clearHistory();
      setRecords([]);
      setTotal(0);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => {
        if (filterType !== 'all' && item.prediction !== filterType) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.url.toLowerCase().includes(q) ||
            (item.model && item.model.toLowerCase().includes(q)) ||
            item.prediction.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? tB - tA : tA - tB;
      });
  }, [records, filterType, searchQuery, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            Persistent SQLite Audit Log
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Scan History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past URL inspections, risk scores, and model predictions stored in the SQLite database ({total} total records).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>

          {records.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? 'Clearing...' : 'Clear History'}
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/75 border border-slate-800/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scanned URLs, domain names, or model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Scans' },
              { id: 'phishing', label: 'Phishing' },
              { id: 'legitimate', label: 'Legitimate' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center gap-3 text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content State */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Loading scan history from SQLite...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
            <HistoryIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {records.length === 0 ? 'No Scan History Yet' : 'No Matching Scans Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-5">
            {records.length === 0
              ? 'Every URL you analyze in the Scanner is automatically logged to the SQLite database with its risk score and explainable reasons.'
              : 'Try adjusting your search query or switching the classification filter.'}
          </p>
          {records.length === 0 && onRescan && (
            <button
              onClick={() => onRescan('')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
            >
              Scan Your First URL
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/75 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Inspected URL</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Model</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredRecords.map((item) => {
                  const isPhish = item.prediction === 'phishing';
                  const formattedDate = item.timestamp
                    ? new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isPhish
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isPhish ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {item.prediction}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md md:max-w-lg">
                        <div className="font-mono text-xs text-slate-200 truncate" title={item.url}>
                          {item.url}
                        </div>
                        {item.reasons && item.reasons.length > 0 && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.reasons[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.risk_score >= 60
                                  ? 'bg-rose-500'
                                  : item.risk_score >= 35
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(4, item.risk_score))}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              item.risk_score >= 60
                                ? 'text-rose-400'
                                : item.risk_score >= 35
                                ? 'text-amber-300'
                                : 'text-emerald-400'
                            }`}
                          >
                            {item.risk_score}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-300 font-medium">
                        {Math.round((item.confidence || 0) * 100)}%
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                          {item.model}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formattedDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {onRescan && (
                          <button
                            onClick={() => onRescan(item.url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 text-xs font-semibold transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Re-Analyze
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
