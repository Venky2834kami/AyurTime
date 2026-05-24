/**
 * Bio-Hacking Analytics API Tests - Phase 3B
 * Tests: POST log-metric, GET metrics, GET trends endpoints
 */

const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

const METRICS_FILE = path.join(__dirname, '../storage/bio-hacking-metrics.json');

// Clean up test data before each test
beforeEach(() => {
  if (fs.existsSync(METRICS_FILE)) {
    fs.unlinkSync(METRICS_FILE);
  }
});

afterhEach(() => {
  if (fs.existsSync(METRICS_FILE)) {
    fs.unlinkSync(METRICS_FILE);
  }
});

describe('POST /api/bio-hacking/log-metric', () => {
  it('should log a valid health metric', async () => {
    const metric = {
      userId: 'test-user-001',
      date: '2026-05-24',
      metric_type: 'energy',
      value: 8,
      notes: 'Felt energetic after morning yoga'
    };

    const res = await request(app)
      .post('/api/bio-hacking/log-metric')
      .send(metric);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Metric logged successfully');
    expect(res.body.metric).toHaveProperty('id');
    expect(res.body.metric.metric_type).toBe('energy');
  });

  it('should reject metric without required fields', async () => {
    const invalidMetric = {
      userId: 'test-user-001',
      date: '2026-05-24'
      // missing metric_type and value
    };

    const res = await request(app)
      .post('/api/bio-hacking/log-metric')
      .send(invalidMetric);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/bio-hacking/metrics', () => {
  it('should retrieve user metrics with date filtering', async () => {
    // First log a metric
    await request(app)
      .post('/api/bio-hacking/log-metric')
      .send({
        userId: 'test-user-001',
        date: '2026-05-24',
        metric_type: 'sleep',
        value: 7.5,
        notes: 'Good sleep quality'
      });

    const res = await request(app)
      .get('/api/bio-hacking/metrics')
      .query({ userId: 'test-user-001', from: '2026-05-01', to: '2026-05-31' });

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeInstanceOf(Array);
    expect(res.body.metrics.length).toBeGreaterThan(0);
  });
});

describe('GET /api/bio-hacking/trends', () => {
  it('should calculate 7/30/90-day trend averages', async () => {
    // Log multiple metrics
    const metrics = [
      { userId: 'test-user-001', date: '2026-05-20', metric_type: 'weight', value: 70 },
      { userId: 'test-user-001', date: '2026-05-21', metric_type: 'weight', value: 69.5 },
      { userId: 'test-user-001', date: '2026-05-22', metric_type: 'weight', value: 69.8 }
    ];

    for (const metric of metrics) {
      await request(app).post('/api/bio-hacking/log-metric').send(metric);
    }

    const res = await request(app)
      .get('/api/bio-hacking/trends')
      .query({ userId: 'test-user-001', metric: 'weight' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('trends');
    expect(res.body.trends).toHaveProperty('avg_7_days');
  });
});
