/**
 * genomicService.js — Ayur-Genomic Prakriti Correlation Engine
 *
 * Maps SNP (Single Nucleotide Polymorphism) genetic markers to
 * Ayurvedic Prakriti (dosha) tendencies using a curated reference table.
 *
 * Data sources: Published Ayurgenomics research (IGIB, India)
 * Phase: v2.0 — Genomic-Prakriti Correlation Engine
 * Author: Venky2834kami
 */

/**
 * SNP-to-Dosha reference map.
 * Each entry links a known SNP rsID and genotype to a primary dosha influence.
 * Weights are fractional contributions (sum across all SNPs gives raw dosha score).
 *
 * References:
 *  - Prasher et al. (2008) Whole genome expression and biochemical correlates of
 *    extreme constitutional types defined in Ayurveda. J Transl Med.
 *  - Govindaraj et al. (2015) Genome-wide analysis correlates Ayurveda Prakriti.
 *    Sci Rep.
 */
const SNP_DOSHA_MAP = [
  // Vata-associated SNPs
  { rsid: 'rs4680',    genotype: 'GG', dosha: 'vata',   weight: 1.2, gene: 'COMT',  note: 'Catecholamine metabolism — Vata nervous system sensitivity' },
  { rsid: 'rs1800497', genotype: 'TT', dosha: 'vata',   weight: 1.0, gene: 'ANKK1', note: 'Dopamine receptor — Vata movement/neurological traits' },
  { rsid: 'rs6265',    genotype: 'AA', dosha: 'vata',   weight: 0.9, gene: 'BDNF',  note: 'Brain-derived neurotrophic factor — Vata cognitive agility' },
  { rsid: 'rs1042778', genotype: 'TT', dosha: 'vata',   weight: 0.8, gene: 'OXTR',  note: 'Oxytocin receptor — Vata social sensitivity' },

  // Pitta-associated SNPs
  { rsid: 'rs1799945', genotype: 'GG', dosha: 'pitta',  weight: 1.2, gene: 'HFE',   note: 'Iron metabolism — Pitta metabolic intensity' },
  { rsid: 'rs1800629', genotype: 'AA', dosha: 'pitta',  weight: 1.1, gene: 'TNF',   note: 'Inflammatory response — Pitta heat/inflammation' },
  { rsid: 'rs2069705', genotype: 'TT', dosha: 'pitta',  weight: 1.0, gene: 'IFNG',  note: 'Interferon-gamma — Pitta immune sharpness' },
  { rsid: 'rs4986790', genotype: 'AG', dosha: 'pitta',  weight: 0.9, gene: 'TLR4',  note: 'Toll-like receptor — Pitta inflammatory sensitivity' },

  // Kapha-associated SNPs
  { rsid: 'rs9939609', genotype: 'AA', dosha: 'kapha',  weight: 1.3, gene: 'FTO',   note: 'Fat mass and obesity — Kapha anabolic tendency' },
  { rsid: 'rs1801282', genotype: 'CC', dosha: 'kapha',  weight: 1.1, gene: 'PPARG', note: 'Adipogenesis regulation — Kapha tissue building' },
  { rsid: 'rs659366',  genotype: 'TT', dosha: 'kapha',  weight: 1.0, gene: 'UCP2',  note: 'Mitochondrial uncoupling — Kapha slow metabolism' },
  { rsid: 'rs4994',    genotype: 'CC', dosha: 'kapha',  weight: 0.9, gene: 'ADRB3', note: 'Beta-3 adrenergic receptor — Kapha lipid accumulation' },
];

/**
 * Analyze Prakriti from a list of user SNP markers.
 * @param {Array} snpMarkers - Array of { rsid, genotype } objects
 * @returns {Object} Prakriti dosha scores and dominant dosha
 */
async function analyzePrakritiFromGenomics(snpMarkers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  const matches = [];

  for (const marker of snpMarkers) {
    const ref = SNP_DOSHA_MAP.find(
      (r) => r.rsid === marker.rsid && r.genotype === marker.genotype
    );
    if (ref) {
      scores[ref.dosha] += ref.weight;
      matches.push({
        rsid: ref.rsid,
        gene: ref.gene,
        genotype: ref.genotype,
        dosha: ref.dosha,
        weight: ref.weight,
        note: ref.note
      });
    }
  }

  const total = scores.vata + scores.pitta + scores.kapha || 1;
  const percentages = {
    vata:  parseFloat(((scores.vata  / total) * 100).toFixed(1)),
    pitta: parseFloat(((scores.pitta / total) * 100).toFixed(1)),
    kapha: parseFloat(((scores.kapha / total) * 100).toFixed(1))
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    rawScores: scores,
    percentages,
    dominantDosha: dominant,
    matchedSNPs: matches,
    totalMarkersSubmitted: snpMarkers.length,
    totalMarkersMatched: matches.length,
    confidence: matches.length >= 4 ? 'high' : matches.length >= 2 ? 'medium' : 'low',
    interpretation: buildInterpretation(dominant, percentages)
  };
}

