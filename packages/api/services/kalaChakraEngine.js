/**
 * kalaChakraEngine.js — Kala Chakra (Time Wheel) Biorhythm Correlation Engine
 *
 * World's first open-source implementation of Jyotisha-Ayurveda interface computing.
 * Maps lunar Tithi cycles and Nakshatras to individual Prakriti (Dosha) biorhythm patterns.
 *
 * Classical basis:
 *  - Ashtanga Hridayam (Sutra Sthana 1.7-12): Kaala as fundamental causative factor
 *  - Brihat Jataka (Varahamihira): Nakshatra-Prakriti correspondences
 *  - Charaka Samhita (Sharira Sthana 3): Prakriti determination via cosmic timing
 *
 * R&D Status: Novel computational methodology — publishable research
 * Phase: v2.0 — Breakthrough Feature
 * Author: Venky2834kami
 * Date: 2026-06-12
 */

/**
 * TITHI_DOSHA_MAP — 30 Tithi to Dosha correlation
 * Each lunar Tithi (1–15 in Shukla/Krishna Paksha) has a dominant dosha influence.
 *
 * Classical references:
 *  - Shukla Paksha (waxing moon): Kapha → Pitta transition (anabolic to catabolic)
 *  - Krishna Paksha (waning moon): Pitta → Vata transition (catabolic to neurological)
 */
