/**
 * AyurTime API Server - Backend Hardening (Issue #19)
 * Implements: Helmet, Morgan, Rate Limiting, Input Validation, Health Check
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'prakriti-profiles.json');

// ─── Ensure data directory exists ───────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, JSON.stringify([], null, 2));

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Logging (Morgan) ─────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));  // File logging
app.use(morgan('dev'));                                      // Console logging

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute window
  max: 10,                 // 10 requests per IP per minute
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Max 10 requests per minute per IP.',
    retryAfter: 60,
  },
  handler: (req, res, next, options) => {
    console.warn(`[RATE_LIMIT] IP ${req.ip} exceeded limit at ${new Date().toISOString()}`);
    res.status(429).json(options.message);
  },
});

app.use('/api/', apiLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check Endpoint ────────────────────────────────────────────────────
/**
 * GET /health
 * Returns server health status with ISO8601 timestamp
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AyurTime API',
    uptime: process.uptime(),
  });
});

// ─── Input Validation Helpers ─────────────────────────────────────────────────
const VALID_DOSHAS = ['vata', 'pitta', 'kapha'];
const VALID_METHODS = ['questionnaire', 'image_analysis', 'hybrid'];

function validatePrakritiPayload(body) {
  const errors = [];

  if (!body) {
    errors.push('Request body is required');
    return errors;
  }

  // Must have at least questionnaire answers
  if (!body.answers && !body.imageData) {
    errors.push('Either `answers` (questionnaire) or `imageData` must be provided');
  }

  // Validate questionnaire answers if present
  if (body.answers !== undefined) {
    if (!Array.isArray(body.answers)) {
      errors.push('`answers` must be an array');
    } else if (body.answers.length < 1) {
      errors.push('`answers` array must not be empty');
    } else {
      body.answers.forEach((ans, idx) => {
        if (typeof ans !== 'object' || ans === null) {
          errors.push(`answers[${idx}]: each answer must be an object with questionId and value`);
        } else {
          if (!ans.questionId) errors.push(`answers[${idx}]: missing questionId`);
          if (ans.value === undefined || ans.value === null) errors.push(`answers[${idx}]: missing value`);
        }
      });
    }
  }

  // Validate imageData if present
  if (body.imageData !== undefined) {
    if (typeof body.imageData !== 'object') {
      errors.push('`imageData` must be an object with tongue/nail/face keys');
    }
  }

  // Optional userId validation
  if (body.userId !== undefined && typeof body.userId !== 'string') {
    errors.push('`userId` must be a string if provided');
  }

  return errors;
}

// ─── Dosha Scoring Engine ─────────────────────────────────────────────────────
function scoreDoshas(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  const weights = { vata: 0, pitta: 0, kapha: 0 };

  answers.forEach(({ questionId, value }) => {
    // Rule-based scoring — maps questionnaire values to dosha tendencies
    const doshaMap = getDoshaMapping(questionId, value);
    Object.keys(doshaMap).forEach(dosha => {
      scores[dosha] += doshaMap[dosha];
      weights[dosha] += 1;
    });
  });

  const total = scores.vata + scores.pitta + scores.kapha;
  if (total === 0) return { vata: 0.33, pitta: 0.34, kapha: 0.33 };

  return {
    vata: parseFloat((scores.vata / total).toFixed(3)),
    pitta: parseFloat((scores.pitta / total).toFixed(3)),
    kapha: parseFloat((scores.kapha / total).toFixed(3)),
  };
}

function getDoshaMapping(questionId, value) {
  // Simplified rule-based dosha scoring per question
  // In production: load from prakriti-data.json
  const mappings = {
    body_frame:       { slim: { vata: 3 }, medium: { pitta: 3 }, large: { kapha: 3 } },
    skin_type:        { dry: { vata: 3 }, sensitive: { pitta: 3 }, oily: { kapha: 3 } },
    appetite:         { irregular: { vata: 3 }, strong: { pitta: 3 }, slow: { kapha: 3 } },
    energy_level:     { variable: { vata: 3 }, intense: { pitta: 3 }, steady: { kapha: 3 } },
    sleep_pattern:    { light: { vata: 3 }, moderate: { pitta: 3 }, deep: { kapha: 3 } },
    mind_nature:      { creative: { vata: 3 }, focused: { pitta: 3 }, calm: { kapha: 3 } },
    weight_tendency:  { lose_easily: { vata: 3 }, moderate: { pitta: 3 }, gain_easily: { kapha: 3 } },
    stress_response:  { anxious: { vata: 3 }, irritable: { pitta: 3 }, withdrawn: { kapha: 3 } },
  };

  return mappings[questionId]?.[value] || { vata: 1, pitta: 1, kapha: 1 };
}

function getDominantDosha(scoreBreakdown) {
  return Object.entries(scoreBreakdown).sort(([, a], [, b]) => b - a)[0][0];
}

function generateRecommendations(dominantDosha) {
  const recommendations = {
    vata: {
      diet: ['Warm, cooked foods', 'Sweet, sour, salty tastes', 'Sesame oil, ghee', 'Warm milk with spices'],
      lifestyle: ['Regular daily routine (Dinacharya)', 'Oil massage (Abhyanga)', 'Avoid cold & raw foods', 'Early bedtime'],
      herbs: ['Ashwagandha', 'Shatavari', 'Triphala', 'Brahmi'],
    },
    pitta: {
      diet: ['Cooling foods', 'Sweet, bitter, astringent tastes', 'Coconut oil', 'Fresh fruits & vegetables'],
      lifestyle: ['Avoid overheating', 'Moon bathing', 'Moderate exercise', 'Cooling pranayama (Sheetali)'],
      herbs: ['Amalaki', 'Shatavari', 'Neem', 'Guduchi'],
    },
    kapha: {
      diet: ['Light, dry foods', 'Pungent, bitter, astringent tastes', 'Honey in warm water', 'Spiced teas'],
      lifestyle: ['Vigorous daily exercise', 'Wake before sunrise', 'Dry massage (Garshana)', 'Fasting occasionally'],
      herbs: ['Trikatu', 'Guggulu', 'Punarnava', 'Bibhitaki'],
    },
  };
  return recommendations[dominantDosha] || recommendations.vata;
}

// ─── Persistence Layer ────────────────────────────────────────────────────────
function loadProfiles() {
  try {
    const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveProfile(profile) {
  const profiles = loadProfiles();
  profiles.push(profile);
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
  return profile;
}

function getProfileById(analysisId) {
  return loadProfiles().find(p => p.analysisId === analysisId) || null;
}

// ─── POST /api/prakriti/analyze ───────────────────────────────────────────────
/**
 * Analyzes questionnaire answers and/or image data to determine Prakriti dosha
 * Body: { userId?, answers: [{questionId, value}], imageData?: {tongue?, nail?, face?} }
 * Returns: full prakriti analysis with scores, recommendations, analysisId
 */
