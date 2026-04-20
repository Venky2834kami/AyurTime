/**feat(phase3): implement diagnostic logic for AI Coach (consult-engine.js)ctrl+/**
 * AyurConsultEngine - Basic diagnostic logic for AyurTime AI Coach
 * Phase 3 Initialization
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      symptoms: ['dry', 'cold', 'pain', 'anxiety', 'constipation', 'cracking'],
      guidance: 'Your symptoms suggest a Vata imbalance. Recommended: Warm, cooked meals, sesame oil massage (Abhyanga), and grounding routines. Avoid raw foods and cold drinks.'
    },
    pitta: {
      symptoms: ['acidity', 'heat', 'burning', 'inflscripts/consult-engine.jsammation', 'anger', 'rash'],
      guidance: 'These are classic signs of Pitta aggravation. Recommended: Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily, and fermented foods.'
    },
    kapha: {
      symptoms: ['heavy', 'lethargic', 'congestion', 'weight', 'sweet', 'oily'],
      guidance: 'You might have an accumulation of Kapha. Recommended: Light, spicy, and warm foods. Incorporate vigorous exercise and dry massage. Avoid dairy and heavy, oily meals.'
    }
  },

  process: function(input) {
    const text = input.toLowerCase();
    
    // Check for specific symptoms
    if (text.includes('dry') || text.includes('anxiety') || text.includes('gas')) {
      return this.knowledgeBase.vata.guidance;
    }
    
    if (text.includes('acidity') || text.includes('heat') || text.includes('burning')) {
      return this.knowledgeBase.pitta.guidance;
    }
    
    if (text.includes('heavy') || text.includes('congestion') || text.includes('mucus')) {
      return this.knowledgeBase.kapha.guidance;
    }

    // Default response if no specific pattern matched
    return "I understand you are experiencing '" + input + "'. To give you the best guidance, could you tell me more about your digestion, sleep, or current energy levels? (Try mentioning symptoms like 'acidity', 'dry skin', or 'heaviness')";
  }
};

if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
}
ctrl+/**
 * AyurConsultEngine - Basic diagnostic logic for AyurTime AI Coach
 * Phase 3 Initialization
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      symptoms: ['dry', 'cold', 'pain', 'anxiety', 'constipation', 'cracking'],
      guidance: 'Your symptoms suggest a Vata imbalance. Recommended: Warm, cooked meals, sesame oil massage (Abhyanga), and grounding routines. Avoid raw foods and cold drinks.'
    },
    pitta: {
      symptoms: ['acidity', 'heat', 'burning', 'inflammation', 'anger', 'rash'],
      guidance: 'These are classic signs of Pitta aggravation. Recommended: Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily, and fermented foods.'
    },
    kapha: {
      symptoms: ['heavy', 'lethargic', 'congestion', 'weight', 'sweet', 'oily'],
      guidance: 'You might have an accumulation of Kapha. Recommended: Light, spicy, and warm foods. Incorporate vigorous exercise and dry massage. Avoid dairy and heavy, oily meals.'
    }
  },

  process: function(input) {
    const text = input.toLowerCase();
    
    // Check for specific symptoms
    if (text.includes('dry') || text.includes('anxiety') || text.includes('gas')) {
      return this.knowledgeBase.vata.guidance;
    }
    
    if (text.includes('acidity') || text.includes('heat') || text.includes('burning')) {
      return this.knowledgeBase.pitta.guidance;
    }
    
    if (text.includes('heavy') || text.includes('congestion') || text.includes('mucus')) {
      return this.knowledgeBase.kapha.guidance;
    }

    // Default response if no specific pattern matched
    return "I understand you are experiencing '" + input + "'. To give you the best guidance, could you tell me more about your digestion, sleep, or current energy levels? (Try mentioning symptoms like 'acidity', 'dry skin', or 'heaviness')";
  }
};

if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
}

 * AyurConsultEngine - Basic diagnostic logic for AyurTime AI Coach
 * Phase 3 Initialization
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      symptoms: ['dry', 'cold', 'pain', 'anxiety', 'constipation', 'cracking'],
      guidance: 'Your symptoms suggest a Vata imbalance. Recommended: Warm, cooked meals, sesame oil massage (Abhyanga), and grounding routines. Avoid raw foods and cold drinks.'
    },
    pitta: {
      symptoms: ['acidity', 'heat', 'burning', 'inflammation', 'anger', 'rash'],
      guidance: 'These are classic signs of Pitta aggravation. Recommended: Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily, and fermented foods.'
    },
    kapha: {
      symptoms: ['heavy', 'lethargic', 'congestion', 'weight', 'sweet', 'oily'],
      guidance: 'You might have an accumulation of Kapha. Recommended: Light, spicy, and warm foods. Incorporate vigorous exercise and dry massage. Avoid dairy and heavy, oily meals.'
    }
  },

  process: function(input) {
    const text = input.toLowerCase();
    
    // Check for specific symptoms
    if (text.includes('dry') || text.includes('anxiety') || text.includes('gas')) {
      return this.knowledgeBase.vata.guidance;
    }
    
    if (text.includes('acidity') || text.includes('heat') || text.includes('burning')) {
      return this.knowledgeBase.pitta.guidance;
    }
    
    if (text.includes('heavy') || text.includes('congestion') || text.includes('mucus')) {
      return this.knowledgeBase.kapha.guidance;
    }

    // Default response if no specific pattern matched
    return "I understand you are experiencing '" + input + "'. To give you the best guidance, could you tell me more about your digestion, sleep, or current energy levels? (Try mentioning symptoms like 'acidity', 'dry skin', or 'heaviness')";
  }
};

// Ensure it is globally accessible for the script in consult.html
if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
}
