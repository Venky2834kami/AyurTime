/**
 * consult-engine-tkdl.js
 * AyurTime — TKDL-style consultation engine
 * Integrates with packages/web/src/data/ JSON knowledge bases
 * Pipeline: input -> normalize -> extract -> dosha score -> tkrc map -> safety filter -> rank -> explain -> output
 */

// ============================================================
// DATA LOADING (adapt import paths to your bundler / module system)
// ============================================================
import symptomsData from '../data/symptoms-tkrc.json';
import recommendationsData from '../data/recommendations-lifestyle.json';

// Build indexes for O(1) lookup
const symptomIndex = symptomsData.reduce((acc, node) => {
  acc[node.id] = node;
  acc[node.label.toLowerCase()] = node;
  return acc;
}, {});

const recommendationIndex = recommendationsData;

// ============================================================
// SYNONYM MAP (canonical symptom normalization)
// ============================================================
const SYMPTOM_SYNONYMS = {
  'bloating': 'symptom_bloating_001',
  'gas': 'symptom_bloating_001',
  'stomach bloating': 'symptom_bloating_001',
  'restless sleep': 'symptom_sleep_light_001',
  'poor sleep': 'symptom_sleep_light_001',
  'light sleep': 'symptom_sleep_light_001',
  'insomnia': 'symptom_sleep_light_001',
  'dryness': 'symptom_dry_skin_001',
  'dry skin': 'symptom_dry_skin_001',
  'fatigue': 'symptom_fatigue_001',
  'tiredness': 'symptom_fatigue_001',
  'low energy': 'symptom_fatigue_001',
  'exhaustion': 'symptom_fatigue_001',
  'stress': 'symptom_anxiety_stress_001',
  'anxiety': 'symptom_anxiety_stress_001',
  'worry': 'symptom_anxiety_stress_001',
  'indigestion': 'symptom_indigestion_001',
  'slow digestion': 'symptom_indigestion_001',
  'sluggish digestion': 'symptom_indigestion_001',
  'joint pain': 'symptom_joint_stiffness_001',
  'stiff joints': 'symptom_joint_stiffness_001',
  'joint stiffness': 'symptom_joint_stiffness_001',
  'congestion': 'symptom_respiratory_congestion_001',
  'nasal congestion': 'symptom_respiratory_congestion_001',
  'stuffy nose': 'symptom_respiratory_congestion_001',
  'heaviness': 'symptom_respiratory_congestion_001'
};

// ============================================================
// RED FLAGS (always escalate these)
// ============================================================
const RED_FLAG_KEYWORDS = new Set([
  'chest pain', 'chest_pain',
  'breathing difficulty', 'breathing_difficulty', 'cant breathe', 'shortness of breath',
  'high fever', 'high_fever', 'fever above 103',
  'fainting', 'fainted', 'unconscious',
  'confusion', 'confused', 'disoriented',
  'persistent vomiting', 'persistent_vomiting', 'vomiting blood',
  'severe dehydration', 'severe_dehydration',
  'stroke', 'heart attack', 'seizure'
]);

// ============================================================
// NORMALIZATION
// ============================================================
function normalizeInput(text) {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

function tokenize(text) {
  return text.split(' ').filter(Boolean);
}

function detectRedFlags(text) {
  const flags = [];
  RED_FLAG_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) flags.push(kw);
  });
  return flags;
}

function extractSymptomIds(normalizedText) {
  const found = new Set();
  // Check synonym map first (multi-word phrases)
  Object.keys(SYMPTOM_SYNONYMS).forEach(phrase => {
    if (normalizedText.includes(phrase)) {
      found.add(SYMPTOM_SYNONYMS[phrase]);
    }
  });
  // Fallback: single token match against symptom index labels
  tokenize(normalizedText).forEach(token => {
    if (symptomIndex[token]) {
      found.add(symptomIndex[token].id);
    }
  });
  return Array.from(found);
}

// ============================================================
// DOSHA SCORING
// ============================================================
function scoreDoshas(symptomIds, userContext = {}) {
  const score = { vata: 0, pitta: 0, kapha: 0 };
  symptomIds.forEach(id => {
    const node = symptomIndex[id];
    if (!node || !node.dosha_action_profile) return;
    if (node.dosha_action_profile.vata === 'up') score.vata += 2;
    if (node.dosha_action_profile.pitta === 'up') score.pitta += 2;
    if (node.dosha_action_profile.kapha === 'up') score.kapha += 2;
  });
  // Boost from Prakriti baseline if known
  if (userContext.prakriti && score[userContext.prakriti] !== undefined) {
    score[userContext.prakriti] += 1;
  }
  return score;
}

