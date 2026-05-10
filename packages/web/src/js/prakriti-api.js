/**
 * AyurTime - Prakriti API Integration Module (Issue #21)
 * Replaces client-side DoshaScoring.calculate() with backend API call.
 * Handles loading state, error state, results display, and analysisId storage.
 */

(function () {
  'use strict';

  const API_BASE = window.AYURTIME_API_URL || 'http://localhost:3001';
  const API_ENDPOINT = `${API_BASE}/api/prakriti/analyze`;

  // ─── UI State Management ──────────────────────────────────────────────────────

  function showLoading() {
    const quiz = document.getElementById('prakriti-quiz');
    const loader = document.getElementById('prakriti-loading');
    const results = document.getElementById('prakriti-results');
    const errorEl = document.getElementById('prakriti-error');

    if (quiz) quiz.style.display = 'none';
    if (loader) loader.style.display = 'flex';
    if (results) results.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showError(message) {
    const quiz = document.getElementById('prakriti-quiz');
    const loader = document.getElementById('prakriti-loading');
    const results = document.getElementById('prakriti-results');
    const errorEl = document.getElementById('prakriti-error');
    const errorMsg = document.getElementById('prakriti-error-message');

    if (quiz) quiz.style.display = 'block';
    if (loader) loader.style.display = 'none';
    if (results) results.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
    if (errorMsg) errorMsg.textContent = message;
  }

  function showResults(analysis) {
    const quiz = document.getElementById('prakriti-quiz');
    const loader = document.getElementById('prakriti-loading');
    const results = document.getElementById('prakriti-results');
    const errorEl = document.getElementById('prakriti-error');

    if (quiz) quiz.style.display = 'none';
    if (loader) loader.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (results) {
      results.style.display = 'block';
      renderResults(analysis);
    }
  }

  // ─── Results Renderer ───────────────────────────────────────────────────────

  function renderResults(analysis) {
    const { dominantDosha, scoreBreakdown, recommendationSummary, analysisId, confidence } = analysis;

    // Dominant dosha badge
    const doshaEl = document.getElementById('result-dominant-dosha');
    if (doshaEl) {
      doshaEl.textContent = dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1);
      doshaEl.className = `dosha-badge dosha-${dominantDosha}`;
    }

    // Confidence
    const confEl = document.getElementById('result-confidence');
    if (confEl) confEl.textContent = `${Math.round(confidence * 100)}% confidence`;

    // Score breakdown bars
    ['vata', 'pitta', 'kapha'].forEach(dosha => {
      const pct = Math.round((scoreBreakdown[dosha] || 0) * 100);
      const bar = document.getElementById(`score-${dosha}`);
      const label = document.getElementById(`score-${dosha}-pct`);
      if (bar) bar.style.width = `${pct}%`;
      if (label) label.textContent = `${pct}%`;
    });

    // Recommendations
    const renderList = (id, items) => {
      const el = document.getElementById(id);
      if (el && Array.isArray(items)) {
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
      }
    };
    renderList('rec-diet', recommendationSummary?.diet);
    renderList('rec-lifestyle', recommendationSummary?.lifestyle);
    renderList('rec-herbs', recommendationSummary?.herbs);

    // Analysis ID display
    const idEl = document.getElementById('result-analysis-id');
    if (idEl) idEl.textContent = analysisId;
  }

  // ─── Quiz Answer Collection ───────────────────────────────────────────────────

  function collectAnswers(form) {
    const answers = [];
    const inputs = form.querySelectorAll('input[name], select[name], [data-question-id]');
    inputs.forEach(input => {
      const questionId = input.dataset.questionId || input.name;
      const value = input.type === 'radio'
        ? (input.checked ? input.value : null)
        : input.value;
      if (questionId && value !== null && value !== '') {
        answers.push({ questionId, value });
      }
    });
    return answers;
  }

  // ─── Main API Call ───────────────────────────────────────────────────────────

  async function analyzeWithBackend(answers, userId) {
    const payload = { userId: userId || 'anonymous', answers };

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.details
        ? errData.details.join(', ')
        : errData.message || `Server error (${res.status})`;
      throw new Error(msg);
    }

    return res.json();
  }

  // ─── Submit Handler (Replaces DoshaScoring.calculate()) ──────────────────────

  async function handleQuizSubmit(event) {
    event.preventDefault();

    const form = event.target.closest('form') || document.getElementById('prakriti-quiz-form');
    if (!form) return;

    const answers = collectAnswers(form);
    if (answers.length === 0) {
      showError('Please answer at least one question before submitting.');
      return;
    }

    showLoading();

    try {
      const analysis = await analyzeWithBackend(answers);

      // Store analysisId in localStorage for session continuity
      try {
        localStorage.setItem('ayurtime_analysis_id', analysis.analysisId);
        localStorage.setItem('ayurtime_dominant_dosha', analysis.dominantDosha);
        localStorage.setItem('ayurtime_last_analyzed', analysis.createdAt);
      } catch (e) {
        // localStorage may be blocked in some environments — non-fatal
        console.warn('[AyurTime] localStorage not available:', e.message);
      }

      showResults(analysis);
    } catch (err) {
      console.error('[AyurTime] Analysis failed:', err);
      showError(
        err.message.includes('fetch')
          ? 'Cannot connect to the server. Please check your connection and try again.'
          : err.message
      );
    }
  }

  // ─── Init: Bind to quiz form submit ───────────────────────────────────────────

  function init() {
    // Bind to any existing submit button with data-action="analyze"
    document.querySelectorAll('[data-action="analyze"]').forEach(btn => {
      btn.addEventListener('click', handleQuizSubmit);
    });

    // Also bind to form submit directly
    const form = document.getElementById('prakriti-quiz-form');
    if (form) {
      form.addEventListener('submit', handleQuizSubmit);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for programmatic use
  window.AyurTimeAPI = { analyzeWithBackend, handleQuizSubmit };

})();
