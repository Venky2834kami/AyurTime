/**
 * ayur-calendar.js
 * AyurTime - Ayurvedic Calendar & Time Engine
 *
 * Core module: given a date/time and user prakriti, returns:
 *   - Current Dinacharya segment (Brahma Muhurta, Pratah, Madhyahna, etc.)
 *   - Dominant dosha for the time slot
 *   - Current Ritu (season) based on Indian solar calendar
 *   - Dominant dosha for the season
 *   - Personalised note based on user prakriti
 *
 * TODO(ayurvedic-review): Validate muhurta boundary times with Jyotisha expert.
 */

'use strict';

// --- DINACHARYA SEGMENTS ---
// Each entry: startHour, endHour (24h decimal), name, dominant dosha, activity
const DINACHARYA_SEGMENTS = [
  { start: 3.5,  end: 6.0,  name: 'Brahma Muhurta',    sanskrit: 'Brahma Muhurta',  dosha: 'Vata',  emoji: 'sunrise', activity: 'Awaken, meditate, pranayama, self-reflection' },
  { start: 6.0,  end: 8.0,  name: 'Pratah (Morning)',  sanskrit: 'Pratah',          dosha: 'Kapha', emoji: 'morning', activity: 'Yoga, oil pulling, light exercise, light breakfast' },
  { start: 8.0,  end: 10.0, name: 'Purvahna',          sanskrit: 'Purvahna',        dosha: 'Kapha', emoji: 'sun',     activity: 'Active work, learning, creative tasks' },
  { start: 10.0, end: 14.0, name: 'Madhyahna (Midday)',sanskrit: 'Madhyahna',       dosha: 'Pitta', emoji: 'fire',    activity: 'Main meal, analytical work, decision-making' },
  { start: 14.0, end: 16.0, name: 'Aparahna',          sanskrit: 'Aparahna',        dosha: 'Pitta', emoji: 'rain',    activity: 'Moderate activity, avoid heavy meals, short walk' },
  { start: 16.0, end: 18.0, name: 'Sayahna (Evening)', sanskrit: 'Sayahna',         dosha: 'Vata',  emoji: 'sunset',  activity: 'Light snack, short walk, wind down mentally' },
  { start: 18.0, end: 22.0, name: 'Pradosha (Dusk)',   sanskrit: 'Pradosha',        dosha: 'Kapha', emoji: 'moon',    activity: 'Light dinner, family time, spiritual reading' },
  { start: 22.0, end: 24.0, name: 'Ratri (Night)',     sanskrit: 'Ratri',           dosha: 'Pitta', emoji: 'sleep',   activity: 'Sleep; avoid screens, stimulating food or drinks' },
  { start: 0.0,  end: 3.5,  name: 'Nisitha (Deep Night)', sanskrit: 'Nisitha',     dosha: 'Kapha', emoji: 'bed',     activity: 'Deep sleep; body repairs and detoxes' },
];

// --- RITU (SEASONAL) MAPPING ---
// Indian 6 seasons, approximate Gregorian months
const RITU_MAP = [
  { name: 'Shishira', months: [1, 2],   dosha: 'Kapha', description: 'Late winter - Kapha accumulates; favour warm, light foods' },
  { name: 'Vasanta',  months: [3, 4],   dosha: 'Kapha', description: 'Spring - Kapha liquefies; ideal for cleanse, lighter diet' },
  { name: 'Grishma',  months: [5, 6],   dosha: 'Pitta', description: 'Summer - Pitta rises; favour cooling, hydrating foods' },
  { name: 'Varsha',   months: [7, 8],   dosha: 'Vata',  description: 'Monsoon - Vata aggravates; favour warm, oily, grounding foods' },
  { name: 'Sharad',   months: [9, 10],  dosha: 'Pitta', description: 'Autumn - Pitta peaks; favour bitter, sweet, astringent tastes' },
  { name: 'Hemanta',  months: [11, 12], dosha: 'Kapha', description: 'Early winter - Kapha begins; favour warm, nourishing, unctuous foods' },
];

