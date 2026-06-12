/**
 * genomic.js — Ayur-Genomic Integration Routes
 * Maps user DNA/SNP markers to Ayurvedic Prakriti (dosha) profiles.
 *
 * Phase: v2.0 — Genomic-Prakriti Correlation Engine
 * Author: Venky2834kami
 */

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const genomicService = require('../services/genomicService');

/**
 * POST /api/genomic/analyze
 * Accepts SNP marker data and returns Prakriti correlation scores.
 * Body: { snpMarkers: [ { rsid: 'rs1234567', genotype: 'AG' }, ... ] }
 */
router.post('/analyze', optionalAuth, async (req, res) => {
  try {
    const { snpMarkers } = req.body;
    if (!snpMarkers || !Array.isArray(snpMarkers) || snpMarkers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'snpMarkers array is required and must not be empty.'
      });
    }
    const result = await genomicService.analyzePrakritiFromGenomics(snpMarkers);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[genomic/analyze] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * GET /api/genomic/snp-map
 * Returns the current SNP-to-Dosha reference mapping used by the engine.
 */
router.get('/snp-map', async (req, res) => {
  try {
    const snpMap = genomicService.getSNPDoshaMap();
    return res.status(200).json({ success: true, data: snpMap });
  } catch (err) {
    console.error('[genomic/snp-map] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * POST /api/genomic/combined-profile
 * Combines quiz-based Prakriti score with genomic data for a holistic profile.
 * Body: { quizDoshaScores: { vata: 40, pitta: 35, kapha: 25 }, snpMarkers: [...] }
 */
router.post('/combined-profile', optionalAuth, async (req, res) => {
  try {
    const { quizDoshaScores, snpMarkers } = req.body;
    if (!quizDoshaScores || !snpMarkers) {
      return res.status(400).json({
        success: false,
        error: 'Both quizDoshaScores and snpMarkers are required.'
      });
    }
    const combined = await genomicService.buildCombinedProfile(quizDoshaScores, snpMarkers);
    return res.status(200).json({ success: true, data: combined });
  } catch (err) {
    console.error('[genomic/combined-profile] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
