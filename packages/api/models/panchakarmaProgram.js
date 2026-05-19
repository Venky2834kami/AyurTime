/**
 * Panchakarma Program Model
 * Issue #17 - Panchakarma Prep & Tracking
 * Based on classical Charaka Samhita Panchakarma protocols
 *
 * DISCLAIMER: For educational/lifestyle guidance only.
 * Not a substitute for professional Ayurvedic medical advice.
 */

const { v4: uuidv4 } = require('uuid');

const PROCEDURES = ['Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana'];
const PRAKRITI_PROCEDURE_MAP = {
  Vata: ['Basti', 'Nasya'],
  Pitta: ['Virechana', 'Raktamokshana'],
  Kapha: ['Vamana', 'Nasya'],
  Tridosha: ['Virechana', 'Basti']
};

const DURATION_OPTIONS = [7, 14, 21];

// Day-wise protocol templates per procedure
const PROTOCOL_TEMPLATES = {
  Virechana: {
    purvakarma_days: 3,
    procedure_days: 1,
    paschatkarma_days: 3,
    daily_tasks: {
      morning: ['Snehapana (medicated ghee)', 'Abhyanga (oil massage)', 'Warm water intake'],
      afternoon: ['Light diet - rice porridge (Peya)', 'Rest', 'Herb decoction'],
      evening: ['Meditation / Pranayama', 'Symptom journal', 'Swedana (steam bath if prescribed)']
    },
    pathya: ['Peya (rice gruel)', 'Mung dal soup', 'Warm water', 'Rock salt', 'Ginger tea'],
    apathya: ['Raw vegetables', 'Cold drinks', 'Heavy oily food', 'Curd', 'Night vigil']
  },
  Basti: {
    purvakarma_days: 3,
    procedure_days: 8,
    paschatkarma_days: 3,
    daily_tasks: {
      morning: ['Abhyanga', 'Niruha Basti (decoction enema)', 'Light breakfast'],
      afternoon: ['Anuvasana Basti (oil enema) alternate days', 'Rest', 'Light diet'],
      evening: ['Symptom journal', 'Triphala decoction', 'Pranayama']
    },
    pathya: ['Rice, moong dal', 'Warm soups', 'Sesame oil', 'Rock salt', 'Ginger'],
    apathya: ['Cold food', 'Excessive activity', 'Fasting', 'Windy environment']
  },
  Vamana: {
    purvakarma_days: 3,
    procedure_days: 1,
    paschatkarma_days: 3,
    daily_tasks: {
      morning: ['Snehana (internal oleation)', 'Madanaphala preparation', 'Vamana procedure'],
      afternoon: ['Rest', 'Dhumapana (herbal smoking if prescribed)', 'Clear liquid diet'],
      evening: ['Symptom journal', 'Warm ginger water', 'Meditation']
    },
    pathya: ['Thin rice gruel', 'Warm water', 'Rock salt', 'Ginger'],
    apathya: ['Solid food day 1', 'Cold water', 'Physical exertion', 'Emotional stress']
  },
  Nasya: {
    purvakarma_days: 1,
    procedure_days: 7,
    paschatkarma_days: 1,
    daily_tasks: {
      morning: ['Abhyanga (face/neck)', 'Swedana (face steam)', 'Nasya drops administration'],
      afternoon: ['Kavala (oil pulling)', 'Light diet', 'Avoid cold air'],
      evening: ['Symptom journal', 'Pranayama (Nadi Shodhana)', 'Warm sesame oil gargle']
    },
    pathya: ['Warm light food', 'Sesame oil', 'Ginger', 'Turmeric milk'],
    apathya: ['Cold food/drinks', 'Dusty environments', 'Swimming', 'Excessive talking']
  },
  Raktamokshana: {
    purvakarma_days: 2,
    procedure_days: 1,
    paschatkarma_days: 2,
    daily_tasks: {
      morning: ['Snehana', 'Specific herb preparation', 'Raktamokshana procedure'],
      afternoon: ['Rest', 'Cool/light diet', 'Coconut water'],
      evening: ['Symptom journal', 'Cooling herbs tea (Guduchi, Nimba)', 'Gentle walk']
    },
    pathya: ['Bitter vegetables', 'Cooling foods', 'Pomegranate juice', 'Coriander water'],
    apathya: ['Pungent/sour/salty foods', 'Alcohol', 'Direct sunlight', 'Heavy exercise']
  }
};

/**
 * Create a new Panchakarma program
 */
function createProgram({ user_id, procedure, duration_days, start_date, prakriti }) {
  if (!user_id || !procedure) throw new Error('user_id and procedure are required');
  if (!PROCEDURES.includes(procedure)) throw new Error(`procedure must be one of: ${PROCEDURES.join(', ')}`);
  if (!DURATION_OPTIONS.includes(duration_days)) throw new Error(`duration_days must be 7, 14, or 21`);

  const template = PROTOCOL_TEMPLATES[procedure];
  const daily_logs = [];

  // Auto-generate day-wise checklist
  for (let day = 1; day <= duration_days; day++) {
    let phase;
    if (day <= template.purvakarma_days) phase = 'Purvakarma (Preparation)';
    else if (day <= template.purvakarma_days + template.procedure_days) phase = 'Pradhanakarma (Main Procedure)';
    else phase = 'Paschatkarma (Recovery)';

    daily_logs.push({
      day,
      phase,
      tasks: { ...template.daily_tasks },
      tasks_completed: [],
      medications: [],
      symptoms: '',
      diet_compliance: false,
      completion_pct: 0
    });
  }

  return {
    program_id: uuidv4(),
    user_id,
    procedure,
    prakriti: prakriti || null,
    duration_days,
    start_date: start_date || new Date().toISOString(),
    daily_logs,
    pathya: template.pathya,
    apathya: template.apathya,
    completion_pct: 0,
    status: 'active',
    created_at: new Date().toISOString()
  };
}

/**
 * Calculate overall completion percentage
 */
function calculateCompletion(program) {
  const totalDays = program.daily_logs.length;
  if (totalDays === 0) return 0;
  const completed = program.daily_logs.filter(d => d.diet_compliance && d.tasks_completed.length > 0).length;
  return Math.round((completed / totalDays) * 100);
}

/**
 * Select recommended procedure based on Prakriti
 */
function recommendProcedure(prakriti) {
  return PRAKRITI_PROCEDURE_MAP[prakriti] || PRAKRITI_PROCEDURE_MAP['Tridosha'];
}

module.exports = {
  createProgram,
  calculateCompletion,
  recommendProcedure,
  PROCEDURES,
  PRAKRITI_PROCEDURE_MAP,
  PROTOCOL_TEMPLATES,
  DURATION_OPTIONS
};
