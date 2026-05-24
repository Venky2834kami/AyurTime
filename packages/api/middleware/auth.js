/**
 * middleware/auth.js
 * AyurTime Phase 2 — JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ayurtime-dev-secret-change-in-production';

/**
 * verifyToken — Express middleware
 * Verifies Bearer JWT in Authorization header.
 * Attaches decoded payload to req.user on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TokenExpired', message: 'JWT token has expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid JWT token.' });
  }
}

/**
 * optionalAuth — Express middleware (non-blocking)
 * Attaches req.user if valid token is present, otherwise continues.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = { verifyToken, optionalAuth, JWT_SECRET };
