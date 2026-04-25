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
const { addUser, getUserById } = require('../usersStore');
/**
 * POST /api/users
 * Body: { name, email, primaryDosha? }
 */
router.post('/', (req, res) => {
  const errors = validateUser(req.body || {});
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const user = createUser(req.body);
    addUser(user);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/:userId', (req, res) => {
  const user = getUserById(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found', userId: req.params.userId });
  }
  return res.status(200).json(user);
});

module.exports = router;
