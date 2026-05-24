/**
 * routes/dinacharya.js
 * AyurTime Phase 2 — Dinacharya (Daily Routine) Tracker API
 * POST /api/dinacharya/log    — log daily routine entry
 * GET  /api/dinacharya/today  — get today's routine summary
 * GET  /api/dinacharya/streak — get current streak
 * GET  /api/dinacharya/history— get recent history
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { optionalAuth } = require('../middleware/auth');

const DINACHARYA_PATH = path.join(__dirname, '../storage/dinacharya-log.json');

const DINACHARYA_ACTIVITIES = [
  { id: 'brahma_muhurta', label: 'Wake at Brahma Muhurta (4-6am)', category: 'sleep' },
  { id: 'abhyanga', label: 'Abhyanga (self oil massage)', category: 'body_care' },
  { id: 'pranayama', label: 'Pranayama / Breathing exercises', category: 'breathwork' },
  { id: 'meditation', label: 'Dhyana / Meditation', category: 'mind' },
  { id: 'yoga_asana', label: 'Yoga Asana practice', category: 'movement' },
  { id: 'warm_water', label: 'Drink warm water on waking', category: 'diet' },
  { id: 'sattvic_diet', label: 'Sattvic diet maintained', category: 'diet' },
  { id: 'no_late_eating', label: 'No eating after sunset', category: 'diet' },
  { id: 'early_sleep', label: 'Sleep before 10pm', category: 'sleep' },
  { id: 'digital_detox', label: 'No screens 1hr before bed', category: 'mind' }
];

function readLog() {
  if (!fs.existsSync(DINACHARYA_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DINACHARYA_PATH, 'utf8')); } catch { return []; }
}

function writeLog(entries) {
  fs.mkdirSync(path.dirname(DINACHARYA_PATH), { recursive: true });
  fs.writeFileSync(DINACHARYA_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

// POST /api/dinacharya/log
router.post('/log', optionalAuth, (req, res) => {
  try {
    const { completed_activities = [], notes = '', date = todayDate() } = req.body;
    const user_id = req.user ? req.user.id : 'anonymous';

    const log = readLog();
    const existing = log.findIndex(e => e.user_id === user_id && e.date === date);

    const entry = {
      id: existing >= 0 ? log[existing].id : `dina_${Date.now()}`,
      user_id,
      date,
      completed_activities,
      completion_pct: Math.round((completed_activities.length / DINACHARYA_ACTIVITIES.length) * 100),
      notes,
      logged_at: new Date().toISOString()
    };

    if (existing >= 0) {
      log[existing] = entry;
    } else {
      log.push(entry);
    }

    writeLog(log);
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log dinacharya entry.', detail: err.message });
  }
});

// GET /api/dinacharya/activities
router.get('/activities', (req, res) => {
  res.json({ activities: DINACHARYA_ACTIVITIES });
});

// GET /api/dinacharya/today
router.get('/today', optionalAuth, (req, res) => {
  const user_id = req.user ? req.user.id : 'anonymous';
  const log = readLog();
  const today = log.find(e => e.user_id === user_id && e.date === todayDate()) || null;
  res.json({ date: todayDate(), entry: today, all_activities: DINACHARYA_ACTIVITIES });
});

// GET /api/dinacharya/streak
router.get('/streak', optionalAuth, (req, res) => {
  const user_id = req.user ? req.user.id : 'anonymous';
  const log = readLog()
    .filter(e => e.user_id === user_id && e.completion_pct >= 50)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const entry of log) {
    const entryDate = new Date(entry.date);
    const diff = Math.round((current - entryDate) / 86400000);
    if (diff <= 1) {
      streak++;
      current = entryDate;
    } else {
      break;
    }
  }

  res.json({ streak, user_id });
});

// GET /api/dinacharya/history
router.get('/history', optionalAuth, (req, res) => {
  const user_id = req.user ? req.user.id : 'anonymous';
  const limit = parseInt(req.query.limit) || 30;
  const log = readLog()
    .filter(e => e.user_id === user_id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
  res.json({ entries: log, total: log.length });
});

module.exports = router;
