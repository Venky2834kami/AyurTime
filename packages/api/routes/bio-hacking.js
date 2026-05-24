/**
 * AyurTime — Vedic Bio-Hacking Analytics Routes
 * Phase 3B | Issue #36
 *
 * POST /api/bio-hacking/log-metric      — log health metrics (weight, energy, sleep, digestion)
 * GET  /api/bio-hacking/metrics         — retrieve user's metrics with date range filtering
 * GET  /api/bio-hacking/trends          — compute 7/30/90-day trends & correlations
 * GET  /api/bio-hacking/metric-types    — list available metric types
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const METRICS_FILE = path.join(DATA_DIR, 'bio-hacking-metrics.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readMetrics() {
  try {
    return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
  } catch { return []; }
}

function writeMetrics(data) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Metric Types Configuration ──────────────────────────────────────────
const METRIC_TYPES = [
  { id: 'weight', label: 'Weight', unit: 'kg', min: 30, max: 200, category: 'physical' },
  { id: 'energy', label: 'Energy Level', unit: 'scale_1-10', min: 1, max: 10, category: 'subjective' },
  { id: 'sleep_quality', label: 'Sleep Quality', unit: 'scale_1-10', min: 1, max: 10, category: 'subjective' },
  { id: 'sleep_hours', label: 'Sleep Duration', unit: 'hours', min: 0, max: 24, category: 'physical' },
  { id: 'digestion', label: 'Digestion Quality', unit: 'scale_1-10', min: 1, max: 10, category: 'subjective' },
  { id: 'stress', label: 'Stress Level', unit: 'scale_1-10', min: 1, max: 10, category: 'subjective' },
  { id: 'mood', label: 'Mood', unit: 'scale_1-10', min: 1, max: 10, category: 'subjective' },
  { id: 'exercise_minutes', label: 'Exercise Duration', unit: 'minutes', min: 0, max: 300, category: 'physical' },
  { id: 'water_intake', label: 'Water Intake', unit: 'liters', min: 0, max: 10, category: 'physical' },
  { id: 'meditation_minutes', label: 'Meditation Duration', unit: 'minutes', min: 0, max: 120, category: 'practice' },
];

// GET /api/bio-hacking/metric-types
router.get('/metric-types', (req, res) => {
  res.json({ success: true, count: METRIC_TYPES.length, data: METRIC_TYPES });
});

// POST /api/bio-hacking/log-metric
router.post('/log-metric', (req, res) => {
  const { userId, date, metric_type, value, notes, dosha_snapshot } = req.body;

  // Validation
  if (!userId || !date || !metric_type || value === undefined) {
    return res.status(400).json({
      success: false,
      error: 'userId, date, metric_type, and value are required',
    });
  }

  // Validate metric_type
  const metricConfig = METRIC_TYPES.find(m => m.id === metric_type);
  if (!metricConfig) {
    return res.status(400).json({
      success: false,
      error: `Invalid metric_type. Valid types: ${METRIC_TYPES.map(m => m.id).join(', ')}`,
    });
  }

  // Validate value range
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < metricConfig.min || numValue > metricConfig.max) {
    return res.status(400).json({
      success: false,
      error: `value must be between ${metricConfig.min} and ${metricConfig.max} ${metricConfig.unit}`,
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      error: 'date must be in YYYY-MM-DD format',
    });
  }

  const metrics = readMetrics();
  const entry = {
    id: uuidv4(),
    userId,
    date,
    metric_type,
    value: numValue,
    unit: metricConfig.unit,
    notes: notes || '',
    dosha_snapshot: dosha_snapshot || null,
    timestamp: new Date().toISOString(),
  };

  metrics.push(entry);
  writeMetrics(metrics);

  res.status(201).json({ success: true, data: entry });
});

// GET /api/bio-hacking/metrics?userId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD&metric_type=weight
router.get('/metrics', (req, res) => {
  const { userId, from, to, metric_type } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }

  let metrics = readMetrics().filter(m => m.userId === userId);

  // Filter by date range
  if (from) metrics = metrics.filter(m => m.date >= from);
  if (to) metrics = metrics.filter(m => m.date <= to);

  // Filter by metric type
  if (metric_type) metrics = metrics.filter(m => m.metric_type === metric_type);

  // Sort by date descending
  metrics.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, count: metrics.length, data: metrics });
});

// GET /api/bio-hacking/trends?userId=xxx&metric=weight&period=30
router.get('/trends', (req, res) => {
  const { userId, metric, period = '30' } = req.query;

  if (!userId || !metric) {
    return res.status(400).json({ success: false, error: 'userId and metric are required' });
  }

  const days = parseInt(period);
  if (isNaN(days) || days < 1 || days > 365) {
    return res.status(400).json({ success: false, error: 'period must be between 1 and 365 days' });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const metrics = readMetrics()
    .filter(m => m.userId === userId && m.metric_type === metric && m.date >= cutoffStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (metrics.length === 0) {
    return res.json({
      success: true,
      data: {
        metric,
        period: days,
        count: 0,
        average: null,
        min: null,
        max: null,
        trend: 'insufficient_data',
        data_points: [],
      },
    });
  }

  // Compute statistics
  const values = metrics.map(m => m.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Simple trend detection: compare first half vs second half
  const midpoint = Math.floor(metrics.length / 2);
  const firstHalfAvg = metrics.slice(0, midpoint).reduce((sum, m) => sum + m.value, 0) / midpoint;
  const secondHalfAvg = metrics.slice(midpoint).reduce((sum, m) => sum + m.value, 0) / (metrics.length - midpoint);
  const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  let trend = 'stable';
  if (percentChange > 5) trend = 'increasing';
  else if (percentChange < -5) trend = 'decreasing';

  // Dosha correlations (if dosha_snapshot data exists)
  const doshaCorrelations = computeDoshaCorrelations(metrics);

  res.json({
    success: true,
    data: {
      metric,
      period: days,
      count: metrics.length,
      average: parseFloat(average.toFixed(2)),
      min,
      max,
      trend,
      percent_change: parseFloat(percentChange.toFixed(1)),
      dosha_correlations: doshaCorrelations,
      data_points: metrics.map(m => ({ date: m.date, value: m.value, dosha_snapshot: m.dosha_snapshot })),
    },
  });
});

/**
 * Compute correlations between metric values and dosha levels
 */
