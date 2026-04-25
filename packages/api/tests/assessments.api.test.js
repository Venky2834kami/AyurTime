/**
 * API Integration Tests — Assessments Endpoint
 * Tests the full POST /api/assessments workflow:
 *   submit answers → score doshas → return recommendation
 */

const request = require('supertest');
const express = require('express');
const assessmentsRouter = require('../routes/assessments');

// Build a minimal test app
const app = express();
app.use(express.json());
app.use('/api/assessments', assessmentsRouter);

const ALL_VATA = [
  { questionId: 'body_frame',      value: 'slim' },
  { questionId: 'skin_type',       value: 'dry' },
  { questionId: 'appetite',        value: 'irregular' },
  { questionId: 'energy_level',    value: 'variable' },
  { questionId: 'sleep_pattern',   value: 'light' },
  { questionId: 'mind_nature',     value: 'creative' },
  { questionId: 'weight_tendency', value: 'lose_easily' },
  { questionId: 'stress_response', value: 'anxious' },
];

const ALL_KAPHA = [
  { questionId: 'body_frame',      value: 'large' },
  { questionId: 'skin_type',       value: 'oily' },
  { questionId: 'appetite',        value: 'slow' },
  { questionId: 'energy_level',    value: 'steady' },
  { questionId: 'sleep_pattern',   value: 'deep' },
  { questionId: 'mind_nature',     value: 'calm' },
  { questionId: 'weight_tendency', value: 'gain_easily' },
  { questionId: 'stress_response', value: 'withdrawn' },
];

// ─── Happy Path ───────────────────────────────────────────────────────────────

describe('POST /api/assessments — happy path', () => {
  it('API TEST 1: returns 200 with valid dosha analysis for all-vata answers', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .send({ userId: 'user-vata-001', answers: ALL_VATA });

    expect(res.status).toBe(200);
    expect(res.body.assessmentId).toBeDefined();
    expect(res.body.dominantDosha).toBe('vata');
    expect(res.body.scoreBreakdown.vata).toBeGreaterThan(0.9);
    expect(res.body.confidence).toBeGreaterThan(0.9);
    expect(res.body.recommendation).toBeDefined();
    expect(res.body.recommendation.diet).toBeInstanceOf(Array);
    expect(res.body.recommendation.lifestyle).toBeInstanceOf(Array);
    expect(res.body.recommendation.herbs).toBeInstanceOf(Array);
    expect(res.body.status).toBe('scored');
  });

  it('API TEST 2: returns kapha recommendation for all-kapha answers', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .send({ userId: 'user-kapha-001', answers: ALL_KAPHA });

    expect(res.status).toBe(200);
    expect(res.body.dominantDosha).toBe('kapha');
    expect(res.body.recommendation.herbs).toContain('Trikatu');
  });

  it('API TEST 3: scoreBreakdown sums to approximately 1.0', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .send({ answers: ALL_VATA });

    const { vata, pitta, kapha } = res.body.scoreBreakdown;
    expect(vata + pitta + kapha).toBeCloseTo(1.0, 1);
  });

  it('API TEST 4: assessment can be retrieved by ID', async () => {
    const createRes = await request(app)
      .post('/api/assessments')
      .send({ userId: 'retrieval-test', answers: ALL_VATA });

    const { assessmentId } = createRes.body;
    const getRes = await request(app).get(`/api/assessments/${assessmentId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.assessmentId).toBe(assessmentId);
  });
});

// ─── Validation Errors ────────────────────────────────────────────────────────

describe('POST /api/assessments — validation', () => {
  it('rejects empty body with 400', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects non-array answers with 400', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .send({ answers: 'not-an-array' });
    expect(res.status).toBe(400);
  });

  it('rejects answers missing questionId with 400', async () => {
    const res = await request(app)
      .post('/api/assessments')
      .send({ answers: [{ value: 'slim' }] });
    expect(res.status).toBe(400);
    expect(res.body.details.some(d => d.includes('questionId'))).toBe(true);
  });
});

// ─── 404 for unknown assessment ───────────────────────────────────────────────

describe('GET /api/assessments/:id — 404', () => {
  it('returns 404 for non-existent assessment', async () => {
    const res = await request(app).get('/api/assessments/non-existent-id');
    expect(res.status).toBe(404);
  });
});
