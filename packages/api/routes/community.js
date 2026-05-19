/**
 * Community Routes - Issue #16
 * Discussion Boards + Practitioner Directory + Q&A
 * GET/POST /api/community/threads
 * GET/POST /api/community/threads/:id/replies
 * POST /api/community/threads/:id/upvote
 * POST /api/community/threads/:id/bookmark
 * GET /api/community/practitioners
 * GET /api/community/practitioners/:id
 * POST /api/community/practitioners/:id/ask
 */

const express = require('express');
const router = express.Router();
const { createThread, createReply, VALID_CATEGORIES } = require('../models/communityThread');
const { MOCK_PRACTITIONERS } = require('../models/practitioner');

// In-memory store (replace with DB in production)
const threads = [];
const practitioners = [...MOCK_PRACTITIONERS];

// ── Discussion Boards ─────────────────────────────────────────────────────────

/**
 * GET /api/community/threads
 * Query: ?category=doshas&tag=Vata&lang=en
 */
router.get('/threads', (req, res) => {
  const { category, tag } = req.query;
  let result = [...threads];
  if (category) {
    result = result.filter(t => t.category === category);
  }
  if (tag) {
    result = result.filter(t => t.tags.includes(tag));
  }
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, count: result.length, threads: result });
});

/**
 * POST /api/community/threads
 * Body: { user_id, title, body, category, tags?, image_url? }
 */
router.post('/threads', (req, res) => {
  try {
    const thread = createThread(req.body);
    threads.push(thread);
    res.status(201).json({ success: true, thread });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/community/threads/:id/replies
 * Body: { user_id, body, parent_reply_id?, depth? }
 */
router.post('/threads/:id/replies', (req, res) => {
  const thread = threads.find(t => t.thread_id === req.params.id);
  if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
  try {
    const reply = createReply({ ...req.body, thread_id: req.params.id });
    thread.replies.push(reply);
    thread.updated_at = new Date().toISOString();
    res.status(201).json({ success: true, reply });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/community/threads/:id/upvote
 */
router.post('/threads/:id/upvote', (req, res) => {
  const thread = threads.find(t => t.thread_id === req.params.id);
  if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
  thread.upvotes += 1;
  res.json({ success: true, upvotes: thread.upvotes });
});

/**
 * POST /api/community/threads/:id/bookmark
 */
router.post('/threads/:id/bookmark', (req, res) => {
  const thread = threads.find(t => t.thread_id === req.params.id);
  if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
  thread.bookmarks += 1;
  res.json({ success: true, bookmarks: thread.bookmarks });
});

// ── Practitioner Directory ─────────────────────────────────────────────────────

/**
 * GET /api/community/practitioners
 * Query: ?specialization=Panchakarma&city=Pune&dosha=Vata&verified=true
 */
router.get('/practitioners', (req, res) => {
  const { specialization, city, dosha, verified } = req.query;
  let result = [...practitioners];
  if (specialization) {
    result = result.filter(p => p.specialization.includes(specialization));
  }
  if (city) {
    result = result.filter(p => p.location.city.toLowerCase() === city.toLowerCase());
  }
  if (dosha) {
    result = result.filter(p => p.dosha_expertise.includes(dosha));
  }
  if (verified !== undefined) {
    result = result.filter(p => p.verified === (verified === 'true'));
  }
  res.json({ success: true, count: result.length, practitioners: result });
});

/**
 * GET /api/community/practitioners/:id
 */
router.get('/practitioners/:id', (req, res) => {
  const practitioner = practitioners.find(p => p.practitioner_id === req.params.id);
  if (!practitioner) return res.status(404).json({ success: false, error: 'Practitioner not found' });
  res.json({ success: true, practitioner });
});

/**
 * POST /api/community/practitioners/:id/ask
 * Body: { user_id, question }
 * Initiates a message thread to the practitioner
 */
router.post('/practitioners/:id/ask', (req, res) => {
  const practitioner = practitioners.find(p => p.practitioner_id === req.params.id);
  if (!practitioner) return res.status(404).json({ success: false, error: 'Practitioner not found' });
  const { user_id, question } = req.body;
  if (!user_id || !question) {
    return res.status(400).json({ success: false, error: 'user_id and question are required' });
  }
  // In production: create message thread in DB and notify practitioner
  res.status(201).json({
    success: true,
    message: `Your question has been sent to ${practitioner.name}.`,
    thread_ref: `msg-${Date.now()}`,
    practitioner_email: practitioner.contact_email
  });
});

/**
 * Admin: PATCH /api/community/practitioners/:id/verify
 * Body: { verified: true|false }
 */
router.patch('/practitioners/:id/verify', (req, res) => {
  const practitioner = practitioners.find(p => p.practitioner_id === req.params.id);
  if (!practitioner) return res.status(404).json({ success: false, error: 'Practitioner not found' });
  practitioner.verified = !!req.body.verified;
  res.json({ success: true, practitioner_id: practitioner.practitioner_id, verified: practitioner.verified });
});

module.exports = router;