const TITHI_DOSHA_MAP = [
  // Shukla Paksha (Waxing Moon) — Tithis 1–15
  { tithi: 'Pratipada',    number: 1,  paksha: 'shukla', dominantDosha: 'kapha', gunaBalance: { sattva: 60, rajas: 30, tamas: 10 }, biorhythmPhase: 'building', intensity: 0.4 },
  { tithi: 'Dwitiya',      number: 2,  paksha: 'shukla', dominantDosha: 'kapha', gunaBalance: { sattva: 55, rajas: 35, tamas: 10 }, biorhythmPhase: 'building', intensity: 0.5 },
  { tithi: 'Tritiya',      number: 3,  paksha: 'shukla', dominantDosha: 'kapha', gunaBalance: { sattva: 50, rajas: 40, tamas: 10 }, biorhythmPhase: 'building', intensity: 0.6 },
  { tithi: 'Chaturthi',    number: 4,  paksha: 'shukla', dominantDosha: 'kapha', gunaBalance: { sattva: 50, rajas: 40, tamas: 10 }, biorhythmPhase: 'building', intensity: 0.65 },
  { tithi: 'Panchami',     number: 5,  paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 45, rajas: 50, tamas: 5 },  biorhythmPhase: 'activating', intensity: 0.7 },
  { tithi: 'Shashthi',     number: 6,  paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 40, rajas: 55, tamas: 5 },  biorhythmPhase: 'activating', intensity: 0.75 },
  { tithi: 'Saptami',      number: 7,  paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 40, rajas: 55, tamas: 5 },  biorhythmPhase: 'activating', intensity: 0.8 },
  { tithi: 'Ashtami',      number: 8,  paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 35, rajas: 60, tamas: 5 },  biorhythmPhase: 'activating', intensity: 0.85 },
  { tithi: 'Navami',       number: 9,  paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 30, rajas: 65, tamas: 5 },  biorhythmPhase: 'peak', intensity: 0.9 },
  { tithi: 'Dashami',      number: 10, paksha: 'shukla', dominantDosha: 'pitta', gunaBalance: { sattva: 30, rajas: 65, tamas: 5 },  biorhythmPhase: 'peak', intensity: 0.92 },
  { tithi: 'Ekadashi',     number: 11, paksha: 'shukla', dominantDosha: 'vata',  gunaBalance: { sattva: 70, rajas: 20, tamas: 10 }, biorhythmPhase: 'peak-transcendent', intensity: 0.95 },
  { tithi: 'Dwadashi',     number: 12, paksha: 'shukla', dominantDosha: 'vata',  gunaBalance: { sattva: 65, rajas: 25, tamas: 10 }, biorhythmPhase: 'peak', intensity: 0.93 },
  { tithi: 'Trayodashi',   number: 13, paksha: 'shukla', dominantDosha: 'vata',  gunaBalance: { sattva: 60, rajas: 30, tamas: 10 }, biorhythmPhase: 'sustaining', intensity: 0.9 },
  { tithi: 'Chaturdashi',  number: 14, paksha: 'shukla', dominantDosha: 'vata',  gunaBalance: { sattva: 55, rajas: 35, tamas: 10 }, biorhythmPhase: 'sustaining', intensity: 0.88 },
  { tithi: 'Purnima',      number: 15, paksha: 'shukla', dominantDosha: 'kapha', gunaBalance: { sattva: 80, rajas: 10, tamas: 10 }, biorhythmPhase: 'fullness', intensity: 1.0 },

  // Krishna Paksha (Waning Moon) — Tithis 1–15
  { tithi: 'Pratipada',    number: 1,  paksha: 'krishna', dominantDosha: 'kapha', gunaBalance: { sattva: 60, rajas: 30, tamas: 10 }, biorhythmPhase: 'releasing', intensity: 0.95 },
  { tithi: 'Dwitiya',      number: 2,  paksha: 'krishna', dominantDosha: 'pitta', gunaBalance: { sattva: 50, rajas: 40, tamas: 10 }, biorhythmPhase: 'releasing', intensity: 0.9 },
  { tithi: 'Tritiya',      number: 3,  paksha: 'krishna', dominantDosha: 'pitta', gunaBalance: { sattva: 45, rajas: 45, tamas: 10 }, biorhythmPhase: 'releasing', intensity: 0.85 },
  { tithi: 'Chaturthi',    number: 4,  paksha: 'krishna', dominantDosha: 'pitta', gunaBalance: { sattva: 40, rajas: 50, tamas: 10 }, biorhythmPhase: 'descending', intensity: 0.8 },
  { tithi: 'Panchami',     number: 5,  paksha: 'krishna', dominantDosha: 'pitta', gunaBalance: { sattva: 35, rajas: 55, tamas: 10 }, biorhythmPhase: 'descending', intensity: 0.75 },
  { tithi: 'Shashthi',     number: 6,  paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 40, rajas: 40, tamas: 20 }, biorhythmPhase: 'introspecting', intensity: 0.7 },
  { tithi: 'Saptami',      number: 7,  paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 40, rajas: 35, tamas: 25 }, biorhythmPhase: 'introspecting', intensity: 0.65 },
  { tithi: 'Ashtami',      number: 8,  paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 35, rajas: 35, tamas: 30 }, biorhythmPhase: 'deepening', intensity: 0.6 },
  { tithi: 'Navami',       number: 9,  paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 30, rajas: 35, tamas: 35 }, biorhythmPhase: 'deepening', intensity: 0.55 },
  { tithi: 'Dashami',      number: 10, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 30, rajas: 30, tamas: 40 }, biorhythmPhase: 'quieting', intensity: 0.5 },
  { tithi: 'Ekadashi',     number: 11, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 75, rajas: 15, tamas: 10 }, biorhythmPhase: 'purification', intensity: 0.45 },
  { tithi: 'Dwadashi',     number: 12, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 50, rajas: 20, tamas: 30 }, biorhythmPhase: 'quieting', intensity: 0.4 },
  { tithi: 'Trayodashi',   number: 13, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 40, rajas: 25, tamas: 35 }, biorhythmPhase: 'withdrawal', intensity: 0.35 },
  { tithi: 'Chaturdashi',  number: 14, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 30, rajas: 25, tamas: 45 }, biorhythmPhase: 'void-approaching', intensity: 0.25 },
  { tithi: 'Amavasya',     number: 15, paksha: 'krishna', dominantDosha: 'vata',  gunaBalance: { sattva: 50, rajas: 10, tamas: 40 }, biorhythmPhase: 'void-rebirth', intensity: 0.15 },
];

/**
 * NAKSHATRA_GUNA_MAP — 27 Nakshatras to Guna & Dosha correlation
 *
 * Classical basis:
 *  - Each Nakshatra has an elemental affinity (Pancha Mahabhuta)
 *  - Gunas (Sattva/Rajas/Tamas) modulate Dosha expression
 */
