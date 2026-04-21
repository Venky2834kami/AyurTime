/**
 * Prakriti Inference Layer - Rule-based Ayurvedic constitution analysis
 * Abstraction layer: Can be replaced with AI model in future
 */

/**
 * Rule-based Prakriti analysis
 * @param {Object} data - Analysis input (responses, optional image)
 * @returns {Promise<Object>} Analysis result with dosha percentages
 */
async function analyzePrakriti(data) {
  try {
    const { responses, image } = data;
    
    // Initialize dosha scores
    let vata = 0;
    let pitta = 0;
    let kapha = 0;
    
    // Simple rule-based scoring (MVP implementation)
    // In future, this can be replaced with ML model
    
    if (responses) {
      // Example scoring logic based on common Prakriti indicators
      // This is a simplified version - full implementation would have
      // comprehensive question-to-dosha mappings
      
      Object.entries(responses).forEach(([question, answer]) => {
        // Basic pattern matching for demo purposes
        const answerLower = String(answer).toLowerCase();
        
        // Vata indicators: dry, light, cold, irregular, quick
        if (answerLower.includes('dry') || answerLower.includes('thin') || 
            answerLower.includes('quick') || answerLower.includes('irregular')) {
          vata += 1;
        }
        
        // Pitta indicators: hot, sharp, oily, medium
        if (answerLower.includes('hot') || answerLower.includes('sharp') || 
            answerLower.includes('oily') || answerLower.includes('medium')) {
          pitta += 1;
        }
        
        // Kapha indicators: heavy, slow, steady, cool, smooth
        if (answerLower.includes('heavy') || answerLower.includes('slow') || 
            answerLower.includes('steady') || answerLower.includes('large')) {
          kapha += 1;
        }
      });
    }
    
    // Ensure we have some base values
    if (vata === 0 && pitta === 0 && kapha === 0) {
      // Default balanced constitution for demo
      vata = 1;
      pitta = 1;
      kapha = 1;
    }
    
    // Calculate total and percentages
    const total = vata + pitta + kapha;
    const vataPercent = Math.round((vata / total) * 100);
    const pittaPercent = Math.round((pitta / total) * 100);
    const kaphaPercent = Math.round((kapha / total) * 100);
    
    // Determine dominant dosha(s)
    const doshas = [
      { name: 'Vata', score: vataPercent },
      { name: 'Pitta', score: pittaPercent },
      { name: 'Kapha', score: kaphaPercent }
    ];
    
    doshas.sort((a, b) => b.score - a.score);
    
    let prakritiType = doshas[0].name;
    if (Math.abs(doshas[0].score - doshas[1].score) < 10) {
      prakritiType = `${doshas[0].name}-${doshas[1].name}`;
    }
    
    return {
      success: true,
      method: 'rule-based',
      prakritiType: prakritiType,
      doshaPercentages: {
        vata: vataPercent,
        pitta: pittaPercent,
        kapha: kaphaPercent
      },
      dominantDosha: doshas[0].name,
      characteristics: getDoshaCharacteristics(doshas[0].name),
      recommendations: getDoshaRecommendations(doshas[0].name)
    };
  } catch (error) {
    console.error('Inference error:', error);
    throw new Error('Failed to analyze Prakriti: ' + error.message);
  }
}

/**
 * Get characteristics for a dosha
 * @param {string} dosha - Dosha name
 * @returns {Array} Characteristics
 */
function getDoshaCharacteristics(dosha) {
  const characteristics = {
    'Vata': [
      'Light, thin body frame',
      'Quick, creative mind',
      'Dry skin and hair',
      'Variable appetite and digestion',
      'Tendency towards anxiety and worry'
    ],
    'Pitta': [
      'Medium body frame',
      'Sharp intellect and focus',
      'Warm body temperature',
      'Strong appetite and digestion',
      'Tendency towards irritability'
    ],
    'Kapha': [
      'Heavy, sturdy body frame',
      'Calm, steady mind',
      'Smooth, oily skin',
      'Slow but strong digestion',
      'Tendency towards attachment'
    ]
  };
  
  return characteristics[dosha] || [];
}

/**
 * Get recommendations for a dosha
 * @param {string} dosha - Dosha name
 * @returns {Object} Recommendations
 */
function getDoshaRecommendations(dosha) {
  const recommendations = {
    'Vata': {
      diet: ['Warm, cooked foods', 'Sweet, sour, salty tastes', 'Avoid raw, cold foods'],
      lifestyle: ['Regular routine', 'Adequate rest', 'Gentle exercise', 'Stay warm'],
      herbs: ['Ashwagandha', 'Brahmi', 'Triphala']
    },
    'Pitta': {
      diet: ['Cool, refreshing foods', 'Sweet, bitter, astringent tastes', 'Avoid spicy, fried foods'],
      lifestyle: ['Moderate exercise', 'Avoid excess heat', 'Practice patience'],
      herbs: ['Neem', 'Aloe vera', 'Coriander']
    },
    'Kapha': {
      diet: ['Light, warm foods', 'Pungent, bitter, astringent tastes', 'Avoid heavy, oily foods'],
      lifestyle: ['Regular vigorous exercise', 'Stay active', 'Avoid oversleeping'],
      herbs: ['Trikatu', 'Guggulu', 'Turmeric']
    }
  };
  
  return recommendations[dosha] || {};
}

module.exports = {
  analyzePrakriti
};
