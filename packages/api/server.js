/**
 * AyurTime API Server
 * Phase 4: Prakriti Analysis Backend
 * 
 * Entry point for the Express API server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prakritiRoutes = require('./routes/prakriti');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/prakriti', prakritiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AyurTime API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AyurTime API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      prakritiAnalysis: 'POST /api/prakriti/analyze'
    },
    documentation: 'See README.md for API contract details'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 AyurTime API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔬 Prakriti Analysis: POST http://localhost:${PORT}/api/prakriti/analyze\n`);
  });
}

module.exports = app;