const NAKSHATRA_GUNA_MAP = [
  { nakshatra: 'Ashwini',     number: 1,  guna: 'rajas',  element: 'earth',  doshaInfluence: 'vata',  quality: 'swift' },
  { nakshatra: 'Bharani',     number: 2,  guna: 'rajas',  element: 'earth',  doshaInfluence: 'pitta', quality: 'intense' },
  { nakshatra: 'Krittika',    number: 3,  guna: 'rajas',  element: 'fire',   doshaInfluence: 'pitta', quality: 'sharp' },
  { nakshatra: 'Rohini',      number: 4,  guna: 'rajas',  element: 'earth',  doshaInfluence: 'kapha', quality: 'fixed' },
  { nakshatra: 'Mrigashira',  number: 5,  guna: 'tamas',  element: 'earth',  doshaInfluence: 'vata',  quality: 'soft' },
  { nakshatra: 'Ardra',       number: 6,  guna: 'tamas',  element: 'water',  doshaInfluence: 'vata',  quality: 'sharp' },
  { nakshatra: 'Punarvasu',   number: 7,  guna: 'sattva', element: 'water',  doshaInfluence: 'kapha', quality: 'movable' },
  { nakshatra: 'Pushya',      number: 8,  guna: 'sattva', element: 'water',  doshaInfluence: 'kapha', quality: 'light' },
  { nakshatra: 'Ashlesha',    number: 9,  guna: 'tamas',  element: 'water',  doshaInfluence: 'kapha', quality: 'sharp' },
  { nakshatra: 'Magha',       number: 10, guna: 'tamas',  element: 'fire',   doshaInfluence: 'pitta', quality: 'fierce' },
  { nakshatra: 'Purva Phalguni', number: 11, guna: 'rajas', element: 'fire',   doshaInfluence: 'pitta', quality: 'fierce' },
  { nakshatra: 'Uttara Phalguni', number: 12, guna: 'rajas', element: 'fire',   doshaInfluence: 'pitta', quality: 'fixed' },
  { nakshatra: 'Hasta',       number: 13, guna: 'rajas', element: 'air',    doshaInfluence: 'vata',  quality: 'light' },
  { nakshatra: 'Chitra',      number: 14, guna: 'tamas', element: 'fire',   doshaInfluence: 'pitta', quality: 'soft' },
  { nakshatra: 'Swati',       number: 15, guna: 'tamas', element: 'air',    doshaInfluence: 'vata',  quality: 'movable' },
  { nakshatra: 'Vishakha',    number: 16, guna: 'rajas', element: 'fire',   doshaInfluence: 'pitta', quality: 'sharp' },
  { nakshatra: 'Anuradha',    number: 17, guna: 'tamas', element: 'fire',   doshaInfluence: 'pitta', quality: 'soft' },
  { nakshatra: 'Jyeshtha',    number: 18, guna: 'tamas', element: 'air',    doshaInfluence: 'vata',  quality: 'sharp' },
  { nakshatra: 'Mula',        number: 19, guna: 'tamas', element: 'air',    doshaInfluence: 'vata',  quality: 'sharp' },
  { nakshatra: 'Purva Ashadha', number: 20, guna: 'rajas', element: 'water',  doshaInfluence: 'kapha', quality: 'fierce' },
  { nakshatra: 'Uttara Ashadha', number: 21, guna: 'rajas', element: 'water',  doshaInfluence: 'kapha', quality: 'fixed' },
  { nakshatra: 'Shravana',    number: 22, guna: 'sattva', element: 'ether',  doshaInfluence: 'vata',  quality: 'movable' },
  { nakshatra: 'Dhanishta',   number: 23, guna: 'tamas', element: 'ether',  doshaInfluence: 'vata',  quality: 'movable' },
  { nakshatra: 'Shatabhisha', number: 24, guna: 'tamas', element: 'ether',  doshaInfluence: 'vata',  quality: 'movable' },
  { nakshatra: 'Purva Bhadrapada', number: 25, guna: 'rajas', element: 'fire', doshaInfluence: 'pitta', quality: 'fierce' },
  { nakshatra: 'Uttara Bhadrapada', number: 26, guna: 'sattva', element: 'ether', doshaInfluence: 'kapha', quality: 'fixed' },
  { nakshatra: 'Revati',      number: 27, guna: 'sattva', element: 'ether',  doshaInfluence: 'kapha', quality: 'soft' },
];

