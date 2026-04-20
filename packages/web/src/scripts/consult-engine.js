/**feat(phase3): implement diagnostic logic for AI Coach (consult-engine.js)ctrl+/**
 * AyurConsultEngine - Basic diagnostic logic for AyurTime AI Coach
 * Phase 3 Initialization
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      symptoms: ['dry', 'cold', 'pain', 'anxiety', 'constipation', 'cracking'],ctrl+/**
 * AyurConsultEngine - Advanced Diagnostic & Diet Mapping
 * Phase 3 Core Implementation
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      subDoshas: {
        prana: { symptoms: ['headache', 'breathless', 'hiccups'], guidance: 'Focus on calming the nervous system with Brahmi oil.' },
        vyana: { symptoms: ['circulation', 'tremor', 'fainting'], guidance: 'Improve circulation with warm sesame oil massage.' }
      },
      mapping: [
        { keywords: ['dry', 'skin', 'constipation'], rec: 'Warm cooked root vegetables, sesame seeds, and ghee.' },
        { keywords: ['anxiety', 'insomnia', 'fear'], rec: 'Ashwagandha tea, grounding yoga, and regular sleep routine.' },
        { keywords: ['joint', 'cracking', 'pain'], rec: 'Turmeric-ginger tea and Mahanarayan oil application.' }
      ],
      general: 'Vata imbalance detected. Favor: Sweet, sour, and salty tastes. Avoid: Bitter, pungent, and astringent.'
    },
    pitta: {
      subDoshas: {
        pachaka: { symptoms: ['indigestion', 'heartburn', 'thirst'], guidance: 'Focus on digestive cooling with Fennel and Mint.' },
        ranjaka: { symptoms: ['liver', 'skin inflammation', 'bile'], guidance: 'Support liver health with Aloe Vera and Neem.' }
      },
      mapping: [
        { keywords: ['acidity', 'burning', 'ulcer'], rec: 'Coconut water, cilantro, and cooling cucumber mung dal.' },
        { keywords: ['anger', 'irritability', 'rash'], rec: 'Rose petal jam (Gulkand) and meditation in moonlight.' },
        { keywords: ['fever', 'inflammation', 'eyes'], rec: 'Amla juice and ghee-based preparations.' }
      ],
      general: 'Pitta aggravation detected. Favor: Sweet, bitter, and astringent tastes. Avoid: Pungent, sour, and salty.'
    },
    kapha: {
      subDoshas: {
        kledaka: { symptoms: ['mucus', 'heaviness after eating'], guidance: 'Stimulate Agni with Trikatu (Ginger, Black Pepper, Long Pepper).' },
        avalambaka: { symptoms: ['congestion', 'laziness', 'chest'], guidance: 'Clear respiratory passages with Holy Basil (Tulsi).' }
      },
      mapping: [
        { keywords: ['heavy', 'lethargic', 'weight'], rec: 'Intermittent fasting, ginger tea, and stimulating spices like chili.' },
        { keywords: ['congestion', 'cough', 'mucus'], rec: 'Honey with cinnamon and warm barley water.' },
        { keywords: ['oily', 'clogged', 'stagnant'], rec: 'Triphala at night and vigorous aerobic exercise.' }
      ],
      general: 'Kapha accumulation detected. Favor: Pungent, bitter, and astringent tastes. Avoid: Sweet, sour, and salty.'
    }
  },

  process: function(input) {
    const text = input.toLowerCase();
    let response = "";
    let matched = false;

    // Iterate through doshas
    for (const [dosha, data] of Object.entries(this.knowledgeBase)) {
      // Check sub-doshas first
      for (const [sub, subData] of Object.entries(data.subDoshas)) {
        if (subData.symptoms.some(s => text.includes(s))) {
          response += `Diagnosis: ${sub.charAt(0).toUpperCase() + sub.slice(1)} ${dosha.toUpperCase()} imbalance. ${subData.guidance} `;
          matched = true;
        }
      }

      // Check keyword mapping
      for (const entry of data.mapping) {
        if (entry.keywords.some(k => text.includes(k))) {
          response += `${entry.rec} `;
          matched = true;
        }
      }
    }

    if (!matched) {
      return `I understand you're feeling '${input}'. Could you describe your symptoms more specifically? (e.g., 'burning acidity', 'dry skin', or 'chest congestion')`;
    }

    // Add seasonal context (Simple mock for now)
    const month = new Date().getMonth();
    let seasonalHint = "";
    if (month >= 2 && month <= 5) seasonalHint = " Note: During this spring-summer transition, stay hydrated with herbal infusions.";
    
    return response.trim() + seasonalHint;
  }
};

if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
}

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
