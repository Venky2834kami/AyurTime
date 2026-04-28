/**
 * Panini-Style Sanskrit Engine Service - AyurTime API
 * v1: Analyzes single unsandhied Ayurvedic nouns and returns morphological + semantic tags
 * Based on Ashtadhyayi-inspired rule-based morphological analysis
 */

const AYURVEDIC_LEXICON = {
  // DOSHA
  vāta: { category: 'DOSHA', meaning: 'air/wind principle', english: 'Vata' },
  pitta: { category: 'DOSHA', meaning: 'fire principle', english: 'Pitta' },
  kapha: { category: 'DOSHA', meaning: 'water/earth principle', english: 'Kapha' },
  
  // DHATU (tissues)
  rasa: { category: 'DHATU', meaning: 'plasma/lymph', english: 'Rasa' },
  rakta: { category: 'DHATU', meaning: 'blood', english: 'Rakta' },
  māṁsa: { category: 'DHATU', meaning: 'muscle', english: 'Mamsa' },
  meda: { category: 'DHATU', meaning: 'fat/adipose', english: 'Meda' },
  asthi: { category: 'DHATU', meaning: 'bone', english: 'Asthi' },
  majjā: { category: 'DHATU', meaning: 'marrow/nerve', english: 'Majja' },
  śukra: { category: 'DHATU', meaning: 'reproductive', english: 'Shukra' },
  
  // MALA (wastes)
  mūtra: { category: 'MALA', meaning: 'urine', english: 'Mutra' },
  purīṣa: { category: 'MALA', meaning: 'feces', english: 'Purisha' },
  sveda: { category: 'MALA', meaning: 'sweat', english: 'Sveda' },
  
  // AGNI
  agni: { category: 'AGNI', meaning: 'digestive fire', english: 'Agni' },
  
  // DRAVYA (substances/herbs - sample)
  ghṛta: { category: 'DRAVYA', meaning: 'ghee', english: 'Ghrita' },
  takra: { category: 'DRAVYA', meaning: 'buttermilk', english: 'Takra' },
  madhu: { category: 'DRAVYA', meaning: 'honey', english: 'Madhu' }
    
  // DRAVYA - Herbs & Medicinal Substances (Expanded)
  tulasī: { category: 'DRAVYA', meaning: 'holy basil', english: 'Tulasi' },
  aśvagandhā: { category: 'DRAVYA', meaning: 'winter cherry/adaptogen', english: 'Ashwagandha' },
  guḍūcī: { category: 'DRAVYA', meaning: 'heart-leaved moonseed', english: 'Guduchi' },
  bhūmyāmalakī: { category: 'DRAVYA', meaning: 'stone breaker herb', english: 'Bhumyamalaki' },
  śaṭāvarī: { category: 'DRAVYA', meaning: 'asparagus/female tonic', english: 'Shatavari' },
  brahmi: { category: 'DRAVYA', meaning: 'water hyssop/brain tonic', english: 'Brahmi' },
  ārdraka: { category: 'DRAVYA', meaning: 'fresh ginger', english: 'Ardraka' },
  śuṇṭhī: { category: 'DRAVYA', meaning: 'dry ginger', english: 'Shunthi' },
  maricā: { category: 'DRAVYA', meaning: 'black pepper', english: 'Marica' },
  pippalī: { category: 'DRAVYA', meaning: 'long pepper', english: 'Pippali' },
  harītakī: { category: 'DRAVYA', meaning: 'chebulic myrobalan', english: 'Haritaki' },
  āmalakī: { category: 'DRAVYA', meaning: 'Indian gooseberry', english: 'Amalaki' },
  vibhītakī: { category: 'DRAVYA', meaning: 'belleric myrobalan', english: 'Vibhitaki' },
  triphalā: { category: 'DRAVYA', meaning: 'three fruits (haritaki+amalaki+vibhitaki)', english: 'Triphala' },
  nīm: { category: 'DRAVYA', meaning: 'neem/blood purifier', english: 'Neem' },
  haldi: { category: 'DRAVYA', meaning: 'turmeric/anti-inflammatory', english: 'Haldi' },
  elā: { category: 'DRAVYA', meaning: 'cardamom', english: 'Ela' },
  dālcīnī: { category: 'DRAVYA', meaning: 'cinnamon', english: 'Dalchini' },
  laśuna: { category: 'DRAVYA', meaning: 'garlic', english: 'Lashuna' },
  
  // ROGA - Diseases & Disorders
  jvara: { category: 'ROGA', meaning: 'fever', english: 'Jvara' },
  kāsa: { category: 'ROGA', meaning: 'cough', english: 'Kasa' },
  śvāsa: { category: 'ROGA', meaning: 'asthma/breathlessness', english: 'Shvasa' },
  raktapitta: { category: 'ROGA', meaning: 'bleeding disorders', english: 'Raktapitta' },
  prameha: { category: 'ROGA', meaning: 'urinary disorders/diabetes', english: 'Prameha' },
  madhumeha: { category: 'ROGA', meaning: 'diabetes mellitus', english: 'Madhumeha' },
  atisāra: { category: 'ROGA', meaning: 'diarrhea', english: 'Atisara' },
  grahaṇī: { category: 'ROGA', meaning: 'IBS/malabsorption', english: 'Grahani' },
  arśas: { category: 'ROGA', meaning: 'hemorrhoids/piles', english: 'Arshas' },
  gulma: { category: 'ROGA', meaning: 'abdominal tumor/mass', english: 'Gulma' },
  udara: { category: 'ROGA', meaning: 'abdominal distension/ascites', english: 'Udara' },
  pāṇḍu: { category: 'ROGA', meaning: 'anemia', english: 'Pandu' },
  kāmala: { category: 'ROGA', meaning: 'jaundice', english: 'Kamala' },
  śūla: { category: 'ROGA', meaning: 'pain/colic', english: 'Shula' },
  viśūcikā: { category: 'ROGA', meaning: 'cholera/acute gastroenteritis', english: 'Vishuchika' },
  
  // KRIYA - Actions & Therapeutic Properties
  dīpana: { category: 'KRIYA', meaning: 'digestive stimulant', english: 'Dipana' },
  pācana: { category: 'KRIYA', meaning: 'digestive/carminative', english: 'Pachana' },
  grāhī: { category: 'KRIYA', meaning: 'absorbent/binding', english: 'Grahi' },
  śodhana: { category: 'KRIYA', meaning: 'purification/cleansing', english: 'Shodhana' },
  śamana: { category: 'KRIYA', meaning: 'pacification/palliation', english: 'Shamana' },
  rasāyana: { category: 'KRIYA', meaning: 'rejuvenation/tonic', english: 'Rasayana' },
  vājīkaraṇa: { category: 'KRIYA', meaning: 'aphrodisiac/virility', english: 'Vajikarana' },
  vamana: { category: 'KRIYA', meaning: 'therapeutic vomiting', english: 'Vamana' },
  virecana: { category: 'KRIYA', meaning: 'therapeutic purgation', english: 'Virechana' },
  basti: { category: 'KRIYA', meaning: 'therapeutic enema', english: 'Basti' },
  nasya: { category: 'KRIYA', meaning: 'nasal therapy', english: 'Nasya' },
  raktamokṣaṇa: { category: 'KRIYA', meaning: 'bloodletting', english: 'Raktamokshana' },
  
  // GUNA - Properties & Qualities
  guru: { category: 'GUNA', meaning: 'heavy', english: 'Guru' },
  laghu: { category: 'GUNA', meaning: 'light', english: 'Laghu' },
  snigdha: { category: 'GUNA', meaning: 'unctuous/oily', english: 'Snigdha' },
  rūkṣa: { category: 'GUNA', meaning: 'dry/rough', english: 'Ruksha' },
  śīta: { category: 'GUNA', meaning: 'cold', english: 'Sheeta' },
  uṣṇa: { category: 'GUNA', meaning: 'hot', english: 'Ushna' },
  manda: { category: 'GUNA', meaning: 'slow/dull', english: 'Manda' },
  tīkṣṇa: { category: 'GUNA', meaning: 'sharp/penetrating', english: 'Tikshna' },
  sthira: { category: 'GUNA', meaning: 'stable/static', english: 'Sthira' },
  cala: { category: 'GUNA', meaning: 'mobile', english: 'Chala' },
  
  // RASA - Tastes
  madhura: { category: 'RASA', meaning: 'sweet taste', english: 'Madhura' },
  amla: { category: 'RASA', meaning: 'sour taste', english: 'Amla' },
  lavaṇa: { category: 'RASA', meaning: 'salty taste', english: 'Lavana' },
  kaṭu: { category: 'RASA', meaning: 'pungent taste', english: 'Katu' },
  tikta: { category: 'RASA', meaning: 'bitter taste', english: 'Tikta' },
  kaṣāya: { category: 'RASA', meaning: 'astringent taste', english: 'Kashaya' },
  
  // SYMPTOMS & CONDITIONS
  kabdha: { category: 'SYMPTOM', meaning: 'constipation', english: 'Kabdha' },
  udvārta: { category: 'SYMPTOM', meaning: 'upward bloating', english: 'Udvarta' },
  ānāha: { category: 'SYMPTOM', meaning: 'flatulence/gas retention', english: 'Anaha' },
  adhmāna: { category: 'SYMPTOM', meaning: 'abdominal distension', english: 'Adhmana' },
  hṛdroga: { category: 'SYMPTOM', meaning: 'heart disease', english: 'Hridroga' },
  śiras: { category: 'SYMPTOM', meaning: 'headache', english: 'Shiras' },
  mūrcchā: { category: 'SYMPTOM', meaning: 'fainting/unconsciousness', english: 'Murchha' }
};

