/**
 * Simple file-based user store.
 * Reads/writes packages/api/data/users.json.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Ensure data directory and file exist.
 */
function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Load all users from JSON file.
 * @returns {Array}
 */
function loadUsers() {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save full users array to JSON file.
 * @param {Array} users
 */
function saveUsers(users) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Append a single user.
 * @param {Object} user
 */
function addUser(user) {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

/**
 * Find user by userId.
 * @param {string} userId
 */
function getUserById(userId) {
  const users = loadUsers();
  return users.find(u => u.userId === userId) || null;
}

module.exports = {
  loadUsers,
  saveUsers,
  addUser,
  getUserById,
};
