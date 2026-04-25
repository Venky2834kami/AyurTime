/**
 * Dosha Scoring Service — AyurTime API
 *
 * Pure functions; no Express dependencies — easily unit-testable.
 *
 * Scoring rules:
 *  - Each answer maps to a primary dosha via DOSHA_MAP.
 *  - If no mapping exists the question contributes equally to all three (neutral).
 *  - Scores are normalised to sum to 1.0.
 *  - Dominant dosha = highest normalised score.
 */

/** Rule-based mapping: questionId → value → dosha weights */
const DOSHA_MAP = {
  body_frame:      { slim: { vata: 3 }, medium: { pitta: 3 }, large: { kapha: 3 } },
  skin_type:       { dry: { vata: 3 }, sensitive: { pitta: 3 }, oily: { kapha: 3 } },
  appetite:        { irregular: { vata: 3 }, strong: { pitta: 3 }, slow: { kapha: 3 } },
  energy_level:    { variable: { vata: 3 }, intense: { pitta: 3 }, steady: { kapha: 3 } },
  sleep_pattern:   { light: { vata: 3 }, moderate: { pitta: 3 }, deep: { kapha: 3 } },
  mind_nature:     { creative: { vata: 3 }, focused: { pitta: 3 }, calm: { kapha: 3 } },
  weight_tendency: { lose_easily: { vata: 3 }, moderate: { pitta: 3 }, gain_easily: { kapha: 3 } },
  stress_response: { anxious: { vata: 3 }, irritable: { pitta: 3 }, withdrawn: { kapha: 3 } },
};

/**
 * Returns raw dosha weights for a single answer.
 * Falls back to { vata:1, pitta:1, kapha:1 } when unknown.
 * @param {string} questionId
 * @param {string} value
 * @returns {{ vata: number, pitta: number, kapha: number }}
 */
function getAnswerWeights(questionId, value) {
  const mapped = DOSHA_MAP[questionId]?.[value];
  if (mapped) {
    return { vata: 0, pitta: 0, kapha: 0, ...mapped };
  }
  return { vata: 1, pitta: 1, kapha: 1 };
}

/**
 * Aggregates raw scores from all answers.
 * @param {Array<{questionId: string, value: string}>} answers
 * @returns {{ vata: number, pitta: number, kapha: number }} raw totals
 */
function aggregateRawScores(answers) {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  answers.forEach(({ questionId, value }) => {
    const w = getAnswerWeights(questionId, value);
    totals.vata  += w.vata;
    totals.pitta += w.pitta;
    totals.kapha += w.kapha;
  });
  return totals;
}

/**
 * Normalises raw scores to sum to 1.0.
 * Falls back to equal distribution if total is 0.
 * @param {{ vata: number, pitta: number, kapha: number }} raw
 * @returns {{ vata: number, pitta: number, kapha: number }}
 */
function normaliseScores(raw) {
  const total = raw.vata + raw.pitta + raw.kapha;
  if (total === 0) return { vata: 0.333, pitta: 0.334, kapha: 0.333 };
  return {
    vata:  parseFloat((raw.vata  / total).toFixed(3)),
    pitta: parseFloat((raw.pitta / total).toFixed(3)),
    kapha: parseFloat((raw.kapha / total).toFixed(3)),
  };
}

/**
 * Main scoring function — converts answers to a scored breakdown.
 * @param {Array<{questionId: string, value: string}>} answers
 * @returns {{
 *   scoreBreakdown: { vata: number, pitta: number, kapha: number },
 *   dominantDosha: string,
 *   confidence: number
 * }}
 */
function scoreDoshas(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      scoreBreakdown: { vata: 0.333, pitta: 0.334, kapha: 0.333 },
      dominantDosha: 'pitta',
      confidence: 0.334,
    };
  }

  const raw = aggregateRawScores(answers);
  const scoreBreakdown = normaliseScores(raw);
  const dominantDosha = Object.entries(scoreBreakdown)
    .sort(([, a], [, b]) => b - a)[0][0];
  const confidence = scoreBreakdown[dominantDosha];

  return { scoreBreakdown, dominantDosha, confidence };
}

module.exports = { scoreDoshas, aggregateRawScores, normaliseScores, getAnswerWeights, DOSHA_MAP };