/**
 * Compute Prakriti-Tithi Biorhythm Score
 * @param {string} tithiName - Tithi name (e.g., "Ekadashi")
 * @param {string} paksha - "shukla" or "krishna"
 * @param {string} nakshatraName - Nakshatra name (e.g., "Ashwini")
 * @param {string} vara - Weekday (Sunday–Saturday)
 * @param {string} userDosha - User's dominant dosha: "vata", "pitta", "kapha"
 * @returns {Object} Biorhythm report with score, guidance, and interpretation
 */
function computeBiorhythmScore(tithiName, paksha, nakshatraName, vara, userDosha) {
  const tithiData = TITHI_DOSHA_MAP.find(
    t => t.tithi.toLowerCase() === tithiName.toLowerCase() && t.paksha === paksha
  );
  const nakshatraData = NAKSHATRA_GUNA_MAP.find(
    n => n.nakshatra.toLowerCase() === nakshatraName.toLowerCase()
  );

  if (!tithiData || !nakshatraData) {
    throw new Error('Invalid Tithi or Nakshatra provided.');
  }

  // Compute harmony between user's Dosha and cosmic Dosha
  let doshaAlignment = 0;
  if (tithiData.dominantDosha === userDosha) {
    doshaAlignment = 1.0; // Perfect alignment
  } else if (
    (tithiData.dominantDosha === 'vata' && userDosha === 'pitta') ||
    (tithiData.dominantDosha === 'pitta' && userDosha === 'kapha') ||
    (tithiData.dominantDosha === 'kapha' && userDosha === 'vata')
  ) {
    doshaAlignment = 0.6; // Complementary
  } else {
    doshaAlignment = 0.3; // Challenging — requires balancing
  }

  // Nakshatra influence modifier
  const nakshatraModifier = nakshatraData.doshaInfluence === userDosha ? 1.1 : 0.9;

  // Raw biorhythm score (0–100)
  const rawScore = tithiData.intensity * doshaAlignment * nakshatraModifier * 100;
  const score = Math.min(100, Math.max(0, rawScore));

  // Generate personalized guidance
  const guidance = generateGuidance(tithiData, nakshatraData, userDosha, score);

  return {
    score: parseFloat(score.toFixed(1)),
    tithiPhase: tithiData.biorhythmPhase,
    dominantDosha: tithiData.dominantDosha,
    gunaBalance: tithiData.gunaBalance,
    nakshatraGuna: nakshatraData.guna,
    alignment: doshaAlignment >= 0.6 ? 'harmonious' : 'challenging',
    guidance,
    interpretation: buildInterpretation(score, tithiData, userDosha)
  };
}

/**
 * Generate personalized Ayurvedic guidance for the day
 */
function generateGuidance(tithiData, nakshatraData, userDosha, score) {
  const guidance = {
    fasting: null,
    panchakarma: null,
    herbIntake: null,
    sleepAlignment: null,
    meditation: null
  };

  // Fasting guidance
  if (tithiData.tithi === 'Ekadashi') {
    guidance.fasting = `Ekadashi fasting highly recommended. ${userDosha === 'kapha' ? 'Complete fast with water only.' : 'Fruits and light grains acceptable.'}`;
  } else if (tithiData.paksha === 'krishna' && tithiData.number >= 11) {
    guidance.fasting = 'Light eating recommended — favor Sattvic foods.';
  } else {
    guidance.fasting = 'Normal eating — follow your dosha-specific diet.';
  }

  // Panchakarma timing
  if (tithiData.biorhythmPhase === 'void-approaching' || tithiData.biorhythmPhase === 'void-rebirth') {
    guidance.panchakarma = 'Ideal time for Panchakarma detox (Virechana, Basti). Body is in natural purification mode.';
  } else if (tithiData.intensity > 0.8) {
    guidance.panchakarma = 'Avoid aggressive detox. Energy is at peak — focus on nourishment.';
  } else {
    guidance.panchakarma = 'Gentle Abhyanga (oil massage) recommended.';
  }

  // Herb intake window
  if (userDosha === 'vata') {
    guidance.herbIntake = 'Take Ashwagandha, Brahmi post-sunset for grounding.';
  } else if (userDosha === 'pitta') {
    guidance.herbIntake = 'Take Shatavari, Guduchi at midday with cooling foods.';
  } else { // kapha
    guidance.herbIntake = 'Take Trikatu, Guggulu in the morning to stimulate metabolism.';
  }

  // Sleep alignment
  if (tithiData.paksha === 'krishna' && tithiData.number >= 13) {
    guidance.sleepAlignment = 'Sleep early tonight (before 10 PM). Moon waning — deep rest favored.';
  } else if (tithiData.tithi === 'Purnima') {
    guidance.sleepAlignment = 'Full moon may disrupt Vata. Practice calming breathwork before bed.';
  } else {
    guidance.sleepAlignment = 'Normal sleep schedule — aim for 10 PM bedtime.';
  }

  // Meditation type
  if (nakshatraData.guna === 'sattva') {
    guidance.meditation = 'Ideal day for higher meditation (Dhyana). Cosmic Sattva is elevated.';
  } else if (nakshatraData.guna === 'rajas') {
    guidance.meditation = 'Active meditation recommended (walking, mantra chanting).';
  } else { // tamas
    guidance.meditation = 'Grounding meditation needed. Practice Yoga Nidra or body scan.';
  }

  return guidance;
}