function computeDoshaCorrelations(metrics) {
  const withDosha = metrics.filter(m => m.dosha_snapshot && m.dosha_snapshot.vata !== undefined);

  if (withDosha.length < 5) {
    return { note: 'Insufficient dosha data for correlation analysis' };
  }

  // Simple correlation: split into high/low metric groups and compare avg dosha
  const sortedByValue = [...withDosha].sort((a, b) => b.value - a.value);
  const topHalf = sortedByValue.slice(0, Math.floor(sortedByValue.length / 2));
  const bottomHalf = sortedByValue.slice(Math.floor(sortedByValue.length / 2));

  const avgDoshaTop = {
    vata: topHalf.reduce((s, m) => s + m.dosha_snapshot.vata, 0) / topHalf.length,
    pitta: topHalf.reduce((s, m) => s + m.dosha_snapshot.pitta, 0) / topHalf.length,
    kapha: topHalf.reduce((s, m) => s + m.dosha_snapshot.kapha, 0) / topHalf.length,
  };

  const avgDoshaBottom = {
    vata: bottomHalf.reduce((s, m) => s + m.dosha_snapshot.vata, 0) / bottomHalf.length,
    pitta: bottomHalf.reduce((s, m) => s + m.dosha_snapshot.pitta, 0) / bottomHalf.length,
    kapha: bottomHalf.reduce((s, m) => s + m.dosha_snapshot.kapha, 0) / bottomHalf.length,
  };

  const correlations = {
    vata: parseFloat((avgDoshaTop.vata - avgDoshaBottom.vata).toFixed(3)),
    pitta: parseFloat((avgDoshaTop.pitta - avgDoshaBottom.pitta).toFixed(3)),
    kapha: parseFloat((avgDoshaTop.kapha - avgDoshaBottom.kapha).toFixed(3)),
  };

  // Determine strongest correlation
  const strongest = Object.entries(correlations)
    .map(([dosha, val]) => ({ dosha, correlation: Math.abs(val), direction: val > 0 ? 'positive' : 'negative' }))
    .sort((a, b) => b.correlation - a.correlation)[0];

  return {
    correlations,
    insight: strongest.correlation > 0.1
      ? `High ${metrics[0].metric_type} values correlate with ${strongest.direction === 'positive' ? 'higher' : 'lower'} ${strongest.dosha} levels`
      : 'No strong dosha correlations detected',
  };
}

module.exports = router;
