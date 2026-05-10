# Changelog

All notable changes to AyurTime are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

---

## [Unreleased] - Phase 3 In Progress

### In Progress
- Prakriti AI Analyzer: image-based tongue/nail/face dosha assessment
- Community Satsang Hub: discussion boards and practitioner directory
- Panchakarma Prep & Tracking: detox checklists and day-wise protocols

---
---

## [v1.1.0-dev] - 2026-04-25
### Added
- Minimal User model and `/api/users` endpoints for creating and fetching users.
- Assessment and Recommendation models representing Prakriti questionnaire submissions and personalised outputs.
- `/api/assessments` endpoint that scores doshas via a pure doshaScoring service and returns structured recommendations.
- `/api/recommendations` endpoints for fetching recommendations by ID and by user.
- Dedicated dosha scoring service with unit-testable, pure scoring logic.
- New Jest unit tests for dosha scoring and API integration tests for the assessment workflow.
- `test:unit` npm script to run only dosha scoring and assessment workflow tests.

## [v1.0.0-mvp] - 2026-04-22

### Added
- Phase 5: Frontend-Backend Integration for Prakriti Analyzer (PR #23)
- Phase 4: Backend API & Persistence Layer for Prakriti AI Analyzer (PR #20)
- Phase 6: Integration hardening and production-ready Prakriti experience (PR #25, #27)
- config.js environment-aware configuration module (Issue #24, #26)
- Comprehensive API integration with error handling
- v1.0 MVP production deployment checklist (DEPLOYMENT.md)
- Comprehensive development roadmap (ROADMAP.md)
- TEST_PLAN.md for MVP validation

### Phase 2 Foundations (2026-04-09 to 2026-04-10)
- Hindu Vrat Calendar with multi-year data (2025-2026)
- Persistent Observance Logging (ayurtime_vrat_logs)
- Real-time adherence analytics and streak tracking
- Restructured Charaka Samhita knowledge base (15 Chapters)
- Dinacharya routine templates (Vata, Pitta, Kapha)
- Advanced diagnostic logic with sub-doshas

### Phase 1 Foundations (2026-04-09)
- Initial repository setup with README and .gitignore
- High-fidelity responsive CSS framework (main.css)
- Dosha Assessment logic (dosha-scoring.js)
- Onboarding and Health Coaching UI components
- src/app.js main application JavaScript
- Architecture documentation and technical specifications
- CONTRIBUTING.md and pull request template
- Label onboarding system
- LICENSE (MIT)

---

## Format Guide
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
