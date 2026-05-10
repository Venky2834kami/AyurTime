/**
 * User Model — AyurTime API
 * Minimal schema for a registered user.
 * In Phase 2 this will map to a real DB table via Prisma/Knex.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * @typedef {Object} User
 * @property {string} userId        - UUID primary key
 * @property {string} name          - Display name
 * @property {string} email         - Unique email
 * @property {string} primaryDosha  - Dominant dosha from last assessment (vata|pitta|kapha|null)
 * @property {string} createdAt     - ISO8601 creation timestamp
 * @property {string} updatedAt     - ISO8601 last-update timestamp
 */

function createUser({ name, email, primaryDosha = null }) {
  if (!name || typeof name !== 'string') throw new Error('name is required');
  if (!email || typeof email !== 'string') throw new Error('email is required');

  const now = new Date().toISOString();
  return {
    userId: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    primaryDosha,
    createdAt: now,
    updatedAt: now,
  };
}

function validateUser(user) {
  const errors = [];
  if (!user.name) errors.push('name is required');
  if (!user.email || !/^[^@]+@[^@]+\.[^@]+$/.test(user.email))
    errors.push('valid email is required');
  if (user.primaryDosha && !['vata', 'pitta', 'kapha'].includes(user.primaryDosha))
    errors.push('primaryDosha must be vata, pitta, or kapha');
  return errors;
}

module.exports = { createUser, validateUser };
