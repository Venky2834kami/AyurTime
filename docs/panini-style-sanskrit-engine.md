# Panini-Style Sanskrit Engine

## Overview

v1 of the AyurTime Panini-style Sanskrit engine will analyze single, unsandhied Ayurvedic nouns (vata, pitta, kapha, rasa, rakta etc.) and return lemma, case, number, gender, and an Ayurvedic semantic tag (DOSHA, DHATU, and others).

## Purpose

This engine is the foundational NLP module for AyurTime that enables Sanskrit-aware analysis of classical Ayurvedic terminology. It bridges Panini's grammatical framework (Ashtadhyayi) with modern AI-based health coaching.

## Scope (v1)

- Input: Single, unsandhied Ayurvedic noun in transliteration
- Output: lemma, grammatical case (vibhakti), number (vacana), gender (linga), Ayurvedic semantic tag
- Semantic tags: DOSHA, DHATU, DRAVYA, RASA, GUNA, KARMA, SROTAS

## Planned Integration

- `packages/api/` — expose as `/api/sanskrit/analyze` endpoint
- `packages/web/src/scripts/` — consume in the TKDL consultation engine
- `packages/web/src/data/` — seed the knowledge base with tagged entries

## References

- Panini's Ashtadhyayi (Classical Sanskrit Grammar)
- Charaka Samhita (AyurTime knowledge base)
- TKDL (Traditional Knowledge Digital Library) schema

---
_Moved from root `Panini Style Sanskrit Engine.txt` into docs/ for proper integration._
