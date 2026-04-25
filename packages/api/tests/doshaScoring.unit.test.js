/**
 * Unit Tests — Dosha Scoring Service
 * Tests pure scoring logic independent of Express / HTTP.
 */

const {
  scoreDoshas,
  aggregateRawScores,
  normaliseScores,
  getAnswerWeights,
} = require('../services/doshaScoring');

// ─── getAnswerWeights ────────────────────────────────────────────────────────

describe('getAnswerWeights', () => {
  it('returns correct vata weight for slim body_frame', () => {
    const w = getAnswerWeights('body_frame', 'slim');
    expect(w.vata).toBe(3);
    expect(w.pitta).toBe(0);
    expect(w.kapha).toBe(0);
  });

  it('returns correct pitta weight for sensitive skin_type', () => {
    const w = getAnswerWeights('skin_type', 'sensitive');
    expect(w.pitta).toBe(3);
    expect(w.vata).toBe(0);
    expect(w.kapha).toBe(0);
  });

  it('returns equal neutral weights for unknown question/value', () => {
    const w = getAnswerWeights('unknown_question', 'unknown_value');
    expect(w).toEqual({ vata: 1, pitta: 1, kapha: 1 });
  });
});

// ─── normaliseScores ─────────────────────────────────────────────────────────

describe('normaliseScores', () => {
  it('sums to 1.0 for symmetric input', () => {
    const result = normaliseScores({ vata: 5, pitta: 5, kapha: 5 });
    expect(result.vata + result.pitta + result.kapha).toBeCloseTo(1.0, 2);
  });

  it('returns equal distribution when total is 0', () => {
    const result = normaliseScores({ vata: 0, pitta: 0, kapha: 0 });
    expect(result.vata).toBeCloseTo(0.333, 2);
    expect(result.pitta).toBeCloseTo(0.334, 2);
    expect(result.kapha).toBeCloseTo(0.333, 2);
  });

  it('correctly weights dominant vata', () => {
    const result = normaliseScores({ vata: 9, pitta: 3, kapha: 3 });
    expect(result.vata).toBeGreaterThan(result.pitta);
    expect(result.vata).toBeGreaterThan(result.kapha);
  });
});

// ─── scoreDoshas — core scoring logic ────────────────────────────────────────

describe('scoreDoshas — unit tests', () => {
  // TEST 1: All-Vata answers → dominant dosha should be vata
  it('TEST 1: all-vata answers → dominantDosha is vata', () => {
    const answers = [
      { questionId: 'body_frame',      value: 'slim' },
      { questionId: 'skin_type',       value: 'dry' },
      { questionId: 'appetite',        value: 'irregular' },
      { questionId: 'energy_level',    value: 'variable' },
      { questionId: 'sleep_pattern',   value: 'light' },
      { questionId: 'mind_nature',     value: 'creative' },
      { questionId: 'weight_tendency', value: 'lose_easily' },
      { questionId: 'stress_response', value: 'anxious' },
    ];
    const result = scoreDoshas(answers);
    expect(result.dominantDosha).toBe('vata');
    expect(result.scoreBreakdown.vata).toBeGreaterThan(0.9);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  // TEST 2: All-Pitta answers → dominant dosha should be pitta
  it('TEST 2: all-pitta answers → dominantDosha is pitta', () => {
    const answers = [
      { questionId: 'body_frame',      value: 'medium' },
      { questionId: 'skin_type',       value: 'sensitive' },
      { questionId: 'appetite',        value: 'strong' },
      { questionId: 'energy_level',    value: 'intense' },
      { questionId: 'sleep_pattern',   value: 'moderate' },
      { questionId: 'mind_nature',     value: 'focused' },
      { questionId: 'weight_tendency', value: 'moderate' },
      { questionId: 'stress_response', value: 'irritable' },
    ];
    const result = scoreDoshas(answers);
    expect(result.dominantDosha).toBe('pitta');
    expect(result.scoreBreakdown.pitta).toBeGreaterThan(0.9);
  });

  // TEST 3: All-Kapha answers → dominant dosha should be kapha
  it('TEST 3: all-kapha answers → dominantDosha is kapha', () => {
    const answers = [
      { questionId: 'body_frame',      value: 'large' },
      { questionId: 'skin_type',       value: 'oily' },
      { questionId: 'appetite',        value: 'slow' },
      { questionId: 'energy_level',    value: 'steady' },
      { questionId: 'sleep_pattern',   value: 'deep' },
      { questionId: 'mind_nature',     value: 'calm' },
      { questionId: 'weight_tendency', value: 'gain_easily' },
      { questionId: 'stress_response', value: 'withdrawn' },
    ];
    const result = scoreDoshas(answers);
    expect(result.dominantDosha).toBe('kapha');
    expect(result.scoreBreakdown.kapha).toBeGreaterThan(0.9);
  });

  // TEST 4: Mixed answers → scores always sum to ~1.0
  it('TEST 4: mixed answers → scoreBreakdown sums to 1.0', () => {
    const answers = [
      { questionId: 'body_frame',      value: 'slim' },
      { questionId: 'skin_type',       value: 'sensitive' },
      { questionId: 'appetite',        value: 'slow' },
      { questionId: 'energy_level',    value: 'intense' },
    ];
    const { scoreBreakdown } = scoreDoshas(answers);
    const sum = scoreBreakdown.vata + scoreBreakdown.pitta + scoreBreakdown.kapha;
    expect(sum).toBeCloseTo(1.0, 1);
  });

  // TEST 5: Empty answers array → fallback equal distribution
  it('TEST 5: empty answers → equal fallback distribution', () => {
    const result = scoreDoshas([]);
    expect(result.scoreBreakdown.vata + result.scoreBreakdown.pitta + result.scoreBreakdown.kapha)
      .toBeCloseTo(1.0, 1);
  });

  // TEST 6: Partial answers (4 questions) → still returns valid dominant dosha
  it('TEST 6: partial answers (4 of 8) → returns a valid dominant dosha', () => {
    const answers = [
      { questionId: 'body_frame',  value: 'large' },
      { questionId: 'skin_type',   value: 'oily' },
      { questionId: 'appetite',    value: 'slow' },
      { questionId: 'mind_nature', value: 'calm' },
    ];
    const result = scoreDoshas(answers);
    expect(['vata', 'pitta', 'kapha']).toContain(result.dominantDosha);
  });
});
