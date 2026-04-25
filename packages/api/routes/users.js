/**
 * Users Router — AyurTime API
 * POST /api/users        → create a new user
 * GET  /api/users/:id   → get user by userId
 *
 * Storage: in-memory Map (swap for DB in Phase 2)
 */

const express = require('express');
const router = express.Router();
const { createUser, validateUser } = require('../models/user');

// In-memory store — Phase 2 will replace with DB layer
const users = new Map();

/**
 * POST /api/users
 * Body: { name, email, primaryDosha? }
 */
router.post('/', (req, res) => {
  const errors = validateUser(req.body || {});
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  try {
    const user = createUser(req.body);
    users.set(user.userId, user);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/users/:userId
 */
router.get('/:userId', (req, res) => {
  const user = users.get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found', userId: req.params.userId });
  return res.status(200).json(user);
});

// Export store for testing
router._store = users;
module.exports = router;