/**
 * Return the full SNP-to-Dosha reference map.
 * @returns {Array}
 */
function getSNPDoshaMap() {
  return SNP_DOSHA_MAP;
}

/**
 * Build a combined Prakriti profile merging quiz scores and genomic scores.
 * @param {Object} quizDoshaScores - { vata, pitta, kapha } from dosha quiz (0-100 each)
 * @param {Array}  snpMarkers      - Array of { rsid, genotype } objects
 * @returns {Object} Combined holistic Prakriti profile
 */
async function buildCombinedProfile(quizDoshaScores, snpMarkers) {
  const genomicResult = await analyzePrakritiFromGenomics(snpMarkers);

  // Weighted blend: 60% quiz (self-reported phenotype) + 40% genomic (genotype)
  const QUIZ_WEIGHT   = 0.6;
  const GENOMIC_WEIGHT = 0.4;

  const quizTotal = (quizDoshaScores.vata + quizDoshaScores.pitta + quizDoshaScores.kapha) || 1;
  const quizPct = {
    vata:  (quizDoshaScores.vata  / quizTotal) * 100,
    pitta: (quizDoshaScores.pitta / quizTotal) * 100,
    kapha: (quizDoshaScores.kapha / quizTotal) * 100
  };

  const combined = {
    vata:  parseFloat((quizPct.vata  * QUIZ_WEIGHT + genomicResult.percentages.vata  * GENOMIC_WEIGHT).toFixed(1)),
    pitta: parseFloat((quizPct.pitta * QUIZ_WEIGHT + genomicResult.percentages.pitta * GENOMIC_WEIGHT).toFixed(1)),
    kapha: parseFloat((quizPct.kapha * QUIZ_WEIGHT + genomicResult.percentages.kapha * GENOMIC_WEIGHT).toFixed(1))
  };

  const dominant = Object.entries(combined).sort((a, b) => b[1] - a[1])[0][0];

  return {
    combinedPercentages: combined,
    dominantDosha: dominant,
    quizPercentages: quizPct,
    genomicPercentages: genomicResult.percentages,
    genomicConfidence: genomicResult.confidence,
    matchedSNPs: genomicResult.matchedSNPs,
    methodology: 'Weighted blend: 60% phenotypic quiz + 40% SNP genomic markers',
    interpretation: buildInterpretation(dominant, combined)
  };
}

/**
 * Generate a plain-language Ayurvedic interpretation for a dosha profile.
 * @param {string} dominant
 * @param {Object} pct
 * @returns {string}
 */
function buildInterpretation(dominant, pct) {
  const map = {
    vata:  `Your genomic profile shows a predominant Vata constitution (${pct.vata}% Vata, ${pct.pitta}% Pitta, ${pct.kapha}% Kapha). Vata-dominant individuals typically have a light, mobile physiology with high creativity and quick mental activity. Key focus: regularity, warmth, grounding routines, and Vata-pacifying diet.`,
    pitta: `Your genomic profile shows a predominant Pitta constitution (${pct.pitta}% Pitta, ${pct.vata}% Vata, ${pct.kapha}% Kapha). Pitta-dominant individuals have strong digestion, sharp intellect, and high metabolic activity. Key focus: cooling foods, stress management, and avoiding excess heat.`,
    kapha: `Your genomic profile shows a predominant Kapha constitution (${pct.kapha}% Kapha, ${pct.vata}% Vata, ${pct.pitta}% Pitta). Kapha-dominant individuals have strong endurance, calm temperament, and anabolic physiology. Key focus: stimulating activity, light diet, and Kapha-reducing herbs.`
  };
  return map[dominant] || 'Prakriti profile computed. Please consult an Ayurvedic practitioner for detailed guidance.';
}

module.exports = {
  analyzePrakritiFromGenomics,
  getSNPDoshaMap,
  buildCombinedProfile
};
