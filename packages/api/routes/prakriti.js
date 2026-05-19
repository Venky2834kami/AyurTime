/**
 * Prakriti Analysis API Routes
 * POST /analyze - Analyze images or questionnaire data
 */

const express = require('express');
const multer = require('multer');
const { analyzePrakriti } = require('../services/prakritiAnalysisService');
const { saveProfile } = require('../storage/prakritiStorage');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

/**
 * POST /api/prakriti/analyze
 * Analyze Prakriti from images and/or questionnaire
 * 
 * Request body:
 * - userId: string (required)
 * - questionnaire: object (optional) - { q1: 'vata', q2: 'pitta', ... }
 * - tongue, nail, face: File (optional via multipart/form-data)
 */
router.post('/analyze', 
  upload.fields([
    { name: 'tongue', maxCount: 1 },
    { name: 'nail', maxCount: 1 },
    { name: 'face', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Extract request data
      const { userId, questionnaire } = req.body;
      const images = req.files || {};

      // Validation
      if (!userId) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'userId is required',
          timestamp: new Date().toISOString()
        });
      }

      // Parse questionnaire if it's a string
      let questionnaireData = questionnaire;
      if (typeof questionnaire === 'string') {
        try {
          questionnaireData = JSON.parse(questionnaire);
        } catch (e) {
          return res.status(400).json({
            error: 'Invalid questionnaire format',
            message: 'Questionnaire must be valid JSON',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check if we have at least questionnaire or images
      const hasImages = images.tongue || images.nail || images.face;
      const hasQuestionnaire = questionnaireData && Object.keys(questionnaireData).length > 0;

      if (!hasImages && !hasQuestionnaire) {
        return res.status(400).json({
          error: 'Insufficient data',
          message: 'Please provide either questionnaire answers or images',
          timestamp: new Date().toISOString()
        });
      }

      // Perform analysis
      console.log(`[Analyze] Processing request for user: ${userId}`);
      const analysis = await analyzePrakriti({
        userId,
        images: {
          tongue: images.tongue?.[0],
          nail: images.nail?.[0],
          face: images.face?.[0]
        },
        questionnaire: questionnaireData
      });

      // Save profile
      await saveProfile(analysis);

      console.log(`[Analyze] Analysis complete for ${userId}: ${analysis.dominantDosha}`);

      // Return response
      res.status(200).json(analysis);

    } catch (error) {
      console.error('[Analyze] Error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get analysis by ID
router.get('/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    // TODO: Implement getProfile from storage
    res.status(501).json({
      message: 'Retrieve analysis endpoint - not yet implemented',
      analysisId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Retrieval failed',
      message: error.message
    });
  }
});

module.exports = router;