// --- DOSHA METADATA ---
const DOSHA_META = {
  Vata:  { color: '#a78bfa', element: 'Air + Ether', qualities: 'Dry, light, cold, mobile', pacify: 'Warm, oily, grounding foods; avoid raw or cold' },
  Pitta: { color: '#f97316', element: 'Fire + Water', qualities: 'Hot, sharp, light, oily',  pacify: 'Cool, sweet, bitter foods; avoid spicy or sour' },
  Kapha: { color: '#34d399', element: 'Earth + Water', qualities: 'Heavy, slow, cool, oily', pacify: 'Light, warm, dry foods; exercise; avoid sweet or heavy' },
};

// --- HELPERS ---

function toDecimalHour(date) {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function getDinacharyaSegment(h) {
  return DINACHARYA_SEGMENTS.find(s =>
    s.start < s.end ? (h >= s.start && h < s.end) : (h >= s.start || h < s.end)
  ) || DINACHARYA_SEGMENTS[7];
}

function getRitu(month) {
  return RITU_MAP.find(r => r.months.includes(month)) || RITU_MAP[0];
}

function formatHour(d) {
  const h = Math.floor(d % 24);
  const m = Math.round((d - Math.floor(d)) * 60);
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
}

// --- MAIN API ---

/**
 * getAyurTimeState({ date, prakriti, location })
 * Returns the full Ayurvedic time state for the given datetime.
 */
function getAyurTimeState({ date, prakriti, location } = {}) {
  const now = date instanceof Date ? date : new Date();
  const h = toDecimalHour(now);
  const month = now.getMonth() + 1;
  const segment = getDinacharyaSegment(h);
  const ritu = getRitu(month);
  const dm = DOSHA_META[segment.dosha] || {};
  const rm = DOSHA_META[ritu.dosha] || {};

  let personalNote = null;
  if (prakriti) {
    const p = prakriti.charAt(0).toUpperCase() + prakriti.slice(1).toLowerCase();
    personalNote = p === segment.dosha
      ? p + ' prakriti: this is a ' + p + '-dominant time. Tip: ' + dm.pacify
      : 'Time is ' + segment.dosha + '-dominant. As ' + p + ' prakriti this slot is generally balanced for you.';
  }

  return {
    timestamp: now.toISOString(),
    location: location || 'Pune, Maharashtra, IN',
    currentTime: {
      decimal: Math.round(h * 100) / 100,
      formatted: String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0'),
    },
    dinacharyaSegment: {
      name: segment.name,
      sanskrit: segment.sanskrit,
      startTime: formatHour(segment.start),
      endTime: formatHour(segment.end % 24),
      emoji: segment.emoji,
      activity: segment.activity,
      dominantDosha: segment.dosha,
      doshaColor: dm.color,
      doshaElement: dm.element,
      pacifyTip: dm.pacify,
    },
    ritu: {
      name: ritu.name,
      dominantDosha: ritu.dosha,
      description: ritu.description,
      doshaColor: rm.color,
    },
    personalNote,
  };
}

/**
 * getSegmentsForDay()
 * Returns all dinacharya segments for 24-hour clock UI rendering.
 */
function getSegmentsForDay() {
  return DINACHARYA_SEGMENTS.map(s => ({
    name: s.name,
    sanskrit: s.sanskrit,
    startHour: s.start,
    endHour: s.end,
    dosha: s.dosha,
    color: (DOSHA_META[s.dosha] || {}).color || '#888',
    emoji: s.emoji,
    activity: s.activity,
  }));
}

/**
 * getRituForMonth(month)
 * @param {number} month - 1-based
 */
function getRituForMonth(month) {
  return getRitu(month);
}

// --- EXPORTS ---
// Supports CommonJS (Node / API server) and browser (window global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getAyurTimeState, getSegmentsForDay, getRituForMonth, DINACHARYA_SEGMENTS, RITU_MAP, DOSHA_META };
} else if (typeof window !== 'undefined') {
  window.AyurCalendar = { getAyurTimeState, getSegmentsForDay, getRituForMonth, DINACHARYA_SEGMENTS, RITU_MAP, DOSHA_META };
}
