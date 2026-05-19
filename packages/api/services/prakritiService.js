/**
 * Prakriti Service - Business logic for Ayurvedic constitution analysis
 * Rule-based analysis with inference abstraction for future AI integration
 */

const { storePrakritiAnalysis, getAnalysisHistory } = require('../storage/prakritiStorage');
const { analyzePrakriti } = require('../inference/prakritiInference');

/**
 * Process Prakriti analysis request
 * @param {Object} analysisData - Contains responses and optional image
 * @returns {Promise<Object>} Analysis result with dosha percentages
 */
async function performPrakritiAnalysis(analysisData) {
  try {
    // Validate input
    if (!analysisData || !analysisData.responses) {
      throw new Error('Invalid analysis data: responses required');
    }

    // Call inference layer (rule-based for now, AI-ready later)
    const result = await analyzePrakriti(analysisData);

    // Store analysis result
    const storedAnalysis = await storePrakritiAnalysis({
      timestamp: new Date().toISOString(),
      input: analysisData,
      result: result,
      method: result.method || 'rule-based'
    });

    return {
      success: true,
      analysisId: storedAnalysis.id,
      result: result
    };
  } catch (error) {
    console.error('Prakriti analysis error:', error);
    throw error;
  }
}

/**
 * Get user's analysis history
 * @param {string} userId - User identifier (optional for MVP)
 * @returns {Promise<Array>} List of past analyses
 */
async function getUserAnalysisHistory(userId = 'default') {
  try {
    return await getAnalysisHistory(userId);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
}

module.exports = {
  performPrakritiAnalysis,
  getUserAnalysisHistory
};