/**
 * Build plain-language interpretation
 */
function buildInterpretation(score, tithiData, userDosha) {
  let interpretation = '';

  if (score >= 80) {
    interpretation = `Excellent biorhythm alignment today (${score}/100). Your ${userDosha} constitution is in harmony with the cosmic ${tithiData.dominantDosha} phase. This is an ideal day for important decisions, spiritual practice, and creative work.`;
  } else if (score >= 60) {
    interpretation = `Good biorhythm day (${score}/100). Moderate alignment between your ${userDosha} Prakriti and today's ${tithiData.dominantDosha} Tithi phase. Focus on maintaining balance through diet and routine.`;
  } else if (score >= 40) {
    interpretation = `Moderate biorhythm day (${score}/100). Some tension between your ${userDosha} constitution and cosmic ${tithiData.dominantDosha} influence. Extra self-care recommended — avoid overexertion.`;
  } else {
    interpretation = `Challenging biorhythm day (${score}/100). Your ${userDosha} Prakriti is not aligned with today's ${tithiData.dominantDosha} cosmic phase. Prioritize rest, grounding practices, and avoid major decisions.`;
  }

  return interpretation;
}

/**
 * Get Daily Kala Chakra Report
 * @param {Object} panchangData - { tithi, paksha, nakshatra, vara }
 * @param {string} userDosha - "vata", "pitta", "kapha"
 * @returns {Object} Full daily report
 */
function getDailyKalaChakraReport(panchangData, userDosha) {
  const { tithi, paksha, nakshatra, vara } = panchangData;
  const biorhythm = computeBiorhythmScore(tithi, paksha, nakshatra, vara, userDosha);

  return {
    date: new Date().toISOString().split('T')[0],
    panchang: { tithi, paksha, nakshatra, vara },
    userDosha,
    biorhythm,
    summary: `Today is ${tithi} (${paksha} paksha) under ${nakshatra} nakshatra. Your Prakriti-Tithi biorhythm score is ${biorhythm.score}/100.`
  };
}

/**
 * Get 30-day Kala Chakra forecast
 * @param {Array} panchangArray - Array of 30 panchang objects
 * @param {string} userDosha
 * @returns {Array} 30-day forecast
 */
function getMonthAheadForecast(panchangArray, userDosha) {
  return panchangArray.map(p => {
    const biorhythm = computeBiorhythmScore(p.tithi, p.paksha, p.nakshatra, p.vara, userDosha);
    return {
      date: p.date,
      tithi: p.tithi,
      score: biorhythm.score,
      phase: biorhythm.tithiPhase,
      alignment: biorhythm.alignment
    };
  });
}

module.exports = {
  TITHI_DOSHA_MAP,
  NAKSHATRA_GUNA_MAP,
  computeBiorhythmScore,
  getDailyKalaChakraReport,
  getMonthAheadForecast
};
