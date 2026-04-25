/**
 * Recommendations Router — AyurTime API
 * GET /api/recommendations/:recommendationId → fetch a recommendation by ID
 * GET /api/recommendations/user/:userId       → list all recommendations for a user
 */

const express = require('express');
const router = express.Router();

// Shared store with assessments router — injected at app init
let _store = new Map();

router.setStore = (store) => { _store = store; };

/**
 * GET /api/recommendations/:recommendationId
 */
router.get('/:recommendationId', (req, res) => {
  const rec = _store.get(req.params.recommendationId);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
  return res.status(200).json(rec);
});

/**
 * GET /api/recommendations/user/:userId
 */
router.get('/user/:userId', (req, res) => {
  const results = [..._store.values()].filter(r => r.userId === req.params.userId);
  return res.status(200).json({ userId: req.params.userId, recommendations: results });
});

module.exports = router;
