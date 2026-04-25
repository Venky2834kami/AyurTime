/**
 * Recommendation Model — AyurTime API
 * Represents a personalised Ayurvedic recommendation set
 * derived from a completed assessment.
 */

/**
 * @typedef {Object} Recommendation
 * @property {string}   recommendationId - UUID
 * @property {string}   assessmentId     - Reference to parent Assessment
 * @property {string}   userId
 * @property {string}   dominantDosha    - vata | pitta | kapha
 * @property {Object}   scoreBreakdown   - { vata, pitta, kapha } normalised 0-1
 * @property {number}   confidence       - highest dosha score
 * @property {string[]} diet             - Diet recommendations
 * @property {string[]} lifestyle        - Lifestyle recommendations
 * @property {string[]} herbs            - Herbal recommendations
 * @property {string}   createdAt
 */

const { v4: uuidv4 } = require('uuid');

const RECOMMENDATION_LIBRARY = {
  vata: {
    diet:      ['Warm, cooked foods', 'Sweet, sour, salty tastes', 'Sesame oil & ghee', 'Warm milk with spices'],
    lifestyle: ['Regular Dinacharya (daily routine)', 'Abhyanga (oil massage)', 'Avoid cold & raw foods', 'Early bedtime'],
    herbs:     ['Ashwagandha', 'Shatavari', 'Triphala', 'Brahmi'],
  },
  pitta: {
    diet:      ['Cooling, fresh foods', 'Sweet, bitter, astringent tastes', 'Coconut oil', 'Fresh fruits & vegetables'],
    lifestyle: ['Avoid overheating', 'Moon bathing', 'Moderate exercise', 'Sheetali pranayama'],
    herbs:     ['Amalaki', 'Shatavari', 'Neem', 'Guduchi'],
  },
  kapha: {
    diet:      ['Light, dry foods', 'Pungent, bitter, astringent tastes', 'Honey in warm water', 'Spiced teas'],
    lifestyle: ['Vigorous daily exercise', 'Wake before sunrise', 'Garshana (dry massage)', 'Occasional fasting'],
    herbs:     ['Trikatu', 'Guggulu', 'Punarnava', 'Bibhitaki'],
  },
};

function createRecommendation({ assessmentId, userId, dominantDosha, scoreBreakdown, confidence }) {
  if (!RECOMMENDATION_LIBRARY[dominantDosha])
    throw new Error(`Unknown dosha: ${dominantDosha}`);

  const library = RECOMMENDATION_LIBRARY[dominantDosha];
  return {
    recommendationId: uuidv4(),
    assessmentId,
    userId: userId || 'anonymous',
    dominantDosha,
    scoreBreakdown,
    confidence,
    diet:      library.diet,
    lifestyle: library.lifestyle,
    herbs:     library.herbs,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createRecommendation, RECOMMENDATION_LIBRARY };