/**
 * Declension patterns for Sanskrit nouns (simplified Paninian model)
 * Real implementation would have full sup-pratyaya (case endings) tables
 */
const DECLENSION_PATTERNS = {
  // Masculine a-stem (vāta, pitta, etc.)
  masculine_a: {
    nom_sg: 'aḥ', acc_sg: 'am', ins_sg: 'ena',
    dat_sg: 'āya', abl_sg: 'āt', gen_sg: 'asya', loc_sg: 'e',
    nom_pl: 'āḥ', acc_pl: 'ān', ins_pl: 'aiḥ'
  },
  // Masculine i-stem (agni)
  masculine_i: {
    nom_sg: 'iḥ', acc_sg: 'im', ins_sg: 'inā',
    nom_pl: 'ayaḥ'
  },
  // Neuter a-stem (dhātu words often neuter)
  neuter_a: {
    nom_sg: 'am', acc_sg: 'am', ins_sg: 'ena'
  }
};

/**
 * Analyze a single Sanskrit word token
 * @param {string} word - Single unsandhied Sanskrit word (IAST or Devanagari)
 * @returns {object} Analysis result with lemma, case, number, gender, semantic tag
 */
function analyzeToken(word) {
  const normalizedWord = word.toLowerCase().trim();
  
  // Try to find lemma in lexicon
  let lemma = null;
  let lexiconEntry = null;
  
  // Direct lookup
  if (AYURVEDIC_LEXICON[normalizedWord]) {
    lemma = normalizedWord;
    lexiconEntry = AYURVEDIC_LEXICON[normalizedWord];
  } else {
    // Try stripping common endings to find stem
    for (const [stem, entry] of Object.entries(AYURVEDIC_LEXICON)) {
      if (normalizedWord.startsWith(stem)) {
        lemma = stem;
        lexiconEntry = entry;
        break;
      }
    }
  }
  
  if (!lexiconEntry) {
    return {
      form: word,
      lemma: null,
      pos: 'unknown',
      case: null,
      number: null,
      gender: null,
      semanticTag: null,
      analysis: 'not_in_lexicon'
    };
  }
  
  // Morphological analysis (simplified - v1 only handles unsandhied forms)
  const analysis = identifyMorphology(normalizedWord, lemma);
  
  return {
    form: word,
    lemma: lemma,
    pos: 'noun',
    case: analysis.case,
    number: analysis.number,
    gender: analysis.gender,
    semanticTag: lexiconEntry.category,
    meaning: lexiconEntry.meaning,
    english: lexiconEntry.english,
    analysis: 'success'
  };
}