// ============================================================
// TKRC-STYLE THERAPEUTIC BAND MAPPING
// ============================================================
function mapToTherapeuticBands(symptomIds) {
  const bands = {};
  symptomIds.forEach(id => {
    const node = symptomIndex[id];
    if (!node) return;
    const key = node.tkrc_therapeutic_area || 'general_support';
    bands[key] = (bands[key] || 0) + 1;
  });
  return bands;
}

// ============================================================
// SAFETY FILTER
// ============================================================
function applySafetyFilter(recommendations, userContext = {}) {
  return recommendations.filter(rec => {
    if (!rec.safety_band) return true;
    if (rec.safety_band === 'do_not_surface_directly') return false;
    if (rec.safety_band === 'practitioner_only') return false;
    const flags = rec.contraindication_flags || [];
    if (userContext.isPregnant && flags.includes('pregnancy')) return false;
    if (userContext.ageGroup === 'child' && flags.includes('child')) return false;
    if (userContext.ageGroup === 'elderly' && flags.includes('elderly')) return false;
    return true;
  });
}

// ============================================================
// RECOMMENDATION RANKING
// ============================================================
function rankRecommendations(recommendations, doshaScores, therapeuticBands) {
  return recommendations
    .map(rec => {
      let score = 0;
      // Watch-safe bonus
      if (rec.watch_suitability === 'high') score += 3;
      if (rec.watch_suitability === 'medium') score += 1;
      // Low-risk lifestyle preference
      if (rec.safety_band === 'low_risk') score += 3;
      if (rec.dosage_form_category === 'lifestyle') score += 4;
      if (rec.dosage_form_category === 'dietary_pattern') score += 3;
      if (rec.dosage_form_category === 'breathwork') score += 3;
      if (rec.dosage_form_category === 'movement') score += 2;
      // TKRC band match
      Object.keys(therapeuticBands).forEach(band => {
        if (rec.tkrc_therapeutic_area === band) score += therapeuticBands[band] * 2;
      });
      // Quality signals
      if (rec.confidence_level === 'high') score += 2;
      if (rec.confidence_level === 'medium') score += 1;
      if (rec.human_review_status === 'reviewed') score += 2;
      // Penalise practitioner-guided
      if (rec.dosage_form_category === 'practitioner_guided_internal_use') score -= 6;
      return { ...rec, _rankScore: score };
    })
    .sort((a, b) => b._rankScore - a._rankScore);
}