app.post('/api/prakriti/analyze', (req, res) => {
  // Input Validation
  const validationErrors = validatePrakritiPayload(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationErrors,
    });
  }

  const { answers = [], imageData, userId = 'anonymous' } = req.body;

  try {
    const method = imageData && answers.length > 0
      ? 'hybrid'
      : imageData
      ? 'image_analysis'
      : 'questionnaire';

    // Score doshas from questionnaire
    const scoreBreakdown = answers.length > 0
      ? scoreDoshas(answers)
      : { vata: 0.33, pitta: 0.34, kapha: 0.33 };

    const dominantDosha = getDominantDosha(scoreBreakdown);
    const confidence = Math.max(...Object.values(scoreBreakdown));
    const recommendationSummary = generateRecommendations(dominantDosha);

    const contributingSignals = [];
    if (answers.length > 0) contributingSignals.push('questionnaire');
    if (imageData) contributingSignals.push('image_analysis_placeholder');

    const analysis = {
      analysisId: uuidv4(),
      userId,
      dominantDosha,
      scoreBreakdown,
      confidence: parseFloat(confidence.toFixed(3)),
      contributingSignals,
      recommendationSummary,
      createdAt: new Date().toISOString(),
      method,
    };

    // Persist to JSON store
    saveProfile(analysis);

    console.info(`[ANALYZE] analysisId=${analysis.analysisId} userId=${userId} dosha=${dominantDosha} confidence=${confidence}`);

    return res.status(200).json(analysis);
  } catch (err) {
    console.error('[ANALYZE_ERROR]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Analysis failed. Please try again.',
    });
  }
});

// ─── GET /api/prakriti/:analysisId ───────────────────────────────────────────
app.get('/api/prakriti/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  const profile = getProfileById(analysisId);
  if (!profile) {
    return res.status(404).json({ error: 'Analysis not found', analysisId });
  }
  return res.status(200).json(profile);
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[UNHANDLED_ERROR]', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ AyurTime API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Analyze: POST http://localhost:${PORT}/api/prakriti/analyze`);
});

module.exports = app;
