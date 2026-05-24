/**
 * AyurTime — Prakriti AI Analyzer Route
 * Phase 3A | Issue #35
 *
 * POST /api/prakriti-ai/analyze-image — analyze facial/body image → dosha scores
 */

const express = require('express');
const router = express.Router();

// ─── Heuristic Dosha Analysis Engine (Phase 3A stub) ────────────────────────
// Full ML model (MobileNetV2 + TensorFlow.js) in Phase 3B
// For now, use randomized mock analysis with slight biases based on image metadata

/**
 * Extract mock feature scores from base64 image (stub)
 * In Phase 3B, this will be replaced with actual CNN inference
 */
function extractImageFeatures(base64Image) {
  // Stub: compute hash-based seed for consistent demo results
  const hash = base64Image.slice(0, 20).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = hash % 100;
  
  // Mock feature extraction
  return {
    skinTone: (seed % 3) / 3,        // 0-1 scale (lighter → Vata, medium → Pitta, darker → Kapha)
    faceStructure: ((seed + 17) % 3) / 3,  // angular → Vata, sharp → Pitta, round → Kapha
    eyeCharacteristics: ((seed + 37) % 3) / 3,
    bodyFrame: ((seed + 53) % 3) / 3,
  };
}

/**
 * Compute dosha scores from features using Ayurvedic heuristics
 */
function computeDoshaScores(features) {
  const { skinTone, faceStructure, eyeCharacteristics, bodyFrame } = features;
  
  // Heuristic mapping:
  // Vata: light skin, angular face, small eyes, thin frame
  // Pitta: medium skin, sharp face, intense eyes, athletic frame
  // Kapha: darker skin, round face, large eyes, heavy frame
  
  const vata = (
    (1 - skinTone) * 0.3 +
    (faceStructure < 0.4 ? 1 : 0) * 0.3 +
    (eyeCharacteristics < 0.4 ? 1 : 0) * 0.2 +
    (bodyFrame < 0.4 ? 1 : 0) * 0.2
  );
  
  const pitta = (
    (skinTone > 0.3 && skinTone < 0.7 ? 1 : 0) * 0.3 +
    (faceStructure > 0.3 && faceStructure < 0.7 ? 1 : 0) * 0.3 +
    (eyeCharacteristics > 0.4 ? 1 : 0) * 0.2 +
    (bodyFrame > 0.3 && bodyFrame < 0.7 ? 1 : 0) * 0.2
  );
  
  const kapha = (
    skinTone * 0.3 +
    (faceStructure > 0.6 ? 1 : 0) * 0.3 +
    (eyeCharacteristics > 0.6 ? 1 : 0) * 0.2 +
    (bodyFrame > 0.6 ? 1 : 0) * 0.2
  );
  
  // Normalize to sum = 1
  const total = vata + pitta + kapha;
  return {
    vata: vata / total,
    pitta: pitta / total,
    kapha: kapha / total,
  };
}

/**
 * Get dominant dosha and confidence
 */
function analyzeDominance(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [dominant, dominantScore] = entries[0];
  const [secondary, secondaryScore] = entries[1];
  
  // Confidence based on margin between dominant and secondary
  const margin = dominantScore - secondaryScore;
  const confidence = Math.min(0.95, 0.5 + margin * 2);
  
  return { dominant, confidence };
}

/**
 * Generate personalised recommendations per dosha
 */
function getRecommendations(dominant) {
  const recommendations = {
    vata: [
      { category: 'Diet', text: 'Favor warm, cooked, grounding foods. Avoid cold, raw, dry foods.' },
      { category: 'Lifestyle', text: 'Maintain regular routines. Practice calming yoga and meditation.' },
      { category: 'Herbs', text: 'Ashwagandha, Shatavari, Brahmi for nervous system support.' },
    ],
    pitta: [
      { category: 'Diet', text: 'Favor cooling, sweet, bitter foods. Reduce spicy, sour, salty tastes.' },
      { category: 'Lifestyle', text: 'Avoid overheating. Practice cooling pranayama (Sheetali, Sheetkari).' },
      { category: 'Herbs', text: 'Amalaki, Guduchi, Neem for cooling and detoxification.' },
    ],
    kapha: [
      { category: 'Diet', text: 'Favor light, warm, pungent foods. Reduce heavy, oily, sweet foods.' },
      { category: 'Lifestyle', text: 'Regular vigorous exercise. Wake early (before 6 AM).' },
      { category: 'Herbs', text: 'Trikatu, Guggulu, Punarnava for metabolism and weight management.' },
    ],
  };
  return recommendations[dominant] || [];
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/prakriti-ai/analyze-image
router.post('/analyze-image', (req, res) => {
  try {
    const { image } = req.body;
    
    // Validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'image (base64 string) is required',
      });
    }
    
    // Check base64 format
    const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    if (!base64Regex.test(image)) {
      return res.status(400).json({
        success: false,
        error: 'image must be base64-encoded JPEG/PNG/WebP with data URI prefix',
      });
    }
    
    // Size check (max 5MB)
    const base64Data = image.split(',')[1];
    const sizeBytes = (base64Data.length * 3) / 4;
    const sizeMB = sizeBytes / (1024 * 1024);
    if (sizeMB > 5) {
      return res.status(400).json({
        success: false,
        error: `Image too large (${sizeMB.toFixed(2)} MB). Max 5 MB.`,
      });
    }
    
    // Extract features and compute dosha scores
    const features = extractImageFeatures(base64Data);
    const scores = computeDoshaScores(features);
    const { dominant, confidence } = analyzeDominance(scores);
    const recommendations = getRecommendations(dominant);
    
    res.json({
      success: true,
      data: {
        scores: {
          vata: parseFloat(scores.vata.toFixed(3)),
          pitta: parseFloat(scores.pitta.toFixed(3)),
          kapha: parseFloat(scores.kapha.toFixed(3)),
        },
        dominant,
        confidence: parseFloat(confidence.toFixed(2)),
        recommendations,
        model_version: 'heuristic-v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[prakriti-ai] analyze-image error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
