/**
 * Panchakarma Routes - Issue #17
 * POST /api/panchakarma/programs         - Start a new program
 * GET  /api/panchakarma/programs/:id     - Get program details
 * POST /api/panchakarma/programs/:id/log - Log daily progress
 * GET  /api/panchakarma/recommend        - Recommend procedure by Prakriti
 * GET  /api/panchakarma/diet-guide/:proc - Get Pathya-Apathya chart
 * GET  /api/panchakarma/programs/:id/export - Export program log summary
 *
 * DISCLAIMER: For lifestyle/educational guidance only.
 */

const express = require('express');
const router = express.Router();
const {
  createProgram,
  calculateCompletion,
  recommendProcedure,
  PROTOCOL_TEMPLATES
} = require('../models/panchakarmaProgram');

// In-memory store (replace with DB in production)
const programs = {};

/**
 * POST /api/panchakarma/programs
 * Body: { user_id, procedure, duration_days, start_date?, prakriti? }
 */
router.post('/programs', (req, res) => {
  try {
    const program = createProgram(req.body);
    programs[program.program_id] = program;
    res.status(201).json({
      success: true,
      program_id: program.program_id,
      procedure: program.procedure,
      duration_days: program.duration_days,
      start_date: program.start_date,
      total_days: program.daily_logs.length,
      pathya: program.pathya,
      apathya: program.apathya,
      disclaimer: 'For educational/lifestyle guidance only. Consult a qualified Vaidya before beginning any Panchakarma program.'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/panchakarma/programs/:id
 */
router.get('/programs/:id', (req, res) => {
  const program = programs[req.params.id];
  if (!program) return res.status(404).json({ success: false, error: 'Program not found' });
  const completion_pct = calculateCompletion(program);
  res.json({ success: true, program: { ...program, completion_pct } });
});

/**
 * POST /api/panchakarma/programs/:id/log
 * Log daily progress
 * Body: { day, tasks_completed, medications, symptoms, diet_compliance }
 */
router.post('/programs/:id/log', (req, res) => {
  const program = programs[req.params.id];
  if (!program) return res.status(404).json({ success: false, error: 'Program not found' });
  const { day, tasks_completed, medications, symptoms, diet_compliance } = req.body;
  const log = program.daily_logs.find(l => l.day === day);
  if (!log) return res.status(400).json({ success: false, error: `Day ${day} not found in program` });

  if (tasks_completed) log.tasks_completed = tasks_completed;
  if (medications) log.medications = medications;
  if (symptoms !== undefined) log.symptoms = symptoms;
  if (diet_compliance !== undefined) log.diet_compliance = diet_compliance;
  log.logged_at = new Date().toISOString();

  const totalTasks = Object.values(log.tasks).reduce((sum, arr) => sum + arr.length, 0);
  log.completion_pct = totalTasks > 0 ? Math.round((tasks_completed.length / totalTasks) * 100) : 0;

  program.completion_pct = calculateCompletion(program);

  res.json({
    success: true,
    day,
    day_completion_pct: log.completion_pct,
    program_completion_pct: program.completion_pct
  });
});

/**
 * GET /api/panchakarma/recommend?prakriti=Vata
 */
router.get('/recommend', (req, res) => {
  const { prakriti } = req.query;
  if (!prakriti) return res.status(400).json({ success: false, error: 'prakriti query param required' });
  const procedures = recommendProcedure(prakriti);
  res.json({
    success: true,
    prakriti,
    recommended_procedures: procedures,
    disclaimer: 'Recommendation is based on classical Ayurvedic principles. Consult a Vaidya for personalised guidance.'
  });
});

/**
 * GET /api/panchakarma/diet-guide/:procedure
 * Returns Pathya-Apathya chart for the given procedure
 */
router.get('/diet-guide/:procedure', (req, res) => {
  const template = PROTOCOL_TEMPLATES[req.params.procedure];
  if (!template) return res.status(404).json({ success: false, error: 'Procedure not found' });
  res.json({
    success: true,
    procedure: req.params.procedure,
    pathya: template.pathya,
    apathya: template.apathya,
    daily_protocol: template.daily_tasks
  });
});

/**
 * GET /api/panchakarma/programs/:id/export
 * Export program log as summary (PDF generation in frontend)
 */
router.get('/programs/:id/export', (req, res) => {
  const program = programs[req.params.id];
  if (!program) return res.status(404).json({ success: false, error: 'Program not found' });
  const completion_pct = calculateCompletion(program);
  const summary = {
    program_id: program.program_id,
    user_id: program.user_id,
    procedure: program.procedure,
    prakriti: program.prakriti,
    duration_days: program.duration_days,
    start_date: program.start_date,
    export_date: new Date().toISOString(),
    completion_pct,
    days_logged: program.daily_logs.filter(d => d.tasks_completed.length > 0).length,
    symptom_log: program.daily_logs.map(d => ({ day: d.day, phase: d.phase, symptoms: d.symptoms, diet_compliance: d.diet_compliance })),
    disclaimer: 'This is an educational program log. Consult a qualified Vaidya for medical advice.'
  };
  res.json({ success: true, export: summary });
});

module.exports = router;
