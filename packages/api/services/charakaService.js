/**
 * Charaka Samhita Service - AyurTime API
 * Provides access to Charaka verses from charaka-samhita.json
 * Handles verse lookup, search by keyword/lemma, and chapter navigation
 */

const fs = require('fs');
const path = require('path');

// Load Charaka data from packages/web/src/data (shared resource)
const CHARAKA_DATA_PATH = path.join(__dirname, '..', '..', '..', 'web', 'src', 'data', 'charaka-samhita.json');

let charakaData = null;

/**
 * Load Charaka Samhita JSON on startup
 */
function loadCharakaData() {
  try {
    const rawData = fs.readFileSync(CHARAKA_DATA_PATH, 'utf8');
    charakaData = JSON.parse(rawData);
    console.log(`[CharakaService] Loaded ${charakaData.chapters ? charakaData.chapters.length : 0} chapters from Charaka Samhita`);
    return charakaData;
  } catch (error) {
    console.error('[CharakaService] Error loading Charaka data:', error.message);
    charakaData = { meta: {}, chapters: [] };
    return charakaData;
  }
}

/**
 * Get verse by ID (e.g., "cs_sutra_1" from charaka-samhita.json structure)
 * @param {string} verseId - Chapter ID or verse identifier
 * @returns {object|null} Verse/chapter object or null
 */
function getVerseById(verseId) {
  if (!charakaData) loadCharakaData();
  
  // Search through chapters array
  const chapter = charakaData.chapters.find(ch => ch.id === verseId);
  if (chapter) return chapter;
  
  return null;
}

/**
 * Get chapter by sthana and number
 * @param {string} sthana - e.g., "Sutrasthana"
 * @param {number} chapterNum - Chapter number
 * @returns {object|null} Chapter object
 */
function getChapter(sthana, chapterNum) {
  if (!charakaData) loadCharakaData();
  
  const chapter = charakaData.chapters.find(ch => 
    ch.sthana === sthana && ch.chapter_number === chapterNum
  );
  
  return chapter || null;
}

/**
 * Search verses by keyword/lemma (searches in summary, tags, key_concepts)
 * @param {object} params - {lemma, keyword, dosha, tag}
 * @returns {array} Array of matching chapters/verses
 */
function searchVerses(params) {
  if (!charakaData) loadCharakaData();
  
  const { lemma, keyword, dosha, tag } = params;
  let results = [];
  
  charakaData.chapters.forEach(chapter => {
    let matches = false;
    
    // Match by lemma (normalized Sanskrit term)
    if (lemma && chapter.key_concepts) {
      const normalized = lemma.toLowerCase();
      matches = chapter.key_concepts.some(kc => 
        kc.toLowerCase().includes(normalized)
      );
    }
    
    // Match by keyword in summary or chapter name
    if (keyword) {
      const kw = keyword.toLowerCase();
      matches = matches || 
        (chapter.summary && chapter.summary.toLowerCase().includes(kw)) ||
        (chapter.chapter_name && chapter.chapter_name.toLowerCase().includes(kw));
    }
    
    // Match by dosha tag
    if (dosha && chapter.tags) {
      matches = matches || chapter.tags.some(t => t.toLowerCase() === dosha.toLowerCase());
    }
    
    // Match by generic tag
    if (tag && chapter.tags) {
      matches = matches || chapter.tags.includes(tag);
    }
    
    if (matches) {
      results.push({
        id: chapter.id,
        sthana: chapter.sthana,
        chapter_number: chapter.chapter_number,
        chapter_name: chapter.chapter_name,
        summary: chapter.summary,
        tags: chapter.tags,
        reference: chapter.reference,
        relevance: 'matched_query'
      });
    }
  });
  
  return results;
}

/**
 * Get all chapters (for listing/navigation)
 * @returns {array} All chapters with minimal metadata
 */
function getAllChapters() {
  if (!charakaData) loadCharakaData();
  
  return charakaData.chapters.map(ch => ({
    id: ch.id,
    sthana: ch.sthana,
    chapter_number: ch.chapter_number,
    chapter_name: ch.chapter_name,
    tags: ch.tags
  }));
}

module.exports = {
  loadCharakaData,
  getVerseById,
  getChapter,
  searchVerses,
  getAllChapters
};
