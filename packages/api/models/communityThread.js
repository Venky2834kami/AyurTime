/**
 * Community Thread Model
 * Issue #16 - Community Satsang Hub
 * Supports Discussion Boards with dosha-based topic filtering
 */

const { v4: uuidv4 } = require('uuid');

const VALID_CATEGORIES = [
  'doshas', 'herbs', 'dinacharya', 'panchakarma', 'diet', 'yoga'
];

const VALID_TAGS = [
  'Vata', 'Pitta', 'Kapha', 'Agni', 'Ama', 'Ojas', 'Prana', 'Tridosha',
  'Ayurveda', 'Rasayana', 'Dinacharya', 'Ritucharya'
];

/**
 * Create a new thread
 */
function createThread({ user_id, title, body, category, tags = [], image_url = null }) {
  if (!user_id || !title || !body || !category) {
    throw new Error('user_id, title, body, and category are required');
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  const validatedTags = tags.filter(t => VALID_TAGS.includes(t));
  return {
    thread_id: uuidv4(),
    user_id,
    title: title.trim(),
    body, // markdown supported
    category,
    tags: validatedTags,
    image_url,
    upvotes: 0,
    bookmarks: 0,
    replies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Create a reply (max 2 levels deep)
 */
function createReply({ thread_id, user_id, body, parent_reply_id = null, depth = 0 }) {
  if (!thread_id || !user_id || !body) {
    throw new Error('thread_id, user_id, and body are required');
  }
  if (depth >= 2) {
    throw new Error('Maximum reply depth is 2');
  }
  return {
    reply_id: uuidv4(),
    thread_id,
    user_id,
    body,
    parent_reply_id,
    depth,
    upvotes: 0,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  createThread,
  createReply,
  VALID_CATEGORIES,
  VALID_TAGS
};
