# Ayur-Genomic Integration — Technical Documentation

**Module:** `genomicService` + `genomic` API routes  
**Phase:** v2.0 — Genomic-Prakriti Correlation Engine  
**Status:** In Development  
**Date:** 2026-06-12  

---

## Overview

The Ayur-Genomic Integration module bridges modern genomic science with classical Ayurvedic Prakriti theory. It maps a user's SNP (Single Nucleotide Polymorphism) genetic markers — available from consumer DNA testing services like 23andMe or AncestryDNA — to their Ayurvedic constitutional type (Vata, Pitta, or Kapha).

This is grounded in published **Ayurgenomics** research from the Institute of Genomics and Integrative Biology (IGIB), India, which demonstrated statistically significant correlations between specific genetic variants and Prakriti phenotypes.

---

## Scientific Background

| Research | Finding |
|---|---|
| Prasher et al. (2008), *J Transl Med* | Whole genome expression correlates with extreme Prakriti types |
| Govindaraj et al. (2015), *Sci Rep* | Genome-wide SNP analysis correlates with Ayurveda Prakriti classification |
| Aggarwal et al. (2010), *Ann Hum Biol* | Biochemical markers align with Prakriti types |

---

## SNP-to-Dosha Reference Map

The engine uses a curated set of 12 SNPs across 3 doshas:

### Vata-Associated SNPs
| rsID | Gene | Genotype | Biological Role |
|---|---|---|---|
| rs4680 | COMT | GG | Catecholamine metabolism — nervous system sensitivity |
| rs1800497 | ANKK1 | TT | Dopamine receptor — movement & neurological traits |
| rs6265 | BDNF | AA | Brain-derived neurotrophic factor — cognitive agility |
| rs1042778 | OXTR | TT | Oxytocin receptor — social sensitivity |

### Pitta-Associated SNPs
| rsID | Gene | Genotype | Biological Role |
|---|---|---|---|
| rs1799945 | HFE | GG | Iron metabolism — metabolic intensity |
| rs1800629 | TNF | AA | Inflammatory response — heat & inflammation |
| rs2069705 | IFNG | TT | Interferon-gamma — immune sharpness |
| rs4986790 | TLR4 | AG | Toll-like receptor — inflammatory sensitivity |

### Kapha-Associated SNPs
| rsID | Gene | Genotype | Biological Role |
|---|---|---|---|
| rs9939609 | FTO | AA | Fat mass & obesity gene — anabolic tendency |
| rs1801282 | PPARG | CC | Adipogenesis regulation — tissue building |
| rs659366 | UCP2 | TT | Mitochondrial uncoupling — slow metabolism |
| rs4994 | ADRB3 | CC | Beta-3 adrenergic receptor — lipid accumulation |

---

## API Endpoints

### `POST /api/genomic/analyze`
Submit raw SNP markers and receive Prakriti dosha scores.

**Request Body:**
```json
{
  "snpMarkers": [
    { "rsid": "rs9939609", "genotype": "AA" },
    { "rsid": "rs4680",    "genotype": "GG" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rawScores": { "vata": 1.2, "pitta": 0, "kapha": 1.3 },
    "percentages": { "vata": 48.0, "pitta": 0.0, "kapha": 52.0 },
    "dominantDosha": "kapha",
    "matchedSNPs": [...],
    "confidence": "medium",
    "interpretation": "Your genomic profile shows a predominant Kapha constitution..."
  }
}
```

---

### `GET /api/genomic/snp-map`
Returns the full SNP-to-Dosha reference table used by the engine.

---

### `POST /api/genomic/combined-profile`
Combines a user's quiz-based Prakriti scores with their genomic data for a holistic Prakriti profile.

**Blending Methodology:** `60% Quiz (phenotypic) + 40% Genomic (genotypic)`

**Request Body:**
```json
{
  "quizDoshaScores": { "vata": 40, "pitta": 35, "kapha": 25 },
  "snpMarkers": [
    { "rsid": "rs1800629", "genotype": "AA" }
  ]
}
```

---

## File Structure

```
packages/api/
  routes/
    genomic.js          # Express routes for genomic endpoints
  services/
    genomicService.js   # Core SNP-Prakriti correlation logic
docs/
    genomic-integration.md   # This document
```

---

## Integration with Existing AyurTime Modules

| Module | Integration Point |
|---|---|
| Prakriti Quiz (`prakritiService.js`) | Combined profile endpoint blends quiz + genomic scores |
| Bio-Hacking Analytics (`bio-hacking.js`) | Genomic Prakriti feeds into longitudinal health trend engine |
| Charaka Samhita (`charakaService.js`) | Dosha-specific herbal recommendations powered by genomic profile |
| Ayur Watch (future) | SNP-driven real-time dosha monitoring via wearable |

---

## Privacy & Ethics

- Genetic data is **never stored** on AyurTime servers in raw form.
- All SNP analysis is performed **server-side in-memory** per request.
- Users must explicitly consent before submitting genetic data.
- AyurTime does not share genomic data with third parties.
- Recommendations are for **wellness guidance only** — not medical diagnosis.

---

## Roadmap

- [x] SNP-to-Dosha reference map (12 markers, 3 doshas)
- [x] `POST /api/genomic/analyze` endpoint
- [x] `POST /api/genomic/combined-profile` endpoint
- [ ] Expand SNP map to 50+ markers (Phase 3)
- [ ] Frontend UI: Genomic data upload & profile display
- [ ] Integration with 23andMe / AncestryDNA raw data file parser
- [ ] Ayur Watch wearable genomic profile sync
