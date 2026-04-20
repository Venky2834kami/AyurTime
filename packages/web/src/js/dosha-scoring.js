/**
 * AyurTime - Dosha Scoring Engine
 * Issue #2: Dosha-Guided Onboarding Flow
 * Deterministic Vata/Pitta/Kapha scoring from quiz answers
 */

'use strict';

var DoshaScoring = (function () {

  /**
   * Calculate dosha scores from answers array
   * @param {Array} answers - Array of selected option objects with .scores {V, P, K}
   * @returns {Object} { primary, scores, percentages }
   */
  function calculate(answers) {
    var totals = { V: 0, P: 0, K: 0 };

    answers.forEach(function (answer) {
      totals.V += answer.scores.V || 0;
      totals.P += answer.scores.P || 0;
      totals.K += answer.scores.K || 0;
    });

    // Determine dominant dosha (tie-break: V > P > K)
    var primary = 'Vata';
    if (totals.P > totals.V && totals.P >= totals.K) primary = 'Pitta';
    if (totals.K > totals.V && totals.K > totals.P) primary = 'Kapha';

    // Calculate percentages
    var total = totals.V + totals.P + totals.K || 1;
    var percentages = {
      V: Math.round((totals.V / total) * 100),
      P: Math.round((totals.P / total) * 100),
      K: Math.round((totals.K / total) * 100)
    };

    return {
      primary: primary,
      scores: totals,
      percentages: percentages
    };
  }

  /**
   * Save dosha result and routine to localStorage
   * @param {String} dosha - 'Vata' | 'Pitta' | 'Kapha'
   * @param {Object} routine - routine object from dosha-questions.json
   */
  function saveResult(dosha, routine) {
    localStorage.setItem('ayurtime_dosha', dosha);
    localStorage.setItem('ayurtime_routine', JSON.stringify(routine.reminders));
    localStorage.setItem('ayurtime_onboarding_done', 'true');
  }

  /**
   * Check if user has completed onboarding
   * @returns {Boolean}
   */
  function isOnboardingDone() {
    return localStorage.getItem('ayurtime_onboarding_done') === 'true';
  }

  /**
   * Get saved dosha from localStorage
   * @returns {String} dosha name or null
   */
  function getSavedDosha() {
    return localStorage.getItem('ayurtime_dosha');
  }

  /**
   * Clear onboarding state (for retake from settings)
   */
  function resetOnboarding() {
    localStorage.removeItem('ayurtime_dosha');
    localStorage.removeItem('ayurtime_routine');
    localStorage.removeItem('ayurtime_onboarding_done');
  }

  // Public API
  return {
    calculate: calculate,
    saveResult: saveResult,
    isOnboardingDone: isOnboardingDone,
    getSavedDosha: getSavedDosha,
    resetOnboarding: resetOnboarding
  };

})();