/**
 * Identify morphological features (case, number, gender)
 * v1: Simple pattern matching based on endings
 * @param {string} word - Full word form
 * @param {string} stem - Identified lemma/stem
 * @returns {object} {case, number, gender}
 */
function identifyMorphology(word, stem) {
  const ending = word.slice(stem.length);
  
  // Default: assume nominative singular if no clear ending
  if (!ending || ending === 'ḥ' || ending === 'aḥ') {
    return { case: 'nominative', number: 'singular', gender: 'masculine' };
  }
  
  // Check common patterns
  if (ending === 'am') return { case: 'accusative', number: 'singular', gender: 'masculine' };
  if (ending === 'ena') return { case: 'instrumental', number: 'singular', gender: 'masculine' };
  if (ending === 'āya') return { case: 'dative', number: 'singular', gender: 'masculine' };
  if (ending === 'āt') return { case: 'ablative', number: 'singular', gender: 'masculine' };
  if (ending === 'asya') return { case: 'genitive', number: 'singular', gender: 'masculine' };
  if (ending === 'e') return { case: 'locative', number: 'singular', gender: 'masculine' };
  if (ending === 'āḥ') return { case: 'nominative', number: 'plural', gender: 'masculine' };
  
  // Default fallback
  return { case: 'nominative', number: 'singular', gender: 'masculine' };
}

/**
 * Analyze a full Sanskrit text/verse
 * v1: Assumes words are space-separated (no sandhi splitting yet)
 * @param {string} text - Sanskrit text (multiple words)
 * @returns {object} {tokens: [], explanation: string}
 */
function analyzeText(text) {
  if (!text || typeof text !== 'string') {
    return { tokens: [], explanation: 'Invalid input text', error: true };
  }
  
  const words = text.trim().split(/\s+/);
  const tokens = words.map(word => analyzeToken(word));
  
  // Generate explanation
  const recognized = tokens.filter(t => t.analysis === 'success').length;
  const total = tokens.length;
  
  return {
    tokens,
    statistics: {
      total_words: total,
      recognized_words: recognized,
      ayurvedic_terms: tokens.filter(t => t.semanticTag).length
    },
    explanation: `Analyzed ${total} words, recognized ${recognized} Ayurvedic terms using Paninian morphology v1.`
  };
}

module.exports = {
  analyzeToken,
  analyzeText,
  AYURVEDIC_LEXICON
};
