/**
 * AyurTime — Panchang / Vrat Calendar Routes
 * Phase 2 | Issue #34
 *
 * GET /api/panchang/today      — today's tithi, nakshatra, yoga, karana
 * GET /api/panchang/month      — full month vrat & ekadashi listing
 * GET /api/panchang/vrat-list  — static catalogue of major vratas
 */

const express = require('express');
const router = express.Router();

// ─── Static Vrat Catalogue ───────────────────────────────────────────────────
// Major Hindu vratas with Ayurvedic dietary guidance
const VRAT_CATALOGUE = [
  {
    id: 'ekadashi',
    name: 'Ekadashi',
    description: 'Observed on the 11th day (tithi) of each lunar fortnight. Fasting purifies the digestive system (Agni) and is deeply aligned with lunar rhythms.',
    frequency: 'twice_monthly',
    dosha_benefit: ['vata', 'pitta', 'kapha'],
    diet: 'fruit, milk, sendha namak only — no grains',
    ayurvedic_note: 'Strengthens Ojas; rest the digestive fire on this day.',
  },
  {
    id: 'pradosh',
    name: 'Pradosh Vrat',
    description: 'Observed on the 13th tithi of each fortnight, dedicated to Lord Shiva. Evening fast until moonrise.',
    frequency: 'twice_monthly',
    dosha_benefit: ['vata'],
    diet: 'one meal of sattvic food before sunset',
    ayurvedic_note: 'Promotes calm Vata; beneficial for nervous system health.',
  },
  {
    id: 'purnima',
    name: 'Purnima (Full Moon)',
    description: 'Full moon day fast. Lunar energy is at peak; fasting aids in mental clarity.',
    frequency: 'monthly',
    dosha_benefit: ['pitta'],
    diet: 'light sattvic foods, avoid spicy/sour',
    ayurvedic_note: 'Calms Pitta dosha; avoid heating foods.',
  },
  {
    id: 'amavasya',
    name: 'Amavasya (New Moon)',
    description: 'New moon day. Observed for ancestral offerings (pitru tarpan) and introspection.',
    frequency: 'monthly',
    dosha_benefit: ['kapha'],
    diet: 'light, warm, easily digestible foods',
    ayurvedic_note: 'Stimulates Agni; avoid heavy/cold foods.',
  },
  {
    id: 'monday_fast',
    name: 'Somvar Vrat (Monday Fast)',
    description: 'Weekly fast on Monday dedicated to Shiva. Particularly observed during Shravan month.',
    frequency: 'weekly',
    dosha_benefit: ['vata', 'pitta'],
    diet: 'one meal of sattvic food',
    ayurvedic_note: 'Promotes clarity and mental calm.',
  },
];

// ─── Helper: compute lunar tithi approximation ───────────────────────────────
// Simplified approximation based on synodic month
function getLunarDay(date = new Date()) {
  const SYNODIC_MONTH = 29.53058867;
  // Known new moon reference: 2000-01-06 18:14 UTC
  const referenceNewMoon = new Date('2000-01-06T18:14:00Z');
  const diffMs = date - referenceNewMoon;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cyclePos = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const tithi = Math.floor(cyclePos) + 1; // 1-30
  return { tithi, cyclePos };
}

const TITHIS = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya',
];

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
];

function getPanchangForDate(date) {
  const { tithi, cyclePos } = getLunarDay(date);
  const paksha = cyclePos < 15 ? 'Shukla (Waxing)' : 'Krishna (Waning)';
  const tithiName = TITHIS[Math.min(tithi - 1, 14)];
  // Nakshatra: 27 nakshatras, sidereal approximation
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const nakshatraIndex = Math.floor((dayOfYear * 27) / 365) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  // Determine special day flags
  const isEkadashi = tithi === 11 || tithi === 26;
  const isPurnima = tithi === 15;
  const isAmavasya = tithi === 30;
  const isSomvar = date.getDay() === 1;
  const vratsToday = VRAT_CATALOGUE.filter(v =>
    (v.id === 'ekadashi' && isEkadashi) ||
    (v.id === 'purnima' && isPurnima) ||
    (v.id === 'amavasya' && isAmavasya) ||
    (v.id === 'monday_fast' && isSomvar)
  );
  return {
    date: date.toISOString().split('T')[0],
    tithi,
    tithi_name: tithiName,
    paksha,
    nakshatra,
    vratas: vratsToday.map(v => ({ id: v.id, name: v.name, diet: v.diet })),
    auspicious: vratsToday.length > 0,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/panchang/today
router.get('/today', (req, res) => {
  try {
    const today = new Date();
    const panchang = getPanchangForDate(today);
    res.json({ success: true, data: panchang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/panchang/month?year=YYYY&month=M
router.get('/month', (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      calendar.push(getPanchangForDate(date));
    }
    res.json({ success: true, year, month, data: calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/panchang/vrat-list
router.get('/vrat-list', (req, res) => {
  res.json({ success: true, count: VRAT_CATALOGUE.length, data: VRAT_CATALOGUE });
});

module.exports = router;
