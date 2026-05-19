/**
 * Practitioner Model
 * Issue #16 - Community Satsang Hub - Practitioner Directory
 */

const { v4: uuidv4 } = require('uuid');

const SPECIALIZATIONS = [
  'Panchakarma', 'Nadi Vaidya', 'Ayurvedic Nutrition', 'Yoga Therapy',
  'Rasayana', 'Kaya Chikitsa', 'Shalakya Tantra', 'Bala Tantra', 'Graha Chikitsa'
];

const DOSHA_EXPERTISE = ['Vata', 'Pitta', 'Kapha', 'Tridosha'];

/**
 * Mock practitioner directory (5+ entries as per acceptance criteria)
 */
const MOCK_PRACTITIONERS = [
  {
    practitioner_id: 'prac-001',
    name: 'Dr. Ramesh Sharma',
    specialization: ['Panchakarma', 'Kaya Chikitsa'],
    location: { city: 'Pune', state: 'Maharashtra' },
    languages: ['Hindi', 'English', 'Marathi'],
    dosha_expertise: ['Vata', 'Kapha'],
    verified: true,
    contact_email: 'dr.ramesh@ayurtime.in',
    bio: 'Classical Panchakarma specialist with 20+ years of experience.'
  },
  {
    practitioner_id: 'prac-002',
    name: 'Vaidya Sunita Deshpande',
    specialization: ['Nadi Vaidya', 'Rasayana'],
    location: { city: 'Nashik', state: 'Maharashtra' },
    languages: ['Marathi', 'Hindi'],
    dosha_expertise: ['Pitta', 'Tridosha'],
    verified: true,
    contact_email: 'sunita.d@ayurtime.in',
    bio: 'Expert in pulse diagnosis and rejuvenation therapies.'
  },
  {
    practitioner_id: 'prac-003',
    name: 'Dr. Ananya Krishnan',
    specialization: ['Ayurvedic Nutrition', 'Yoga Therapy'],
    location: { city: 'Bangalore', state: 'Karnataka' },
    languages: ['Kannada', 'English', 'Tamil'],
    dosha_expertise: ['Pitta', 'Kapha'],
    verified: true,
    contact_email: 'ananya.k@ayurtime.in',
    bio: 'Integrative Ayurvedic dietitian and yoga therapist.'
  },
  {
    practitioner_id: 'prac-004',
    name: 'Vaidya Arun Tiwari',
    specialization: ['Bala Tantra', 'Kaya Chikitsa'],
    location: { city: 'Varanasi', state: 'Uttar Pradesh' },
    languages: ['Hindi', 'Sanskrit', 'English'],
    dosha_expertise: ['Vata', 'Tridosha'],
    verified: false,
    contact_email: 'arun.t@ayurtime.in',
    bio: 'Specialises in pediatric Ayurveda and general medicine.'
  },
  {
    practitioner_id: 'prac-005',
    name: 'Dr. Meera Nair',
    specialization: ['Shalakya Tantra', 'Panchakarma'],
    location: { city: 'Thrissur', state: 'Kerala' },
    languages: ['Malayalam', 'English', 'Hindi'],
    dosha_expertise: ['Kapha', 'Vata'],
    verified: true,
    contact_email: 'meera.n@ayurtime.in',
    bio: 'Traditional Kerala Panchakarma and ENT specialist.'
  }
];

function createPractitioner({ name, specialization, location, languages, dosha_expertise, contact_email, bio = '' }) {
  if (!name || !specialization || !location || !contact_email) {
    throw new Error('name, specialization, location, and contact_email are required');
  }
  return {
    practitioner_id: uuidv4(),
    name,
    specialization,
    location,
    languages: languages || [],
    dosha_expertise: dosha_expertise || [],
    verified: false,
    contact_email,
    bio,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  createPractitioner,
  MOCK_PRACTITIONERS,
  SPECIALIZATIONS,
  DOSHA_EXPERTISE
};
