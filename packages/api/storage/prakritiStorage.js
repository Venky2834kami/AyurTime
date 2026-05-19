/**
 * Prakriti Storage Layer - JSON-based persistence for MVP
 * Future: Replace with database (MongoDB, PostgreSQL, etc.)
 */

const fs = require('fs').promises;
const path = require('path');

// Storage file path (relative to project root)
const STORAGE_FILE = path.join(__dirname, '../../data/prakriti-analyses.json');

/**
 * Ensure data directory and file exist
 */
async function ensureStorage() {
  try {
    const dataDir = path.dirname(STORAGE_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      await fs.access(STORAGE_FILE);
    } catch {
      // File doesn't exist, create with empty array
      await fs.writeFile(STORAGE_FILE, JSON.stringify([]), 'utf8');
    }
  } catch (error) {
    console.error('Error ensuring storage:', error);
    throw error;
  }
}

/**
 * Read all analyses from storage
 */
async function readStorage() {
  try {
    await ensureStorage();
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading storage:', error);
    return [];
  }
}

/**
 * Write analyses to storage
 */
async function writeStorage(data) {
  try {
    await ensureStorage();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing storage:', error);
    throw error;
  }
}

/**
 * Store a Prakriti analysis result
 * @param {Object} analysis - Analysis data to store
 * @returns {Promise<Object>} Stored analysis with ID
 */
async function storePrakritiAnalysis(analysis) {
  try {
    const analyses = await readStorage();
    
    const newAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...analysis,
      createdAt: new Date().toISOString()
    };
    
    analyses.push(newAnalysis);
    await writeStorage(analyses);
    
    return newAnalysis;
  } catch (error) {
    console.error('Error storing analysis:', error);
    throw error;
  }
}

/**
 * Get analysis history for a user
 * @param {string} userId - User identifier
 * @returns {Promise<Array>} List of analyses
 */
async function getAnalysisHistory(userId = 'default') {
  try {
    const analyses = await readStorage();
    // For MVP, return all analyses. Future: filter by userId
    return analyses.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Get a specific analysis by ID
 * @param {string} analysisId - Analysis identifier
 * @returns {Promise<Object|null>} Analysis or null if not found
 */
async function getAnalysisById(analysisId) {
  try {
    const analyses = await readStorage();
    return analyses.find(a => a.id === analysisId) || null;
  } catch (error) {
    console.error('Error getting analysis:', error);
    return null;
  }
}

module.exports = {
  storePrakritiAnalysis,
  getAnalysisHistory,
  getAnalysisById
};
