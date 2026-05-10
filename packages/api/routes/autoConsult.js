/**
 * autoConsult.js - Auto-Mode Classical Reasoning Router
 * AyurTime API - Phase 3
 *
 * POST /api/consult/auto
 * Body: { text, userId?, doshaProfile? }
 * Returns: { diagnosis, samprapti, chikitsa, references, confidence, disclaimer }
 */

const express = require('express');
const router = express.Router();
const { analyzeText } = require('../services/paniniEngine');
const { searchVerses, getChapter } = require('../services/charakaService');

// ── Dosha keyword maps ─────────────────────────────────────────────────────────
const DOSHA_KEYWORDS = {
  vata: ['dry', 'constipation', 'anxiety', 'gas', 'bloating', 'insomnia',
         'joint pain', 'cracking', 'tremor', 'cold', 'fear', 'restless',
         'vata', 'vayu', 'anila', 'ruksha', 'laghu', 'chara'],
  pitta: ['acidity', 'heartburn', 'burning', 'inflammation', 'fever', 'anger',
          'rash', 'diarrhea', 'heat', 'thirst', 'jaundice', 'bile',
          'pitta', 'agni', 'ushna', 'tikshna', 'sara'],
  kapha: ['weight gain', 'heaviness', 'congestion', 'lethargy', 'mucus',
          'swelling', 'cold', 'slow digestion', 'depression', 'excess sleep',
          'kapha', 'shleshma', 'guru', 'snigdha', 'manda', 'sthira']
};

// ── Samprapti (pathogenesis) templates ────────────────────────────────────────
const SAMPRAPTI = {
  vata: 'Vata dosha accumulates in the colon (pakwashaya), spreads via srotas (channels) and localises in affected site. Nidana (causative factors): excessive dryness, irregular food, travel, stress. Dushya (vitiated tissues): rasa, asthi dhatu.',
  pitta: 'Pitta dosha accumulates in the small intestine (grahani), overflows via rakta and rasa dhatus. Nidana: spicy/sour food, anger, sun exposure. Dushya: rakta, mamsa dhatu. Agni (digestive fire) becomes tikshna.',
  kapha: 'Kapha dosha accumulates in the stomach (amashaya), blocks srotas and suppresses agni. Nidana: heavy food, day sleep, cold environment. Dushya: rasa, meda dhatu. Agni becomes manda (low).'
};

// ── Chikitsa (treatment outline) templates ────────────────────────────────────
const CHIKITSA = {
  vata: 'Snehana (oleation with sesame oil / ghee), Swedana (sudation therapy), Basti (medicated enema - primary Vata treatment per Charaka Sutrasthana 20). Diet: warm, oily, sweet-sour-salty tastes. Herbs: Ashwagandha, Bala, Dashamoola.',
  pitta: 'Virechana (purgation therapy - primary Pitta treatment per Charaka Kalpa Sthana 1). Cooling foods: coriander, fennel, coconut water. Avoid: spicy, sour, fermented. Herbs: Shatavari, Amalaki, Guduchi.',
  kapha: 'Vamana (emesis therapy - primary Kapha treatment per Charaka Kalpa Sthana 1). Diet: light, dry, spicy-bitter-astringent tastes. Exercise encouraged. Herbs: Trikatu, Guggulu, Punarnava.'
};

// ── Charaka references per dosha ──────────────────────────────────────────────
const CHARAKA_REFS = {
  vata: [
    'Charaka Sutrasthana 17.117 - Properties of Vata dosha',
    'Charaka Sutrasthana 20.11 - Basti as supreme Vata treatment',
    'Charaka Nidanasthana 1.17 - Vata nidana (causative factors)',
    'Charaka Chikitsasthana 28 - Vatavyadhi chikitsa'
  ],
  pitta: [
    'Charaka Sutrasthana 18.50 - Properties of Pitta dosha',
    'Charaka Sutrasthana 16.34 - Virechana for Pitta',
    'Charaka Nidanasthana 1.20 - Pitta nidana',
    'Charaka Chikitsasthana 15 - Atisara (Pitta type) chikitsa'
  ],
  kapha: [
    'Charaka Sutrasthana 17.63 - Properties of Kapha dosha',
    'Charaka Sutrasthana 20.15 - Vamana as supreme Kapha treatment',
    'Charaka Nidanasthana 1.23 - Kapha nidana',
    'Charaka Chikitsasthana 6 - Kasa (Kapha type) chikitsa'
  ]
};

// ── Helper: score dosha from text ─────────────────────────────────────────────
function scoreDoshaFromText(text) {
  const lower = text.toLowerCase();
  const scores = { vata: 0, pitta: 0, kapha: 0 };

  for (const [dosha, keywords] of Object.entries(DOSHA_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[dosha]++;
    }
  }

  const total = scores.vata + scores.pitta + scores.kapha;
  if (total === 0) return { primary: null, scores, confidence: 0 };

  const primary = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const confidence = parseFloat((scores[primary] / total).toFixed(2));
  return { primary, scores, confidence };
}

