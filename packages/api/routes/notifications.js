/**
 * AyurTime — Push Notification Scheduling Routes
 * Phase 2 | Issue #34
 *
 * POST /api/notifications/subscribe     — save Web Push subscription
 * POST /api/notifications/schedule       — create a reminder schedule
 * GET  /api/notifications/schedules      — list user's schedules
 * DELETE /api/notifications/schedule/:id — remove a schedule
 * POST /api/notifications/test           — send test push (dev only)
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push-subscriptions.json');
const SCHEDULES_FILE = path.join(DATA_DIR, 'notification-schedules.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Dinacharya routine types for scheduling ──────────────────────────────
const ROUTINE_TYPES = [
  { id: 'brahma_muhurta', label: 'Brahma Muhurta Wake-up', default_time: '05:00' },
  { id: 'abhyanga',       label: 'Abhyanga (Oil Massage)',  default_time: '06:30' },
  { id: 'yoga',           label: 'Yoga / Pranayama',        default_time: '06:00' },
  { id: 'meditation',     label: 'Meditation',              default_time: '07:00' },
  { id: 'breakfast',      label: 'Sattvic Breakfast',       default_time: '08:00' },
  { id: 'lunch',          label: 'Main Meal (Madhyahna)',   default_time: '12:30' },
  { id: 'evening_walk',   label: 'Evening Walk',            default_time: '17:30' },
  { id: 'dinner',         label: 'Light Dinner',            default_time: '19:00' },
  { id: 'sleep',          label: 'Sleep (before 10 PM)',    default_time: '21:30' },
];

// GET /api/notifications/routine-types
router.get('/routine-types', (req, res) => {
  res.json({ success: true, data: ROUTINE_TYPES });
});

// POST /api/notifications/subscribe
// Body: { userId, subscription: { endpoint, keys: { auth, p256dh } } }
router.post('/subscribe', (req, res) => {
  const { userId, subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, error: 'Valid push subscription object required' });
  }
  const subs = readJSON(SUBSCRIPTIONS_FILE);
  const existing = subs.findIndex(s => s.endpoint === subscription.endpoint);
  const record = {
    id: existing >= 0 ? subs[existing].id : uuidv4(),
    userId: userId || 'anonymous',
    endpoint: subscription.endpoint,
    keys: subscription.keys || {},
    subscribedAt: existing >= 0 ? subs[existing].subscribedAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    subs[existing] = record;
  } else {
    subs.push(record);
  }
  writeJSON(SUBSCRIPTIONS_FILE, subs);
  res.status(201).json({ success: true, id: record.id, message: 'Subscription saved' });
});

// POST /api/notifications/schedule
// Body: { userId, routineType, time (HH:MM), days (array of 0-6), label }
router.post('/schedule', (req, res) => {
  const { userId, routineType, time, days, label } = req.body;
  if (!routineType || !time) {
    return res.status(400).json({ success: false, error: 'routineType and time are required' });
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ success: false, error: 'time must be in HH:MM format' });
  }
  const schedules = readJSON(SCHEDULES_FILE);
  const schedule = {
    id: uuidv4(),
    userId: userId || 'anonymous',
    routineType,
    label: label || ROUTINE_TYPES.find(r => r.id === routineType)?.label || routineType,
    time,
    days: Array.isArray(days) ? days : [0, 1, 2, 3, 4, 5, 6], // default: every day
    active: true,
    createdAt: new Date().toISOString(),
  };
  schedules.push(schedule);
  writeJSON(SCHEDULES_FILE, schedules);
  res.status(201).json({ success: true, data: schedule });
});

// GET /api/notifications/schedules?userId=xxx
router.get('/schedules', (req, res) => {
  const { userId } = req.query;
  const schedules = readJSON(SCHEDULES_FILE);
  const filtered = userId
    ? schedules.filter(s => s.userId === userId)
    : schedules;
  res.json({ success: true, count: filtered.length, data: filtered });
});

// DELETE /api/notifications/schedule/:id
router.delete('/schedule/:id', (req, res) => {
  const { id } = req.params;
  const schedules = readJSON(SCHEDULES_FILE);
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Schedule not found' });
  }
  const [removed] = schedules.splice(idx, 1);
  writeJSON(SCHEDULES_FILE, schedules);
  res.json({ success: true, message: 'Schedule deleted', id: removed.id });
});

// PATCH /api/notifications/schedule/:id/toggle — enable/disable
router.patch('/schedule/:id/toggle', (req, res) => {
  const { id } = req.params;
  const schedules = readJSON(SCHEDULES_FILE);
  const schedule = schedules.find(s => s.id === id);
  if (!schedule) {
    return res.status(404).json({ success: false, error: 'Schedule not found' });
  }
  schedule.active = !schedule.active;
  writeJSON(SCHEDULES_FILE, schedules);
  res.json({ success: true, data: schedule });
});

module.exports = router;
