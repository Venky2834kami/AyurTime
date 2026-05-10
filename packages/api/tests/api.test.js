/**
 * AyurTime API - Core Tests (Issue #19)
 * Tests: health check, prakriti analysis endpoint, input validation, error handling
 */

const request = require('supertest');
const app = require('../server');

const VALID_QUESTIONNAIRE = {
  userId: 'test-user-001',
  answers: [
    { questionId: 'body_frame',      value: 'slim' },
    { questionId: 'skin_type',       value: 'dry' },
    { questionId: 'appetite',        value: 'irregular' },
    { questionId: 'energy_level',    value: 'variable' },
    { questionId: 'sleep_pattern',   value: 'light' },
    { questionId: 'mind_nature',     value: 'creative' },
    { questionId: 'weight_tendency', value: 'lose_easily' },
    { questionId: 'stress_response', value: 'anxious' },
  ],
};

describe('GET /health', () => {
  it('returns 200 with status ok and ISO8601 timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.body.service).toBe('AyurTime API');
  });
});

describe('POST /api/prakriti/analyze - Happy Path', () => {
  it('questionnaire-only: returns valid dosha analysis', async () => {
    const res = await request(app)
      .post('/api/prakriti/analyze')
      .send(VALID_QUESTIONNAIRE);

    expect(res.status).toBe(200);
    expect(res.body.analysisId).toBeDefined();
    expect(res.body.dominantDosha).toMatch(/^(vata|pitta|kapha)$/);
    expect(res.body.scoreBreakdown).toHaveProperty('vata');
    expect(res.body.scoreBreakdown).toHaveProperty('pitta');
    expect(res.body.scoreBreakdown).toHaveProperty('kapha');
    expect(res.body.confidence).toBeGreaterThan(0);
    expect(res.body.recommendationSummary.diet).toBeInstanceOf(Array);
    expect(res.body.recommendationSummary.lifestyle).toBeInstanceOf(Array);
    expect(res.body.recommendationSummary.herbs).toBeInstanceOf(Array);
    expect(res.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.body.method).toBe('questionnaire');
  });

  it('scores sum to approximately 1.0', async () => {
    const res = await request(app)
      .post('/api/prakriti/analyze')
      .send(VALID_QUESTIONNAIRE);
    const { vata, pitta, kapha } = res.body.scoreBreakdown;
    expect(vata + pitta + kapha).toBeCloseTo(1.0, 1);
  });
});

describe('POST /api/prakriti/analyze - Validation Errors', () => {
  it('rejects empty body with 400', async () => {
    const res = await request(app).post('/api/prakriti/analyze').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects missing answers array with 400', async () => {
    const res = await request(app)
      .post('/api/prakriti/analyze')
      .send({ userId: 'test' });
    expect(res.status).toBe(400);
  });

  it('rejects non-array answers with 400', async () => {
    const res = await request(app)
      .post('/api/prakriti/analyze')
      .send({ answers: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('rejects answer missing questionId', async () => {
    const res = await request(app)
      .post('/api/prakriti/analyze')
      .send({ answers: [{ value: 'slim' }] });
    expect(res.status).toBe(400);
    expect(res.body.details.some(d => d.includes('questionId'))).toBe(true);
  });
});

describe('GET /api/prakriti/:analysisId', () => {
  it('returns 404 for non-existent analysisId', async () => {
    const res = await request(app).get('/api/prakriti/non-existent-id-123');
    expect(res.status).toBe(404);
  });

  it('returns saved analysis by id', async () => {
    const createRes = await request(app)
      .post('/api/prakriti/analyze')
      .send(VALID_QUESTIONNAIRE);
    const { analysisId } = createRes.body;
    const getRes = await request(app).get(`/api/prakriti/${analysisId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.analysisId).toBe(analysisId);
  });
});

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });
});
