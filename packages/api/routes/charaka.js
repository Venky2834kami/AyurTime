/**
 * Charaka Samhita Router - AyurTime API
 * GET /api/charaka/verse/:id - Get verse by ID
 * GET /api/charaka/search - Search verses
 * GET /api/charaka/chapters - List all chapters
 */

const express = require('express');
const router = express.Router();
const { getVerseById, getChapter, searchVerses, getAllChapters, loadCharakaData } = require('../services/charakaService');

// Load Charaka data on router init
loadCharakaData();

/**
 * GET /api/charaka/verse/:id
 */
router.get('/verse/:id', (req, res) => {
  const { id } = req.params;
  const verse = getVerseById(id);
  
  if (!verse) {
    return res.status(404).json({ error: 'Verse not found', id });
  }
  
  return res.status(200).json(verse);
});

/**
 * GET /api/charaka/search?lemma=vata&dosha=Vata&keyword=wind
 */
router.get('/search', (req, res) => {
  const results = searchVerses(req.query);
  return res.status(200).json({
    count: results.length,
    results
  });
});

/**
 * GET /api/charaka/chapters
 */
router.get('/chapters', (req, res) => {
  const chapters = getAllChapters();
  return res.status(200).json({
    count: chapters.length,
    chapters
  });
});

module.exports = router;
