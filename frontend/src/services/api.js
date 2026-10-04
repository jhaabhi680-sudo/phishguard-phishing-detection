/**
 * frontend/src/services/api.js
 * REST API client for PhishGuard FastAPI Backend.
 */

const API_BASE = window.location.port === '5173'
  ? 'http://127.0.0.1:8000/api'
  : '/api';

async function request(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    throw new Error('Unable to connect to the prediction server. Make sure the FastAPI backend is running on port 8000.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Unexpected response from server (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const detail = data?.detail || data?.error || `Request failed with status ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return data;
}

export const phishguardApi = {
  checkHealth: () => request('/health'),

  predictUrl: (url) =>
    request('/predict', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  getMetrics: () => request('/metrics'),

  getModelInfo: () => request('/model-info'),

  getHistory: ({ search = '', prediction = '', sort = 'desc', limit = 200 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (prediction && prediction !== 'all') params.set('prediction', prediction);
    if (sort) params.set('sort', sort);
    if (limit) params.set('limit', String(limit));
    return request(`/history?${params.toString()}`);
  },

  clearHistory: () =>
    request('/history', {
      method: 'DELETE',
    }),

  deleteHistoryItem: (id) =>
    request(`/history/${id}`, {
      method: 'DELETE',
    }),
};

export const checkHealth = phishguardApi.checkHealth;
export const predictUrl = phishguardApi.predictUrl;
export const fetchMetrics = phishguardApi.getMetrics;
export const fetchModelInfo = phishguardApi.getModelInfo;
export const fetchHistory = phishguardApi.getHistory;
export const clearHistory = phishguardApi.clearHistory;
export const deleteHistoryItem = phishguardApi.deleteHistoryItem;