// ── Helper: enrich with Panini lexical analysis ───────────────────────────────
function enrichWithPanini(paniniResult, doshaScores) {
  if (!paniniResult || !paniniResult.tokens) return doshaScores;

  for (const token of paniniResult.tokens) {
    const cat = token.category;
    if (cat === 'DOSHA') {
      const name = token.term ? token.term.toLowerCase() : '';
      if (doshaScores.scores[name] !== undefined) {
        doshaScores.scores[name] += 2; // Boost direct Sanskrit dosha mentions
      }
    }
  }

  // Recalculate primary after boost
  const total = doshaScores.scores.vata + doshaScores.scores.pitta + doshaScores.scores.kapha;
  if (total > 0) {
    doshaScores.primary = Object.entries(doshaScores.scores).sort((a, b) => b[1] - a[1])[0][0];
    doshaScores.confidence = parseFloat((doshaScores.scores[doshaScores.primary] / total).toFixed(2));
  }

  return doshaScores;
}

// ── POST /api/consult/auto ─────────────────────────────────────────────────────
router.post('/auto', async (req, res) => {
  try {
    const { text, userId, doshaProfile } = req.body;

    // 1) Validate input
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({
        error: 'text is required and must be at least 3 characters'
      });
    }

    const cleanText = text.trim();

    // 2) Panini lexical analysis
    let paniniResult = null;
    try {
      paniniResult = analyzeText(cleanText);
    } catch (paniniErr) {
      console.warn('[AutoConsult] Panini analysis failed, continuing:', paniniErr.message);
    }

    // 3) Dosha scoring from text keywords
    let doshaResult = scoreDoshaFromText(cleanText);

    // 4) Override/merge with explicitly provided doshaProfile
    if (doshaProfile && typeof doshaProfile === 'string') {
      const provided = doshaProfile.toLowerCase();
      if (['vata', 'pitta', 'kapha'].includes(provided)) {
        doshaResult.scores[provided] += 3; // Strong boost for known profile
        doshaResult.primary = provided;
      }
    }

    // 5) Enrich with Panini lexical results
    doshaResult = enrichWithPanini(paniniResult, doshaResult);

    const primary = doshaResult.primary;

    // 6) Handle no dosha detected
    if (!primary) {
      return res.json({
        diagnosis: 'Tridosha (balanced presentation) - insufficient data for primary dosha classification',
        samprapti: 'Further detailed Prakriti assessment recommended via the Dosha Quiz.',
        chikitsa: 'Follow a sattvic (balanced) diet. Maintain regular daily routine (Dinacharya). Practice pranayama.',
        references: [
          'Charaka Sutrasthana 1.55 - On the importance of Prakriti assessment',
          'Charaka Vimanasthana 8.95 - Tridosha harmony'
        ],
        confidence: 0,
        doshaScores: doshaResult.scores,
        paniniTokens: paniniResult ? paniniResult.tokens : [],
        disclaimer: 'Educational use only. AyurTime does not provide medical diagnoses. Please consult a qualified Ayurvedic physician (BAMS/MD Ayurveda).'
      });
    }

    // 7) Fetch Charaka verse search results for primary dosha
    let charakaVerseRefs = CHARAKA_REFS[primary];
    try {
      const searchResults = searchVerses(primary);
      if (searchResults && searchResults.length > 0) {
        // Add top 2 actual verse matches from the data
        const dynamicRefs = searchResults.slice(0, 2).map(v =>
          `${v.chapter || 'Charaka'} ${v.verse || ''} - ${v.summary || v.text || ''}`
        );
        charakaVerseRefs = [...dynamicRefs, ...CHARAKA_REFS[primary]];
      }
    } catch (charakaErr) {
      console.warn('[AutoConsult] Charaka verse search failed, using static refs:', charakaErr.message);
    }

    // 8) Build final response
    const response = {
      diagnosis: `${primary.charAt(0).toUpperCase() + primary.slice(1)} Dosha Imbalance (${primary.toUpperCase()} VRIDHI)`,
      samprapti: SAMPRAPTI[primary],
      chikitsa: CHIKITSA[primary],
      references: charakaVerseRefs.slice(0, 6),
      confidence: doshaResult.confidence,
      doshaScores: doshaResult.scores,
      paniniTokens: paniniResult ? paniniResult.tokens : [],
      userId: userId || null,
      disclaimer: 'Educational use only. AyurTime does not provide medical diagnoses. Please consult a qualified Ayurvedic physician (BAMS/MD Ayurveda).'
    };

    res.json(response);

  } catch (err) {
    console.error('[AutoConsult] Error:', err);
    res.status(500).json({
      error: 'Internal error in auto-mode consult',
      disclaimer: 'Educational use only. Please consult a qualified Ayurvedic physician.'
    });
  }
});

module.exports = router;
