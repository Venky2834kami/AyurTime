/**
 * Sanskrit / Panini Engine Router - AyurTime API
 * POST /api/sanskrit/analyze - Analyze Sanskrit text
 */

const express = require('express');
const router = express.Router();
const { analyzeText, analyzeToken } = require('../services/paniniEngine');

/**
 * POST /api/sanskrit/analyze
 * Body: { text: string }
 * Returns: { tokens: [], statistics: {}, explanation: string }
 */
router.post('/analyze', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Missing required field: text' });
  }
  
  const result = analyzeText(text);
  
  if (result.error) {
    return res.status(400).json(result);
  }
  
  return res.status(200).json(result);
});

/**
 * POST /api/sanskrit/analyze-token
 * Body: { token: string }
 * Returns: single token analysis
 */
router.post('/analyze-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Missing required field: token' });
  }
  
  const result = analyzeToken(token);
  return res.status(200).json(result);
});

module.exports = router;
