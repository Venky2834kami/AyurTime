/**#feat(phase3+): Panini-style Rule Engine for AyurTime AI Coach (consult-engine.js)ctrl+l*/
/**
 * AyurConsultEngine - Auto-mode diagnostic engine with Charaka-rules integration
 * Implements Aṣṭādhyāyī-inspired ordered rule application
 * Phase 3 Core Implementation
 */

const AyurConsultEngine = {
  // Original knowledge base (preserved for backward compatibility)
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
        ranjaka: { symptoms: ['liver', 'skin inflammation', 'bile', 'jaundice'], guidance: 'Support liver health with Aloe Vera and Neem. Herbs: Kutki, Bhuniyamalaki.' },
        sadhaka: { symptoms: ['anger', 'irritability', 'impatience', 'criticism'], guidance: 'Calm emotions with Brahmi and meditation. Practice forgiveness and compassion.' },
        alochaka: { symptoms: ['eye strain', 'vision', 'red eyes', 'burning eyes'], guidance: 'Cool eyes with rose water and triphala eye wash.' },
        bhrajaka: { symptoms: ['rash', 'acidity', 'burning', 'inflammation'], rec: 'Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily foods.' }
      },
      mapping: [
        { keywords: ['acidity', 'heat', 'burning', 'inflame'], rec: 'These are classic signs of Pitta aggravation. Recommended: Cooling foods (cucumber, coconut water), ghee, and meditation. Avoid spicy, oily foods.' },
        { keywords: ['anger', 'irritability', 'impatient', 'critical'], rec: 'Practice stress reduction. Brahmi and Shankhapushpi for mental calm. Meditation daily.' },
        { keywords: ['rash', 'hives', 'skin', 'red'], rec: 'Neem and turmeric paste externally. Internally: Manjistha, cooling diet.' },
        { keywords: ['diarrhea', 'loose', 'frequent'], rec: 'Digestive rest with kitchari, fennel tea, and probiotics.' }
      ],
      general: 'Pitta imbalance detected. Favor: Sweet, bitter, and astringent tastes. Avoid: Pungent, sour, and salty foods.'
    },
    kapha: {
      subDoshas: {
        kledaka: { symptoms: ['heavy', 'lethargic', 'congestion', 'weight', 'sluggish'], guidance: 'You might have an accumulation of Kapha. Recommended: Light, spicy, and warm foods. Exercise and dry massage. Avoid dairy, sweet, heavy foods.' },
        avalambaka: { symptoms: ['chest congestion', 'cough', 'mucus', 'respiratory'], guidance: 'Clear respiratory passages with steam inhalation and ginger-honey tea.' },
        bodhaka: { symptoms: ['taste', 'sweet cravings', 'salivation'], guidance: 'Balance bodhaka with bitter and astringent tastes. Avoid excessive sweets.' },
        tarpaka: { symptoms: ['sinus', 'nasal', 'heaviness'], guidance: 'Nasya oil treatment and eucalyptus steam.' },
        shleshaka: { symptoms: ['joint swelling', 'stiffness', 'fluid retention'], guidance: 'Light exercise and warm ginger compresses.' }
      },
      mapping: [
        { keywords: ['heavy', 'weight', 'gain', 'lethargy'], rec: 'Increase physical activity. Eat light, warm, and spicy foods. Reduce dairy and sweet foods.' },
        { keywords: ['congestion', 'mucus', 'cough', 'respiratory'], rec: 'Steam inhalation with eucalyptus. Ginger-honey tea. Avoid cold and heavy foods.' },
        { keywords: ['sinus', 'nasal', 'allergies'], rec: 'Nasya oil therapy, neti pot, and turmeric milk. Herbs: Tulsi, Trikatu.' }
      ],
      general: 'Kapha imbalance detected. Favor: Pungent, bitter, and astringent tastes. Avoid: Sweet, sour, and salty foods.'
    },
    seasonal: {
      spring: { symptoms: ['kapha'], rec: 'Light and dry foods. Increase exercise and avoid heavy dairy.' },
      summer: { symptoms: ['pitta'], rec: 'Cooling foods and herbs. Avoid spicy and sour foods.' },
      fall: { symptoms: ['vata'], rec: 'Warm and grounding foods. Oil massage and routine.' },
      winter: { symptoms: ['kapha'], rec: 'Warm spices and light foods. Stay active.' }
    }
  },

  // NEW: Charaka-rules integration (auto-mode)
  charakaRules: null,
  
  // Load Charaka rules (called once on init)
  async loadCharakaRules() {
    try {
      const response = await fetch('../data/charaka-rules.json');
      const data = await response.json();
      this.charakaRules = data.rules || [];
      console.log(`✅ Loaded ${this.charakaRules.length} Charaka rules`);
    } catch (err) {
      console.warn('⚠️ Could not load charaka-rules.json, falling back to legacy mode:', err);
      this.charakaRules = [];
    }
  },

  // NEW: Auto-mode dosha detection from text
  detectDosha(text) {
    const lower = text.toLowerCase();
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    
    // Vata keywords
    const vataKeywords = ['gas', 'bloating', 'anxiety', 'dry', 'constipation', 'insomnia', 'restless', 'tremor', 'cracking', 'joint pain'];
    vataKeywords.forEach(kw => { if (lower.includes(kw)) scores.vata++; });
    
    // Pitta keywords
    const pittaKeywords = ['acidity', 'heat', 'burning', 'heartburn', 'anger', 'irritability', 'rash', 'inflammation', 'red eyes'];
    pittaKeywords.forEach(kw => { if (lower.includes(kw)) scores.pitta++; });
    
    // Kapha keywords
    const kaphaKeywords = ['heavy', 'weight', 'gain', 'congestion', 'mucus', 'sluggish', 'lethargic', 'sleepy', 'cough'];
    kaphaKeywords.forEach(kw => { if (lower.includes(kw)) scores.kapha++; });
    
    // Return dominant dosha
    let maxScore = Math.max(scores.vata, scores.pitta, scores.kapha);
    if (maxScore === 0) return null;
    if (scores.vata === maxScore) return 'vata';
    if (scores.pitta === maxScore) return 'pitta';
    if (scores.kapha === maxScore) return 'kapha';
  },

  // NEW: Apply Charaka rules in priority order
  applyCharakaRules(input, detectedDosha) {
    if (!this.charakaRules || this.charakaRules.length === 0) return [];
    
    const lower = input.toLowerCase();
    const matchedRules = [];
    
    for (const rule of this.charakaRules) {
      const cond = rule.conditions;
      let match = false;
      
      // Check keyword match
      if (cond.keywords && cond.keywords.some(kw => lower.includes(kw))) {
        match = true;
      }
      
      // Check prakriti match (if detected dosha is in prakriti list)
      if (cond.prakriti_includes && detectedDosha && cond.prakriti_includes.includes(detectedDosha)) {
        match = true;
      }
      
      // Future: check BMI, sleep hours, etc. when user state is available
      
      if (match) {
        matchedRules.push(rule);
      }
    }
    
    // Sort by priority (higher first)
    matchedRules.sort((a, b) => b.priority - a.priority);
    
    return matchedRules;
  },

  // NEW: Main process method (auto-mode enabled)
  process: function(input, userState = {}) {
    const text = input.toLowerCase();
    
    // 1. Detect dosha from input
    const detectedDosha = this.detectDosha(text);
    
    // 2. Apply Charaka rules
    const firedRules = this.applyCharakaRules(input, detectedDosha);
    
    // 3. Build structured response
    let summary = '';
    let recommendations = [];
    
    if (firedRules.length > 0) {
      // Use top rule
      const topRule = firedRules[0];
      summary = topRule.advice.summary;
      recommendations = topRule.advice.lifestyle_changes || [];
    } else {
      // Fallback to legacy simple dosha-based response
      if (text.includes('dry') || text.includes('anxiety') || text.includes('gas')) {
        summary = this.knowledgeBase.vata.general;
      } else if (text.includes('acidity') || text.includes('heat') || text.includes('burning')) {
        summary = this.knowledgeBase.pitta.general;
      } else if (text.includes('heavy') || text.includes('weight') || text.includes('congestion')) {
        summary = this.knowledgeBase.kapha.general;
      } else {
        summary = `I understand you're feeling "${input}". Could you describe your symptoms more specifically (e.g., gas, acidity, heaviness)?`;
      }
    }
    
    // 4. Add seasonal hint
    const month = new Date().getMonth();
    let seasonalHint = '';
    if (month >= 2 && month <= 5) {

          // ===== Phase 3.5: Charaka + Sanskrit API Integration =====
    // Optional: Enrich response with Charaka verses if backend is available
    // Uncomment when API server is running:
    /*
    try {
      const apiBaseUrl = 'http://localhost:3001'; // Update based on deployment
      const charakaResults = await fetch(`${apiBaseUrl}/api/charaka/search?dosha=${detectedDosha.dominant}`);
      if (charakaResults.ok) {
        const charakaData = await charakaResults.json();
        result.classicalSources = charakaData.results.slice(0, 3); // Top 3 relevant verses
      }
    } catch (err) {
      // Backend not running, skip classical sources enrichment
      console.log('[AyurConsult] Backend API unavailable, skipping Charaka enrichment');
    }
    */
      seasonalHint = ' Note: During this spring-summer transition, stay hydrated with herbal infusions.';
    } else if (month >= 9 && month <= 11) {
      seasonalHint = ' Note: In fall-winter, focus on warmth and grounding.';
    }
    
    // 5. Return structured object
    return {
      summary: summary.trim() + seasonalHint,
      detectedDosha: detectedDosha,
      firedRules: firedRules.map(r => ({
        id: r.id,
        source: r.source_text,
        priority: r.priority
      })),
      recommendations: recommendations,
      rawInput: input
    };
  }
};

// Auto-load Charaka rules on page load
if (typeof window !== 'undefined') {
  window.AyurConsultEngine = AyurConsultEngine;
  AyurConsultEngine.loadCharakaRules().catch(err => console.warn('Rule loading failed:', err));
}
