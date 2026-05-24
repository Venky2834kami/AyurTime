/**
 * audit.js
 * AyurTime Phase 4 — TKDL Consultation Audit Log API
 * Routes: POST /api/audit/log, GET /api/audit/logs, GET /api/audit/stats
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const AUDIT_LOG_PATH = path.join(__dirname, '../storage/audit-log.json');

// -------------------------------------------------------
// Helper: read audit log from disk
// -------------------------------------------------------
function readAuditLog() {
  if (!fs.existsSync(AUDIT_LOG_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// -------------------------------------------------------
// Helper: write audit log to disk
// -------------------------------------------------------
function writeAuditLog(entries) {
  fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

// -------------------------------------------------------
// POST /api/audit/log
// Log a TKDL consultation event
// -------------------------------------------------------
router.post('/log', (req, res) => {
  try {
    const {
      user_id = 'anonymous',
      input_symptoms = [],
      dominant_dosha = null,
      recommendation_ids = [],
      confidence = null,
      review_warnings = [],
      dosha_scores = {}
    } = req.body;

    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      event_type: 'consult_run',
      prior_art_reference_type: 'tkdl_internal_logic',
      user_id,
      input_symptoms,
      dominant_dosha,
      dosha_scores,
      recommendation_ids,
      confidence,
      review_warnings_count: review_warnings.length,
      has_pending_reviews: review_warnings.some(w => w.reason === 'human_review_pending')
    };

    const log = readAuditLog();
    log.push(entry);
    writeAuditLog(log);

    res.status(201).json({ success: true, audit_id: entry.id });
  } catch (err) {
    console.error('[AuditLog] POST /log error:', err.message);
    res.status(500).json({ error: 'Failed to write audit log.' });
  }
});

// -------------------------------------------------------
// GET /api/audit/logs
// Returns paginated audit log entries
// -------------------------------------------------------
router.get('/logs', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const log = readAuditLog();
    const total = log.length;
    const start = (page - 1) * limit;
    const entries = log.slice(start, start + limit).reverse();

    res.json({
      total,
      page,
      limit,
      entries
    });
  } catch (err) {
    console.error('[AuditLog] GET /logs error:', err.message);
    res.status(500).json({ error: 'Failed to read audit log.' });
  }
});

// -------------------------------------------------------
// GET /api/audit/stats
// Returns aggregate statistics
// -------------------------------------------------------
router.get('/stats', (req, res) => {
  try {
    const log = readAuditLog();
    const total = log.length;

    if (total === 0) {
      return res.json({ total: 0, reviewed_pct: 0, avg_warnings_per_consult: 0, confidence_breakdown: {} });
    }

    const withPendingReview = log.filter(e => e.has_pending_reviews).length;
    const totalWarnings = log.reduce((sum, e) => sum + (e.review_warnings_count || 0), 0);

    const confidenceBreakdown = log.reduce((acc, e) => {
      const c = e.confidence || 'unknown';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total,
      with_pending_review_count: withPendingReview,
      reviewed_pct: Math.round(((total - withPendingReview) / total) * 100),
      avg_warnings_per_consult: parseFloat((totalWarnings / total).toFixed(2)),
      confidence_breakdown: confidenceBreakdown
    });
  } catch (err) {
    console.error('[AuditLog] GET /stats error:', err.message);
    res.status(500).json({ error: 'Failed to compute stats.' });
  }
});

module.exports = router;
