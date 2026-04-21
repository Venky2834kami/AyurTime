/**
 * api.config.js
 * AyurTime - Environment-aware API configuration
 * Phase 6: Complete Integration & Harden Prakriti Experience
 */

(function (window) {
  'use strict';

  // ── Environment Detection ──────────────────────────────────────────────────
  const ENV = (function detectEnv() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'development';
    }
    if (host.includes('staging') || host.includes('test') || host.includes('github.io')) {
      return 'staging';
    }
    return 'production';
  })();

  // ── Base URL Map ───────────────────────────────────────────────────────────
  const BASE_URLS = {
    development: 'http://localhost:3000',
    staging: 'https://ayurtime-staging.example.com',
    production: 'https://api.ayurtime.app'
  };

  // ── Retry Config ──────────────────────────────────────────────────────────
  const RETRY_CONFIG = {
    maxRetries: 1,
    retryDelay: 2000  // ms
  };

  // ── Timeout ───────────────────────────────────────────────────────────────
  const REQUEST_TIMEOUT_MS = 10000;

  // ── Endpoints ─────────────────────────────────────────────────────────────
  const ENDPOINTS = {
    prakritiAnalysis: '/api/v1/prakriti/analyze',
    recommendations:  '/api/v1/recommendations',
    history:          '/api/v1/user/history'
  };

  // ── Core fetch with retry + timeout ───────────────────────────────────────
  /**
   * fetchWithRetry
   * Wraps fetch with:
   *   - AbortController timeout
   *   - 1 automatic retry on network failure (with 2 s delay)
   *   - Rejects with structured error for callers to show fallback UI
   *
   * @param {string} url
   * @param {RequestInit} options
   * @param {number} [attempt=0]
   * @returns {Promise<Response>}
   */
  async function fetchWithRetry(url, options = {}, attempt = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);

      const isRetryable = attempt < RETRY_CONFIG.maxRetries &&
        (err.name === 'AbortError' || err.name === 'TypeError');

      if (isRetryable) {
        console.warn(`[AyurTime API] Retry attempt ${attempt + 1} for ${url}`);
        await delay(RETRY_CONFIG.retryDelay);
        return fetchWithRetry(url, options, attempt + 1);
      }

      throw err;
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  const AyurTimeAPI = {
    env: ENV,
    baseUrl: BASE_URLS[ENV],

    /**
     * Analyze Prakriti via backend.
     * Falls back to client-side scoring if network is unavailable.
     *
     * @param {Object} answers - { questionId: selectedOption, ... }
     * @returns {Promise<{characteristics: string[], recommendations: Object, analysisId: string}>}
     */
    async analyzePrakriti(answers) {
      const url = this.baseUrl + ENDPOINTS.prakritiAnalysis;
      try {
        const response = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        });
        const data = await response.json();
        // Persist analysis ID for history page
        if (data.analysisId) {
          localStorage.setItem('ayurtime_last_analysis_id', data.analysisId);
          AyurTimeAPI._appendHistory(data);
        }
        return data;
      } catch (err) {
        console.warn('[AyurTime API] Backend unreachable, using client-side fallback.', err);
        return AyurTimeAPI._clientSideFallback(answers);
      }
    },

    /**
     * Fetch user history from backend.
     * @returns {Promise<Array>}
     */
    async getHistory() {
      const url = this.baseUrl + ENDPOINTS.history;
      try {
        const response = await fetchWithRetry(url, { method: 'GET' });
        return response.json();
      } catch (err) {
        console.warn('[AyurTime API] History fetch failed, returning local history.', err);
        return AyurTimeAPI._getLocalHistory();
      }
    },

    // ── Client-Side Fallback Scoring ─────────────────────────────────────────
    _clientSideFallback(answers) {
      const scores = { vata: 0, pitta: 0, kapha: 0 };
      const DOSHA_MAP = {
        // lightweight rule set; mirrors backend logic
        light: 'vata', creative: 'vata', active: 'pitta',
        focused: 'pitta', calm: 'kapha', steady: 'kapha'
      };
      Object.values(answers).forEach(val => {
        const dosha = DOSHA_MAP[val];
        if (dosha) scores[dosha]++;
      });

      const dominant = Object.keys(scores).reduce((a, b) =>
        scores[a] >= scores[b] ? a : b
      );

      const result = {
        analysisId: 'local_' + Date.now(),
        source: 'client-fallback',
        dominant,
        scores,
        characteristics: CHARACTERISTICS[dominant] || [],
        recommendations: RECOMMENDATIONS[dominant] || {}
      };

      localStorage.setItem('ayurtime_last_analysis_id', result.analysisId);
      AyurTimeAPI._appendHistory(result);
      return result;
    },

    // ── Local History Helpers ────────────────────────────────────────────────
    _appendHistory(entry) {
      const history = AyurTimeAPI._getLocalHistory();
      history.unshift({ ...entry, timestamp: new Date().toISOString() });
      // Keep last 20 entries
      localStorage.setItem('ayurtime_history', JSON.stringify(history.slice(0, 20)));
    },

    _getLocalHistory() {
      try {
        return JSON.parse(localStorage.getItem('ayurtime_history') || '[]');
      } catch (_) {
        return [];
      }
    }
  };

  // ── Static Data for Fallback ───────────────────────────────────────────────
  const CHARACTERISTICS = {
    vata:  ['Creative', 'Quick-thinking', 'Light & energetic', 'Enthusiastic', 'Adaptable'],
    pitta: ['Focused', 'Determined', 'Sharp intellect', 'Passionate', 'Natural leader'],
    kapha: ['Calm', 'Compassionate', 'Steady & grounded', 'Loyal', 'Patient']
  };

  const RECOMMENDATIONS = {
    vata: {
      diet:      ['Warm, oily foods', 'Sweet, sour & salty tastes', 'Cooked vegetables', 'Ghee & sesame oil'],
      lifestyle: ['Regular daily routine', 'Warm oil self-massage (Abhyanga)', 'Adequate rest', 'Gentle yoga'],
      herbs:     ['Ashwagandha', 'Shatavari', 'Triphala', 'Brahmi']
    },
    pitta: {
      diet:      ['Cool, refreshing foods', 'Sweet, bitter & astringent tastes', 'Coconut water', 'Leafy greens'],
      lifestyle: ['Avoid overheating', 'Moonlight walks', 'Cooling pranayama', 'Moderate exercise'],
      herbs:     ['Amalaki', 'Brahmi', 'Neem', 'Coriander']
    },
    kapha: {
      diet:      ['Light, dry foods', 'Pungent, bitter & astringent tastes', 'Honey', 'Legumes & grains'],
      lifestyle: ['Vigorous daily exercise', 'Early rising', 'Dry massage (Garshana)', 'Stimulating activities'],
      herbs:     ['Trikatu', 'Guggul', 'Punarnava', 'Ginger']
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  window.AyurTimeAPI = AyurTimeAPI;

})(window);
