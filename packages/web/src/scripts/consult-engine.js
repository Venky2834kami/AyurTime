/**#feat(phase3): Advanced Diagnostic & Diet Mapping for AI Coach (consult-engine.js)ctrl+*/
 * AyurConsultEngine - Advanced diagnostic logic for AyurTime AI Coach
 * Phase 3 Core Implementation
 */

const AyurConsultEngine = {
  knowledgeBase: {
    vata: {
      subDoshas: {
        prana: { symptoms: ['headache', 'breathless', 'hiccups', 'anxiety', 'insomnia'], guidance: 'Focus on calming the nervous system with Brahmi oil, pranayama, and meditation.' },
        vyana: { symptoms: ['circulation', 'tremor', 'fainting', 'palpitation', 'cold extremities'], guidance: 'Improve circulation with warm sesame oil massage and cardio exercise.' },
        samana: { symptoms: ['gas', 'bloating', 'slow digestion', 'weak appetite'], guidance: 'Enhance digestive fire with cumin, ginger tea, and warm cooked meals.' },
        udana: { symptoms: ['hoarseness', 'dry cough', 'throat pain', 'speech issues'], guidance: 'Soothe throat with licorice tea and warm honey-ghee mixture.' },
        apana: { symptoms: ['constipation', 'menstrual', 'urinary', 'pelvic pain'], guidance: 'Support elimination with triphala, castor oil, and hydration.' }
      },
      mapping: [
        { keywords: ['dry', 'skin', 'constipation', 'cracking'], rec: 'Warm cooked root vegetables, sesame seeds, ghee. Spices: Ginger, Cinnamon, Cardamom. Oils: Sesame, Almond.' },
        { keywords: ['anxiety', 'insomnia', 'fear', 'restless'], rec: 'Ashwagandha tea, grounding yoga, Brahmi oil massage. Herbs: Ashwagandha, Brahmi, Jatamansi.' },
        { keywords: ['joint', 'cracking', 'pain', 'stiff'], rec: 'Turmeric-ginger tea and Maharayan oil application. Anti-inflammatory: Boswellia, Guggul.' },
        { keywords: ['gas', 'bloating', 'irregular'], rec: 'Fennel-cumin tea after meals. Digestive: Hingvastak churna, warm water.' }
      ],
      general: 'Vata imbalance detected. Favor: Sweet, sour, and salty tastes. Avoid: Bitter, pungent, and astringent foods.'
    },
    pitta: {
      subDoshas: {
        pachaka: { symptoms: ['indigestion', 'heartburn', 'thirst', 'acid reflux'], guidance: 'Focus on digestive cooling with Fennel and Mint. Avoid spicy and oily foods.' },
        ranjaka: { symptoms: ['liver', 'skin inflammation', 'bile', 'jaundice'], guidance: 'Support liver health with Aloe Vera and Neem. Herbs: Kutki, Bhumyamalaki.' },
        sadhaka: { symptoms: ['anger', 'irritability', 'impatience', 'criticism'], guidance: 'Calm emotions with Brahmi and meditation. Practice forgiveness and compassion.' },
        alochaka: { symptoms: ['eye strain', 'vision', 'red eyes', 'burning eyes'], guidance: 'Cool eyes with rose water and triphala eye wash.' },
        bhrajaka: { symptoms: ['rash', 'acidity', 'burning', 'inflammation'], rec: 'Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily foods.' }
      },
      mapping: [
        { keywords: ['acidity', 'heat', 'burning', 'inflame'], rec: 'These are classic signs of Pitta aggravation. Recommended: Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily foods. Herbs: Shatavari, Amalaki, Yashtimadhu.' },
        { keywords: ['anger', 'irritability', 'impatient', 'critical'], rec: 'Practice stress reduction. Brahmi and Shankhapushpi for mental calm. Meditation daily.' },
        { keywords: ['rash', 'hives', 'skin', 'red'], rec: 'Neem and turmeric paste externally. Internally: Manjistha, cooling diet.' },
        { keywords: ['diarrhea', 'loose', 'frequent'], rec: 'Digestive rest with kitchari, fennel tea, and probiotics.' }
      ],
      general: 'Pitta imbalance detected. Favor: Sweet, bitter, and astringent tastes. Avoid: Pungent, sour, and salty foods.'
    },
    kapha: {
      subDoshas: {
        kledaka: { symptoms: ['heavy', 'lethargic', 'congestion', 'weight', 'sluggish'], guidance: 'You might have an accumulation of Kapha. Recommended: Light, spicy, and warm foods. Incorporate vigorous exercise and dry massage. Avoid dairy, sweet, oily foods.' },
        avalambaka: { symptoms: ['chest congestion', 'cough', 'mucus', 'respiratory'], guidance: 'Clear respiratory passages with steam inhalation and ginger-honey tea.' },
        bodhaka: { symptoms: ['excess saliva', 'taste loss', 'sweet craving'], guidance: 'Reduce sweet intake, use pungent spices.' },
        tarpaka: { symptoms: ['sinus', 'headache', 'dull', 'heaviness'], guidance: 'Nasal cleansing with neti pot and eucalyptus oil.' },
        shleshaka: { symptoms: ['joint', 'swelling', 'stiffness', 'fluid retention'], guidance: 'Warm dry massage with mustard oil and turmeric paste.' }
      },
      mapping: [
        { keywords: ['heavy', 'lethargic', 'congestion', 'weight', 'sweet'], rec: 'Light, spicy, and warm foods. Vigorous exercise and dry massage. Avoid dairy. Spices: Black Pepper, Ginger, Turmeric. Herbs: Trikatu, Punarnava.' },
        { keywords: ['oily', 'acne', 'cyst'], rec: 'Triphala and neem internally. Face: Turmeric-sandalwood mask.' },
        { keywords: ['sinus', 'mucus', 'cold'], rec: 'Steam inhalation, ginger tea, avoid dairy and cold foods.' },
        { keywords: ['depression', 'attachment', 'greed'], rec: 'Uplifting activities, brahmi, and daily exercise. Reduce sedentary habits.' }
      ],
      general: 'Kapha imbalance detected. Favor: Pungent, bitter, and astringent tastes. Avoid: Sweet, sour, and salty foods.'
    },
    seasonal: {
      spring: { months: [2, 3, 4], guidance: 'Spring (Vasanta): Kapha season - focus on light, bitter foods. Detox with warm lemon water. Avoid heavy, oily foods.' },
      summer: { months: [5, 6, 7], guidance: 'Summer (Grishma): Pitta season - stay hydrated with herbal infusions. Cooling foods recommended. Note: During this spring-summer transition, stay hydrated with herbal infusions.' },
      monsoon: { months: [8, 9], guidance: 'Monsoon (Varsha): All doshas can be aggravated - boost digestion with ginger tea. Avoid raw foods.' },
      autumn: { months: [10, 11], guidance: 'Autumn (Sharad): Pitta management - favor sweet, bitter tastes. Avoid sour and fermented.' },
      winter: { months: [0, 1, 12], guidance: 'Winter (Hemanta/Shishira): Vata season - warming foods, healthy fats. Sesame oil massage.' }
    }
  },

  process: function(input) {
    const text = input.toLowerCase();
    let response = '';
    let matched = false;

    // Check for specific symptoms
    if (text.includes('dry') || text.includes('anxiety') || text.includes('gas')) {
      return this.knowledgeBase.vata.guidance;
    }

    if (text.includes('acidity') || text.includes('heat') || text.includes('burning')) {
      return this.knowledgeBase.pitta.guidance;
    }

    if (text.includes('heavy') || text.includes('weight') || text.includes('congestion')) {
      return this.knowledgeBase.kapha.guidance;
    }

    // Check sub-doshas first
    for (const [doshaName, doshaData] of Object.entries(this.knowledgeBase)) {
      if (doshaData.subDoshas) {
        for (const [subName, subData] of Object.entries(doshaData.subDoshas)) {
          if (subData.symptoms.some(s => text.includes(s))) {
            response += `Diagnosis: \${subName.charAt(0).toUpperCase() + subName.slice(1)} \${doshaName.charAt(0).toUpperCase() + doshaName.slice(1)} imbalance. \${subData.guidance} `;
            matched = true;
          }
        }
      }
    }

    // Check keyword mapping
    for (const [doshaName, doshaData] of Object.entries(this.knowledgeBase)) {
      if (doshaData.mapping) {
        for (const entry of doshaData.mapping) {
          if (entry.keywords.some(k => text.includes(k))) {
            response += `\${entry.rec} `;
            matched = true;
          }
        }
      }
    }

    if (!matched) {
      return "I understand you're feeling \${input}'. Could you describe your symptoms more specifically? (e.g., 'burning acidity', 'dry skin', or 'chest congestion')";
    }

    // Add seasonal context (Simple mock for now)
    const month = new Date().getMonth();
    let seasonalHint = '';
    if (month >= 2 && month <= 5) seasonalHint = " Note: During this spring-summer transition, stay hydrated with herbal infusions.";
    
    return response.trim() + seasonalHint;
  }
};

if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
}
