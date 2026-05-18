# Technical Specification for AyurTime

**Date**: 2026-04-06

## Introduction
AyurTime is an application that provides users with personalized Ayurvedic health solutions. The application includes features such as consultation booking, health tracking, and educational content about Ayurveda.

## Requirements

### Functional Requirements
- User registration and authentication
- Appointment booking system for consultations
- Health tracking dashboard
- Educational content delivery

### Non-Functional Requirements
- Performance: The application should respond to user requests within 2 seconds.
- Security: All user data must be encrypted.
- Usability: The application should be easy to navigate for users of all ages.

## Architecture Diagrams
- High-level architecture
- Detailed component architecture

## Data Flow
1. User Authentication
2. Data Submission for Health Tracking
3. Retrieval of Consultation Slots

## Implementation Roadmap
- Phase 1: User Authentication (Month 1-2)
- Phase 2: Consultation Booking (Month 3-4)
- Phase 3: Health Tracking Integration (Month 5-6)
- Phase 4: Deployment and User Feedback (Month 7)

---

## TKDL-style Knowledge Schema Extensions

### Overview

AyurTime's knowledge layer now includes TKDL-style metadata fields in all JSON files under `packages/web/src/data/`. These fields are used for ontology alignment, safety classification, and recommendation ranking inside `consult-engine-tkdl.js`. No proprietary TKDL entries are reproduced; all content is open-domain classical knowledge or internally defined rules.

### Metadata fields reference

| Field | Type | Allowed values | Purpose |
|-------|------|---------------|---------|
| `knowledge_source_type` | string | `classical_text`, `internal_rule`, `modern_study`, `reviewed_note` | Source provenance |
| `classical_text_ref` | string\|null | `Charaka Samhita`, `Ashtanga Hridaya`, `Sushruta Samhita` | Open classical source |
| `chapter_ref` | string\|null | `Sutra Sthana 5`, `Nidana Sthana 3` | Chapter locator |
| `verse_ref` | string\|null | `5.1-5`, `3.21` | Verse locator |
| `tkrc_body_system` | string\|null | `digestive`, `respiratory`, `sleep`, `mental_wellbeing`, `skin`, `musculoskeletal`, `daily_routine`, `general` | TKRC-like body system band |
| `tkrc_therapeutic_area` | string\|null | `agni_support`, `nidra_support`, `stress_regulation`, `kapha_management`, `daily_routine_support`, `general_support` | TKRC-like functional area |
| `dosage_form_category` | string\|null | `lifestyle`, `dietary_pattern`, `breathwork`, `movement`, `external_practice`, `practitioner_guided_internal_use` | Intervention type |
| `plant_part_category` | string\|null | `leaf`, `root`, `bark`, `seed`, `fruit`, `whole_plant`, `not_applicable` | Reserved herb taxonomy |
| `dosha_action_profile` | object | `{vata, pitta, kapha}` each `up`\|`down`\|`neutral` | Machine-readable dosha tendency |
| `indication_band` | string\|null | `mild_general`, `routine_support`, `seasonal_balance`, `stress_related`, `non_acute_digestive_discomfort` | Safe use band |
| `safety_band` | string\|null | `low_risk`, `requires_caution`, `practitioner_only`, `do_not_surface_directly` | Risk classification |
| `watch_suitability` | string\|null | `high`, `medium`, `low` | Smartwatch surface suitability |
| `contraindication_flags` | array | `pregnancy`, `child`, `elderly`, `fever`, `severe_pain` | Suppression conditions |
| `escalation_triggers` | array | `chest_pain`, `breathing_difficulty`, `high_fever`, `fainting`, etc. | Red-flag escalation keys |
| `prior_art_reference_type` | string\|null | `classical_text`, `modern_study`, `internal_logic_rule` | IP provenance separation |
| `confidence_level` | string\|null | `high`, `medium`, `low` | Match quality signal |
| `human_review_status` | string\|null | `pending`, `reviewed`, `needs_revision` | Editorial review state |
| `tags` | array | free-form strings | Search and filter labels |

### consult-engine-tkdl.js pipeline

The full pipeline in `packages/web/src/scripts/consult-engine-tkdl.js` runs as follows:

```
1. normalizeInput(userInput)
2. detectRedFlags -> escalation if triggered
3. extractSymptomIds (synonym map + index lookup)
4. scoreDoshas (dosha_action_profile weighting + prakriti boost)
5. mapToTherapeuticBands (tkrc_therapeutic_area frequency map)
6. applySafetyFilter (safety_band + contraindication_flags)
7. rankRecommendations (watch suitability, risk level, band match, confidence, review status)
8. calculateConfidence
9. buildExplanation
10. auditConsult (console log -> Phase 4: backend POST)
11. return structured output
```

### IP and prior-art policy

- All classical formulations and references in AyurTime data files carry `prior_art_reference_type: "classical_text"`.
- Software innovation (pipeline logic, scoring, personalization, UX) is separate and does not claim novelty for classical knowledge.
- TKDL record IDs are never stored, referenced, or surfaced anywhere in the codebase.
