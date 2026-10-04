/**
 * main.js
 * PhishGuard AI — Advanced Interactive Frontend Controller
 * Handles live scanning, animated SVG gauges, scan history in localStorage,
 * batch analysis, and API console interactions.
 */

'use strict';

const STORAGE_KEY = 'phishguard_scan_history_v1';

// ============================================================
// Lifecycle & Initializations
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initCopyButtons();
    initRadialGauges();
    renderScanHistory();
    initBatchScanner();
    initApiDocsTester();
});

// ============================================================
// Navbar Scroll Blur Effect
// ============================================================
function initNavbarScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// ============================================================
// URL Quick Fills & Presets
// ============================================================
window.fillUrl = function (url) {
    const inputs = [
        document.getElementById('heroUrlInput'),
        document.getElementById('urlInput'),
        document.getElementById('liveUrlInput')
    ];
    for (const input of inputs) {
        if (input) {
            input.value = url;
            input.focus();
            break;
        }
    }
};

// ============================================================
// Interactive SVG Radial Gauge Animator
// ============================================================
function setRadialGauge(element, score) {
    if (!element) return;
    const circle = element.querySelector('.radial-gauge-progress');
    const valText = element.querySelector('.radial-gauge-value');
    if (!circle || !valText) return;

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;

    const boundedScore = Math.min(Math.max(score, 0), 100);
    const offset = circumference - (boundedScore / 100) * circumference;

    // Pick dynamic color based on risk severity
    let color = '#10b981'; // safe green
    if (boundedScore >= 70) {
        color = '#f43f5e'; // crimson red
    } else if (boundedScore >= 40) {
        color = '#f59e0b'; // amber orange
    }

    if (boundedScore <= 0) {
        valText.textContent = '0%';
        valText.style.color = color;
        circle.style.stroke = color;
        circle.style.strokeDashoffset = circumference;
        return;
    }

    // Count-up animation for the percentage number
    let current = 0;
    const step = Math.max(boundedScore / 25, 1);
    const timer = setInterval(() => {
        current += step;
        if (current >= boundedScore) {
            current = boundedScore;
            clearInterval(timer);
        }
        valText.textContent = `${Math.round(current)}%`;
        valText.style.color = color;
    }, 20);
}

function initRadialGauges() {
    document.querySelectorAll('.radial-gauge-container[data-score]').forEach(el => {
        const score = parseFloat(el.getAttribute('data-score')) || 0;
        setRadialGauge(el, score);
    });
}

// ============================================================
// Live In-Place URL Scanner with 4-Stage Stepper
// ============================================================
window.runLiveScan = async function (event) {
    if (event) event.preventDefault();

    const input = document.getElementById('liveUrlInput') || document.getElementById('urlInput') || document.getElementById('heroUrlInput');
    if (!input) return;

    const rawUrl = input.value.trim();
    if (!rawUrl) {
        showToast('Please enter a URL to analyze.', 'warning');
        input.focus();
        return;
    }

    const scanBtn = document.getElementById('liveScanBtn') || document.getElementById('analyzeBtn');
    const progressBox = document.getElementById('scanProgressBox');
    const resultContainer = document.getElementById('liveResultArea');

    if (scanBtn) scanBtn.disabled = true;
    if (progressBox) progressBox.classList.remove('d-none');
    if (resultContainer) resultContainer.classList.add('d-none');

    // Simulate stepping through deep cybersecurity inspection stages
    const steps = [
        { id: 'step-lexical', delay: 350 },
        { id: 'step-dns', delay: 450 },
        { id: 'step-heuristics', delay: 400 },
        { id: 'step-ml', delay: 500 }
    ];

    resetSteps();

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        activateStep(step.id);
        await new Promise(r => setTimeout(r, step.delay));
        completeStep(step.id);
    }

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: rawUrl })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
            displayLiveResults(data);
            saveToHistory(data);
        } else {
            showToast(data.error || 'Failed to analyze URL.', 'danger');
        }
    } catch (err) {
        showToast('Connection error connecting to ML inference engine.', 'danger');
        console.error(err);
    } finally {
        if (scanBtn) scanBtn.disabled = false;
        if (progressBox) progressBox.classList.add('d-none');
    }
};

function resetSteps() {
    ['step-lexical', 'step-dns', 'step-heuristics', 'step-ml'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.className = 'scan-step-item';
            const icon = el.querySelector('i');
            if (icon) icon.className = 'fas fa-circle-notch';
        }
    });
}

function activateStep(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    const icon = el.querySelector('i');
    if (icon) icon.className = 'fas fa-spinner fa-spin';
}

function completeStep(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    el.classList.add('completed');
    const icon = el.querySelector('i');
    if (icon) icon.className = 'fas fa-check-circle';
}

