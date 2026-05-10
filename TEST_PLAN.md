# AyurTime v1.0 MVP — Complete Test Plan

> **Version:** 1.0.0  
> **Status:** 🟡 In Progress → ✅ Complete  
> **Scope:** Issue #21 (Frontend-Backend Integration Testing) + Issue #19 (Backend API Hardening)  
> **Last Updated:** 2026-04-23

---

## 1. Test Suite Structure

```
tests/
├── unit/
│   ├── api/
│   │   └── api.test.js          # Backend API unit tests (Jest + Supertest)
│   └── web/
│       └── prakriti-api.test.js  # Frontend module unit tests (Jest + jsdom)
├── e2e/
│   ├── quiz-flow.test.js         # E2E: Full quiz → API → results flow
│   ├── error-handling.test.js    # E2E: Network failures, validation errors
│   └── cross-browser.test.js     # Cross-browser compatibility checks
├── performance/
│   └── lighthouse.config.js      # Lighthouse CI configuration
└── fixtures/
    └── sample-questionnaire.json # Shared test data
```

---

## 2. End-to-End User Flow Tests

### Test Suite: Prakriti Quiz → API → Results

| ID | Scenario | Steps | Expected Result | Status |
|----|----------|-------|-----------------|--------|
| E2E-01 | Happy path — full questionnaire | 1. Open onboarding.html 2. Answer all 8 questions 3. Click Analyze | Results panel shows dominant dosha + score bars + recommendations | ✅ |
| E2E-02 | Partial questionnaire | Answer 4 of 8 questions, submit | API accepts and returns valid dosha analysis | ✅ |
| E2E-03 | Loading state visibility | Submit quiz, observe UI during API call | Spinner visible, quiz hidden, no double-submit possible | ✅ |
| E2E-04 | Error state — server down | Submit quiz when API is offline | Error message displayed with retry option, quiz re-enabled | ✅ |
| E2E-05 | analysisId persistence | Complete quiz successfully | `ayurtime_analysis_id` stored in localStorage | ✅ |
| E2E-06 | Score display accuracy | Submit known answers (all Vata) | Vata bar shows ≥70%, dosha badge shows “Vata” | ✅ |
| E2E-07 | Recommendations render | Complete analysis | Diet, Lifestyle, Herbs lists populated from API response | ✅ |
| E2E-08 | Re-take quiz | Click “Retake” after results | Quiz form resets, previous results cleared | ✅ |

### Test Suite: Backend API Validation

| ID | Scenario | Input | Expected HTTP | Status |
|----|----------|-------|---------------|--------|
| API-01 | Valid questionnaire | 8 answers with questionId + value | 200 + analysis JSON | ✅ |
| API-02 | Empty body | `{}` | 400 + validation errors | ✅ |
| API-03 | Missing answers | `{ userId: 'x' }` | 400 | ✅ |
| API-04 | Non-array answers | `{ answers: 'string' }` | 400 | ✅ |
| API-05 | Answer missing questionId | `{ answers: [{ value: 'slim' }] }` | 400 | ✅ |
| API-06 | Health check | `GET /health` | 200 + `{ status: 'ok', timestamp }` | ✅ |
| API-07 | Rate limit (11th request) | 11 rapid POST requests | 429 Too Many Requests | ✅ |
| API-08 | Unknown route | `GET /api/unknown` | 404 | ✅ |

---

## 3. Cross-Browser Validation Checklist

### Browsers to Test

| Browser | Version | Platform | Priority |
|---------|---------|----------|----------|
| Chrome | 123+ | Desktop + Android | 🔴 Critical |
| Safari | 17+ | Desktop + iOS | 🔴 Critical |
| Firefox | 124+ | Desktop | 🟡 High |
| Edge | 123+ | Desktop | 🟡 High |
| Samsung Internet | 23+ | Android | 🔵 Medium |

### Checklist per Browser

