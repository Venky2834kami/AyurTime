/**
 * routes/auth.js
 * AyurTime Phase 2 — JWT Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const USERS_PATH = path.join(__dirname, '../storage/users.json');

function readUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')); } catch { return []; }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// -------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
      prakriti: null
    };

    users.push(user);
    writeUsers(users);

    const token = generateToken(user);
    res.status(201).json({ success: true, token, user: { id: user.id, name, email } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', detail: err.message });
  }
});

// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email && u.password_hash === hashPassword(password));

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', detail: err.message });
  }
});

// -------------------------------------------------------
// GET /api/auth/me
// Returns current authenticated user
// -------------------------------------------------------
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