// Display Live Scan Results
function displayLiveResults(res) {
    const container = document.getElementById('liveResultArea');
    if (!container) return;
    container.classList.remove('d-none');

    const isPhish = res.prediction === 'PHISHING';
    const banner = document.getElementById('resVerdictBanner');
    if (banner) {
        banner.className = `verdict-banner ${isPhish ? 'verdict-phishing' : 'verdict-legitimate'}`;
    }

    const badge = document.getElementById('resVerdictBadge');
    if (badge) {
        badge.className = `verdict-badge ${isPhish ? 'badge-danger' : 'badge-success'}`;
        badge.innerHTML = isPhish 
            ? '<i class="fas fa-skull-crossbones me-2"></i> PHISHING DETECTED'
            : '<i class="fas fa-shield-check me-2"></i> LEGITIMATE (SAFE)';
    }

    const urlDisplay = document.getElementById('resAnalyzedUrl');
    if (urlDisplay) urlDisplay.textContent = res.url;

    const confDisplay = document.getElementById('resConfidence');
    if (confDisplay) confDisplay.textContent = `${res.confidence || 0}%`;

    const probDisplay = document.getElementById('resProbability');
    if (probDisplay) probDisplay.textContent = `${(res.probability || 0).toFixed(3)}`;

    const recDisplay = document.getElementById('resRecommendation');
    if (recDisplay) recDisplay.textContent = res.safety_recommendation;

    // Animate radial gauge
    const gaugeEl = document.getElementById('resGauge');
    if (gaugeEl) {
        setRadialGauge(gaugeEl, res.risk_score || 0);
    }

    // Populate factors
    const factorsList = document.getElementById('resFactorsList');
    if (factorsList) {
        factorsList.innerHTML = '';
        const factors = res.contributing_factors || [];
        if (factors.length === 0) {
            factorsList.innerHTML = '<div class="text-muted small">No specific threat flags detected.</div>';
        } else {
            factors.forEach(f => {
                const item = document.createElement('div');
                item.className = 'factor-list-item';
                item.innerHTML = `
                    <i class="fas ${isPhish ? 'fa-exclamation-triangle factor-icon-danger' : 'fa-check-circle factor-icon-safe'}"></i>
                    <span>${escapeHtml(f)}</span>
                `;
                factorsList.appendChild(item);
            });
        }
    }

    // Populate Raw JSON
    const jsonBlock = document.getElementById('resJsonCode');
    if (jsonBlock) {
        jsonBlock.textContent = JSON.stringify(res, null, 2);
    }

    // Populate Feature Badges
    const featGrid = document.getElementById('resFeatureGrid');
    if (featGrid && res.interpretable_features) {
        featGrid.innerHTML = '';
        const f = res.interpretable_features;
        const keys = [
            { k: 'url_length', label: 'URL Length' },
            { k: 'domain_length', label: 'Domain Length' },
            { k: 'num_subdomains', label: 'Subdomains' },
            { k: 'has_https', label: 'HTTPS Encrypted' },
            { k: 'entropy', label: 'Shannon Entropy' },
            { k: 'num_hyphens', label: 'Hyphens in Domain' },
            { k: 'num_dots', label: 'Dot Count' },
            { k: 'has_suspicious_keywords', label: 'Keyword Flag' }
        ];

        keys.forEach(item => {
            const val = f[item.k];
            const col = document.createElement('div');
            col.className = 'col-6 col-md-3';
            col.innerHTML = `
                <div class="feature-badge-card">
                    <div class="feature-badge-name">${item.label}</div>
                    <div class="feature-badge-value text-info">${val !== undefined ? val : 'N/A'}</div>
                </div>
            `;
            featGrid.appendChild(col);
        });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================
// LocalStorage Scan History Manager
// ============================================================
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveToHistory(result) {
    const list = getHistory();
    const entry = {
        url: result.url,
        prediction: result.prediction,
        risk_score: result.risk_score,
        confidence: result.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    // Prepend and limit to 8 entries
    const updated = [entry, ...list.filter(x => x.url !== entry.url)].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    renderScanHistory();
}

function renderScanHistory() {
    const listEl = document.getElementById('scanHistoryList');
    if (!listEl) return;

    const history = getHistory();
    if (history.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-4 text-muted small">
                <i class="fas fa-history me-1"></i> No recent scans in this session yet.
            </div>`;
        return;
    }

    listEl.innerHTML = '';
    history.forEach(item => {
        const isPhish = item.prediction === 'PHISHING';
        const card = document.createElement('div');
        card.className = 'feature-badge-card mb-2 d-flex align-items-center justify-content-between';
        card.innerHTML = `
            <div class="text-truncate me-3" style="max-width: 65%;">
                <div class="font-monospace small text-truncate" title="${escapeHtml(item.url)}">
                    ${escapeHtml(item.url)}
                </div>
                <small class="text-muted">${item.timestamp} &bull; Risk: <strong>${item.risk_score}%</strong></small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span class="badge ${isPhish ? 'bg-danger' : 'bg-success'} text-uppercase" style="font-size: 0.72rem;">
                    ${item.prediction}
                </span>
                <button class="btn btn-sm btn-outline-info p-1 px-2" onclick="fillUrl('${escapeHtml(item.url)}'); window.runLiveScan();" title="Re-scan">
                    <i class="fas fa-redo-alt"></i>
                </button>
            </div>
        `;
        listEl.appendChild(card);
    });
}

window.clearScanHistory = function () {
    localStorage.removeItem(STORAGE_KEY);
    renderScanHistory();
    showToast('Scan history cleared.', 'info');
};

// ============================================================
// Batch URL Scanner
// ============================================================
function initBatchScanner() {
    const batchBtn = document.getElementById('startBatchBtn');
    if (!batchBtn) return;

    batchBtn.addEventListener('click', async () => {
        const textarea = document.getElementById('batchUrlsInput');
        if (!textarea) return;

        const lines = textarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) {
            showToast('Please enter at least one URL.', 'warning');
            return;
        }

        const tableBody = document.getElementById('batchResultsBody');
        const summaryBox = document.getElementById('batchSummaryCard');
        batchBtn.disabled = true;
        batchBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Analyzing...';

        try {
            const res = await fetch('/api/analyze-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: lines })
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                if (summaryBox) {
                    summaryBox.classList.remove('d-none');
                    document.getElementById('batchPhishCount').textContent = data.summary.phishing_detected;
                    document.getElementById('batchSafeCount').textContent = data.summary.legitimate_detected;
                    document.getElementById('batchTotalCount').textContent = data.total_analyzed;
                }

                if (tableBody) {
                    tableBody.innerHTML = '';
                    data.results.forEach((r, idx) => {
                        const isPhish = r.prediction === 'PHISHING';
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><span class="badge bg-secondary font-monospace">#${idx + 1}</span></td>
                            <td class="font-monospace text-truncate" style="max-width: 280px;" title="${escapeHtml(r.url)}">${escapeHtml(r.url)}</td>
                            <td>
                                <span class="badge ${isPhish ? 'bg-danger' : 'bg-success'} text-uppercase">
                                    ${r.prediction}
                                </span>
                            </td>
                            <td><strong style="color: ${isPhish ? '#f43f5e' : '#10b981'}">${r.risk_score}%</strong></td>
                            <td>${r.confidence}%</td>
                            <td>
                                <button class="btn btn-sm btn-outline-info py-0 px-2" onclick="fillUrl('${escapeHtml(r.url)}'); window.runLiveScan();">
                                    Inspect
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(tr);
                    });
                }
            } else {
                showToast(data.error || 'Batch scan failed.', 'danger');
            }
        } catch (err) {
            showToast('Batch analysis failed.', 'danger');
            console.error(err);
        } finally {
            batchBtn.disabled = false;
            batchBtn.innerHTML = '<i class="fas fa-play me-2"></i> Start Batch Scan';
        }
    });
}

// ============================================================
// Interactive REST API Console for Developers
// ============================================================
function initApiDocsTester() {
    const testBtn = document.getElementById('apiTestSubmitBtn');
    if (!testBtn) return;

    testBtn.addEventListener('click', async () => {
        const endpoint = document.getElementById('apiTestEndpoint').value;
        const method = document.getElementById('apiTestMethod').value;
        const bodyInput = document.getElementById('apiTestPayload');
        const output = document.getElementById('apiTestOutput');

        testBtn.disabled = true;
        output.textContent = 'Sending request to engine...';

        try {
            const options = { method: method, headers: { 'Content-Type': 'application/json' } };
            if (method === 'POST' && bodyInput) {
                options.body = bodyInput.value;
            }

            const res = await fetch(endpoint, options);
            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            output.textContent = `Error: ${err.message}`;
        } finally {
            testBtn.disabled = false;
        }
    });
}

// ============================================================
// Clipboard & Toast Utilities
// ============================================================
function initCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy-target');
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            const text = targetEl.value || targetEl.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!', 'info');
            });
        });
    });
}

function showToast(message, type = 'info') {
    let container = document.getElementById('cyberToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cyberToastContainer';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const color = type === 'danger' ? '#f43f5e' : type === 'warning' ? '#f59e0b' : '#38bdf8';
    toast.style.cssText = `
        background: #0c1326;
        border: 1px solid ${color};
        color: #fff;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 0.88rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-info-circle me-2" style="color:${color};"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}
