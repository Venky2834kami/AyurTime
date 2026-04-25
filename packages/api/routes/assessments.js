/**
 * Assessments Router — AyurTime API
 * POST /api/assessments            → submit questionnaire → score → return result
 * GET  /api/assessments/:id        → retrieve assessment + recommendation
 */

const express = require('express');
const router = express.Router();
const { createAssessment, validateAssessment } = require('../models/assessment');
const { createRecommendation } = require('../models/recommendation');
const { scoreDoshas } = require('../services/doshaScoring');

// In-memory store — Phase 2 replaces with DB layer
const assessments = new Map();
const recommendations = new Map();

/**
 * POST /api/assessments
 * Body: { userId?, answers: [{questionId, value}] }
 * Returns: assessment + recommendation
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  const errors = validateAssessment({ answers: body.answers });
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  try {
    const assessment = createAssessment({
      userId: body.userId || 'anonymous',
      answers: body.answers,
    });
    assessment.status = 'scored';

    // Score the dosha
    const { scoreBreakdown, dominantDosha, confidence } = scoreDoshas(assessment.answers);

    // Generate recommendation
    const recommendation = createRecommendation({
      assessmentId: assessment.assessmentId,
      userId: assessment.userId,
      dominantDosha,
      scoreBreakdown,
      confidence,
    });

    assessments.set(assessment.assessmentId, { ...assessment, recommendation });
    recommendations.set(recommendation.recommendationId, recommendation);

    return res.status(200).json({
      assessmentId: assessment.assessmentId,
      userId: assessment.userId,
      status: assessment.status,
      dominantDosha,
      scoreBreakdown,
      confidence,
      recommendation,
      createdAt: assessment.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/assessments/:assessmentId
 */
router.get('/:assessmentId', (req, res) => {
  const record = assessments.get(req.params.assessmentId);
  if (!record) return res.status(404).json({ error: 'Assessment not found' });
  return res.status(200).json(record);
});

// Export stores for testing
router._assessments = assessments;
router._recommendations = recommendations;
module.exports = router;