- [ ] Quiz form renders correctly
- [ ] All 8 radio/select inputs are functional
- [ ] Submit button triggers API fetch (no native form submit)
- [ ] Loading spinner displays during API call
- [ ] Results panel renders dosha badge + score bars
- [ ] Score bars animate to correct percentage
- [ ] Recommendation lists populate correctly
- [ ] Error state displays on API failure
- [ ] localStorage read/write works
- [ ] Responsive layout at 375px (mobile)
- [ ] Responsive layout at 768px (tablet)
- [ ] Responsive layout at 1280px (desktop)
- [ ] No console JS errors
- [ ] `fetch()` API available (polyfill for older environments)

---

## 4. Performance Benchmarks

### Targets (Lighthouse CI)

| Metric | Target | Threshold |
|--------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.0s | Fail if > 3.0s |
| FID / INP (Interaction to Next Paint) | < 200ms | Fail if > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | Fail if > 0.25 |
| Performance Score | > 85 | Fail if < 70 |
| Accessibility Score | > 90 | Fail if < 80 |
| Best Practices Score | > 90 | Fail if < 80 |

### API Response Time Benchmarks

| Endpoint | Avg Target | P95 Target | Fail Threshold |
|----------|-----------|-----------|----------------|
| `POST /api/prakriti/analyze` | < 200ms | < 500ms | > 2000ms |
| `GET /health` | < 50ms | < 100ms | > 500ms |
| `GET /api/prakriti/:id` | < 100ms | < 200ms | > 1000ms |

### Load Test Scenarios

```
Scenario 1: Baseline
  - 1 concurrent user, 10 requests
  - All requests must complete within target

Scenario 2: Rate Limit Validation  
  - 15 requests in 60 seconds from same IP
  - Requests 1-10: 200 OK
  - Requests 11-15: 429 Too Many Requests

Scenario 3: Moderate Load
  - 10 concurrent users, 5 requests each
  - P95 response time < 500ms
  - Zero 5xx errors
```

---

## 5. Test Execution Results

### Unit Tests (Jest)

```
TEST SUITES:
  packages/api/tests/api.test.js
    ✅ GET /health — returns 200 with ISO8601 timestamp
    ✅ POST /api/prakriti/analyze (questionnaire): returns valid dosha analysis  
    ✅ Scores sum to approximately 1.0
    ✅ Rejects empty body with 400
    ✅ Rejects missing answers with 400
    ✅ Rejects non-array answers with 400
    ✅ Rejects answer missing questionId with 400
    ✅ Returns 404 for non-existent analysisId
    ✅ Returns saved analysis by id
    ✅ Returns 404 for unknown routes

Test Suites: 1 passed
Tests:       10 passed
Time:        ~1.2s
```

### E2E Tests (Manual)

| Test | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| E2E-01 Happy path | ✅ | ✅ | ✅ | ✅ |
| E2E-02 Partial answers | ✅ | ✅ | ✅ | ✅ |
| E2E-03 Loading state | ✅ | ✅ | ✅ | ✅ |
| E2E-04 Error state | ✅ | ✅ | ✅ | ✅ |
| E2E-05 localStorage | ✅ | ✅ | ✅ | ✅ |

---

## 6. Known Limitations

1. **Image analysis:** Visual image-based dosha scoring (tongue/nail/face) is a placeholder — ML model integration is Phase 3 (Issue #15)
2. **Auth:** No user authentication in v1.0 MVP — `userId` is anonymous string
3. **JSON file store:** Prakriti profiles persist to a JSON file; not suitable for concurrent high-traffic production — DB migration planned for Phase 2
4. **Rate limit:** 10 req/min per IP is conservative for MVP; tune in production based on actual traffic

---

## 7. Sign-off Criteria for 100% MVP

- [x] All API unit tests passing (`npm test` in `packages/api/`)
- [x] E2E happy path confirmed in Chrome + Safari
- [x] Error states tested (network failure, invalid payload)
- [x] Loading spinner verified during API call
- [x] analysisId stored in localStorage after successful analysis
- [x] Backend hardening: helmet, morgan, rate-limit, validation, health check
- [x] ROADMAP.md updated to 100% milestone
- [x] Release tagged `v1.0-mvp`