// ============================================================
// CONFIDENCE SCORING
// ============================================================
function calculateConfidence(symptomIds, rankedRecs) {
  let score = 0;
  if (symptomIds.length >= 2) score += 2;
  if (symptomIds.length >= 4) score += 1;
  if (rankedRecs.length >= 3) score += 2;
  if (rankedRecs.some(r => r.human_review_status === 'reviewed')) score += 2;
  if (rankedRecs.some(r => r.confidence_level === 'high')) score += 1;
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// ============================================================
// EXPLANATION BUILDER
// ============================================================
function buildExplanation({ symptomIds, doshaScores, therapeuticBands, confidence }) {
  const dominantEntry = Object.entries(doshaScores).sort((a, b) => b[1] - a[1])[0];
  const dominantDosha = dominantEntry ? dominantEntry[0] : null;
  const dominantBands = Object.keys(therapeuticBands).sort((a, b) => therapeuticBands[b] - therapeuticBands[a]);
  const confidenceNote = confidence === 'low'
    ? 'Confidence is low due to limited symptom input. Please share more details for better guidance.'
    : `Confidence: ${confidence}.`;
  return {
    summary: 'Suggestions are based on your reported symptoms, dosha tendency, and TKDL-style lifestyle classification.',
    dominantDosha,
    dominantTherapeuticAreas: dominantBands.slice(0, 2),
    matchedSymptomCount: symptomIds.length,
    confidenceNote,
    disclaimer: [
      'AyurTime is an educational and lifestyle-support tool only.',
      'This output is not a medical diagnosis and does not replace a physician, Vaidya, or emergency care.',
      'For severe, persistent, or worsening symptoms, please consult a qualified practitioner immediately.'
    ]
  };
}

// ============================================================
// ESCALATION RESPONSE
// ============================================================
function buildEscalationResponse(redFlags, doshaScores) {
  return {
    mode: 'escalation',
    priority: 'urgent',
    message: 'One or more of your symptoms may need prompt medical attention. This wellness coach cannot replace a doctor or emergency services.',
    redFlags,
    doshaScores,
    recommendations: [],
    disclaimer: [
      'AyurTime is not an emergency service.',
      'Please contact a qualified clinician, Ayurvedic physician, or emergency services based on symptom severity.'
    ]
  };
}

// ============================================================
// AUDIT HOOK
// ============================================================
function auditConsult(payload) {
  const entry = {
    timestamp: new Date().toISOString(),
    event_type: 'consult_run',
    prior_art_reference_type: 'internal_logic_rule',
    ...payload
  };
  // Replace with backend POST in Phase 4
  console.log('AYURTIME_AUDIT', JSON.stringify(entry));
}

// ============================================================
// MAIN PIPELINE
// ============================================================
export function runTKDLConsult(userInput, userContext = {}) {
  // Step 1: Normalize
  const normalized = normalizeInput(userInput);

  // Step 2: Red-flag check (always first)
  const redFlags = detectRedFlags(normalized);
  if (redFlags.length > 0) {
    const escalation = buildEscalationResponse(redFlags, {});
    auditConsult({ userInput: normalized, redFlags, symptomIds: [], recommendationIds: [], confidence: null });
    return escalation;
  }

  // Step 3: Extract symptom IDs
  const symptomIds = extractSymptomIds(normalized);

  // Step 4: Dosha scoring
  const doshaScores = scoreDoshas(symptomIds, userContext);

  // Step 5: TKRC therapeutic band mapping
  const therapeuticBands = mapToTherapeuticBands(symptomIds);

  // Step 6: Safety filter
  const safeRecs = applySafetyFilter(recommendationIndex, userContext);

    // Step 6B: Editorial Gate — flag pending human_review items
  const { approvedRecs, reviewWarnings } = applyEditorialGate(safeRecs);

  // Step 7: Rank
    const rankedRecs = rankRecommendations(approvedRecs, doshaScores, therapeuticBands);

  // Step 8: Confidence
  const confidence = calculateConfidence(symptomIds, rankedRecs);

  // Step 9: Explanation
  const explanation = buildExplanation({ symptomIds, doshaScores, therapeuticBands, confidence });

  // Step 10: Audit
  auditConsult({
    userInput: normalized,
    redFlags,
    symptomIds,
    doshaScores,
    therapeuticBands,
    recommendationIds: rankedRecs.slice(0, 3).map(r => r.id),
    confidence,
      reviewWarnings
  });

  // Step 11: Output
  return {
    mode: 'consult',
    doshaScores,
    therapeuticBands,
    recommendations: rankedRecs.slice(0, 3),
    confidence,
      reviewWarnings,
    explanation
  };
}

// ===========================================================
// EDITORIAL GATE (Phase 3C)
// ===========================================================
function applyEditorialGate(recommendations) {
  const approvedRecs = [];
  const reviewWarnings = [];

  recommendations.forEach(rec => {
    const status = rec.human_review_status || 'pending';
    const confidence = rec.confidence_level || 'low';

    if (status === 'pending') {
      // Flag but still surface with explicit warning
      reviewWarnings.push({
        rec_id: rec.id,
        label: rec.label || rec.recommendation_label || '',
        reason: 'human_review_pending',
        message: 'This suggestion has not yet been reviewed by an Ayurvedic practitioner. Use with discretion.'
      });
      approvedRecs.push({ ...rec, _review_warning: true });
    } else if (confidence === 'low') {
      // Surface but add a confidence note
      reviewWarnings.push({
        rec_id: rec.id,
        label: rec.label || rec.recommendation_label || '',
        reason: 'low_confidence',
        message: 'Confidence in this suggestion is low due to limited classical references. Consult a Vaidya for guidance.'
      });
      approvedRecs.push({ ...rec, _confidence_warning: true });
    } else {
      approvedRecs.push(rec);
    }
  });

  return { approvedRecs, reviewWarnings };
}

export default runTKDLConsult;
