# AyurTime — Development Roadmap

> **v1.0 MVP Status: ✅ 100% COMPLETE** (as of 2026-04-23)

---

## 🏁 v1.0 MVP — COMPLETED

### Milestone Summary

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Core UI & Onboarding | ✅ Complete |
| Phase 2 | Dosha Quiz & Scoring | ✅ Complete |
| Phase 3 | Data Persistence & Profiles | ✅ Complete |
| Phase 4 | Backend API Foundation | ✅ Complete |
| Phase 5 | Frontend-Backend Integration | ✅ Complete |
| Phase 6 | Integration Hardening | ✅ Complete (PR #25) |
| Phase 7 | API Integration & Error Handling | ✅ Complete (PR #27) |
| Phase 8 | Backend API Hardening | ✅ Complete (PR #28) |
| Phase 9 | Frontend API Integration & Testing | ✅ Complete (PR #29) |

### v1.0 MVP Features Delivered

- ✅ Prakriti (Dosha) Quiz — 8-question self-assessment
- ✅ Backend API: `POST /api/prakriti/analyze` with validation, rate limiting, security headers
- ✅ Dosha scoring engine (Vata / Pitta / Kapha) with rule-based analysis
- ✅ Personalized recommendations: Diet, Lifestyle, Herbs per dominant dosha
- ✅ Analysis persistence (JSON file store, schema-defined, DB-migration ready)
- ✅ `GET /health` endpoint with ISO8601 timestamp
- ✅ Frontend-Backend integration (fetch API, loading/error states, results rendering)
- ✅ analysisId stored in localStorage for session continuity
- ✅ Security: Helmet.js headers, CORS, rate limiting (10 req/min)
- ✅ Logging: Morgan access logs (file + console)
- ✅ Complete test plan with E2E, cross-browser, performance benchmarks

---

## 🚀 Phase 2 Roadmap — May–June 2026

### Goals
- User authentication (JWT)
- Vrat & Hindu calendar integration
- Dinacharya (daily routine) tracker
- Push notifications for morning/evening routines
- Dashboard with progress analytics

### Target Issues
- Issue #16 — Community Satsang Hub
- Issue #17 — Panchakarma Prep & Tracking

---

## 🧠 Phase 3 Roadmap — July–August 2026

### Goals
- Prakriti AI Analyzer — Image-based (tongue, nail, face) via MobileNetV2
- Vedic Bio-Hacking — Longitudinal health trend analytics
- Internationalization — Sanskrit/Hindi language support
- Ayur Watch — Wearable/smartwatch companion app

### Target Issues
- Issue #14 — Phase 3 Roadmap
- Issue #15 — Prakriti AI Analyzer

---

## 📅 Timeline Overview

```
Q1 2026 (Jan-Mar): Foundation & MVP Architecture
Q2 2026 (Apr):     v1.0 MVP ✅ COMPLETE
Q2 2026 (May-Jun): Phase 2 — Auth, Tracking, Calendar
Q3 2026 (Jul-Aug): Phase 3 — AI, Community, Wearable
Q4 2026:           v2.0 — Production Launch & Scale
```
