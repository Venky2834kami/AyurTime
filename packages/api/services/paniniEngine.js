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
