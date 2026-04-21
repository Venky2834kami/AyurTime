# Phase 6: Complete Integration & Harden Prakriti Experience

> **Issue:** [#22](https://github.com/Venky2834kami/AyurTime/issues/22)
> **Branch:** `22-phase-6-complete-integration-harden-prakriti-experience-end-to-end`
> **Status:** In Progress

## Overview

Phase 6 completes the frontend-backend integration (Phase 5 foundation) and hardens the Prakriti analyzer experience with production-ready features.

## Files Changed / Created

### New Files

| File | Purpose |
|------|---------|
| `packages/web/src/config/api.config.js` | Environment-aware API configuration |
| `packages/web/src/pages/history.html` | Analysis history viewer (TBD) |
| `packages/web/tests/integration/prakriti.test.js` | Integration test suite (TBD) |
| `packages/web/.env.example` | Environment variable template (TBD) |
| `docs/PHASE_6_IMPLEMENTATION_GUIDE.md` | This file |

### Modified Files

| File | Changes |
|------|---------|
| `packages/web/src/pages/onboarding.html` | API integration (see below) |
| `README.md` | Dev setup and deployment guide |

---

## 1. API Configuration (`api.config.js`)

### Purpose
Environment-aware configuration that prevents hardcoded localhost usage.

### Usage
```html
<!-- Include before any API calls -->
<script src="../../src/config/api.config.js"></script>

<script>
  // Use in any page
  const url = window.AyurTimeAPI.config.getEndpointUrl('/api/prakriti/analyze');
  // Development: http://localhost:5000/api/prakriti/analyze
  // Production: https://api.ayurtime.com/api/prakriti/analyze
</script>
```

### Environment Detection
- **Development**: `localhost` or `127.0.0.1` -> uses `http://localhost:5000`
- **Production**: Any other hostname -> uses `process.env.API_BASE_URL` or default production URL

---

## 2. Frontend-Backend Integration (onboarding.html)

### Required Changes to `showResults()` function

Change line 273 in onboarding.html from:
```javascript
function showResults() {
    calcResult = DoshaScoring.calculate(answers);
```

To:
```javascript
async function showResults() {
    // === Phase 6: Backend API Integration ===
    const btn = document.getElementById('btnNext');
    btn.disabled = true;
    btn.textContent = 'Analyzing Your Dosha...';
    
    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingState';
    loadingDiv.innerHTML = '<p style="text-align:center;color:#2e7d32">Consulting Ayurvedic wisdom...</p>';
    document.getElementById('screen-quiz').appendChild(loadingDiv);
    
    let apiSuccess = false;
    const retryConfig = window.AyurTimeAPI?.config.getRetryConfig() || { attempts: 1, delay: 2000 };
    
    for (let attempt = 0; attempt <= retryConfig.attempts; attempt++) {
        try {
            const apiUrl = window.AyurTimeAPI?.config.getEndpointUrl('/api/prakriti/analyze')
                        || 'http://localhost:5000/api/prakriti/analyze';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses: answers })
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            
            // Map API response to expected calcResult format
            calcResult = {
                primary: data.result.dominantDosha,
                percentages: {
                    V: data.result.doshaPercentages.vata,
                    P: data.result.doshaPercentages.pitta,
                    K: data.result.doshaPercentages.kapha
                },
                // Additional fields from backend
                characteristics: data.result.characteristics || [],
                recommendations: data.result.recommendations || {},
                analysisId: data.analysisId
            };
            
            // Store analysis ID
            localStorage.setItem('ayurtime_analysis_id', data.analysisId);
            localStorage.setItem('ayurtime_analysis_date', new Date().toISOString());
            
            apiSuccess = true;
            break; // Exit retry loop on success
            
        } catch (error) {
            console.warn(`API attempt ${attempt + 1} failed:`, error);
            if (attempt < retryConfig.attempts) {
                await new Promise(resolve => setTimeout(resolve, retryConfig.delay));
            }
        }
    }
    
    // Fallback to client-side if API failed
    if (!apiSuccess) {
        console.warn('[AyurTime] API unavailable, using client-side fallback');
        calcResult = DoshaScoring.calculate(answers);
        
        // Show user-friendly notification
        const notice = document.createElement('div');
        notice.style.cssText = 'background:#fff3e0;border:1px solid #ff6f00;padding:8px;border-radius:6px;margin:8px 0;font-size:12px;';
        notice.textContent = 'Using offline analysis (backend unavailable)';
        document.getElementById('screen-quiz').appendChild(notice);
    }
    
    // Clean up loading state
    const existingLoading = document.getElementById('loadingState');
    if (existingLoading) existingLoading.remove();
    btn.disabled = false;
    
    // === End Phase 6 changes ===
```

### Enhanced Results Display

Add after the dosha bars section (around line 283) in `showResults()`:
```javascript
// Render backend characteristics (if available)
if (calcResult.characteristics && calcResult.characteristics.length > 0) {
    const charContainer = document.getElementById('characteristicsList');
    if (charContainer) {
        charContainer.innerHTML = calcResult.characteristics.map(c =>
            `<li class="characteristic-item">${c}</li>`
        ).join('');
    }
}

// Render backend recommendations (if available)
if (calcResult.recommendations) {
    const rec = calcResult.recommendations;
    const recContainer = document.getElementById('recommendationsList');
    if (recContainer) {
        recContainer.innerHTML = `
            ${rec.diet ? `<div class="rec-section"><h4>Diet</h4><ul>${rec.diet.map(d => `<li>${d}</li>`).join('')}</ul></div>` : ''}
            ${rec.lifestyle ? `<div class="rec-section"><h4>Lifestyle</h4><ul>${rec.lifestyle.map(l => `<li>${l}</li>`).join('')}</ul></div>` : ''}
            ${rec.herbs ? `<div class="rec-section"><h4>Herbal Support</h4><ul>${rec.herbs.map(h => `<li>${h}</li>`).join('')}</ul></div>` : ''}
        `;
    }
}
```

---

## 3. History View (history.html)

### Logic for Retrieving Analysis History
```javascript
async function loadHistory() {
    const analyses = [];
    
    // Try loading from backend API
    try {
        const apiUrl = window.AyurTimeAPI?.config.getEndpointUrl('/api/prakriti/history')
                    || 'http://localhost:5000/api/prakriti/history';
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            return data.analyses || [];
        }
    } catch (e) {
        console.warn('API history unavailable, using localStorage');
    }
    
    // Fallback: Load from localStorage
    const storedId = localStorage.getItem('ayurtime_analysis_id');
    const storedDate = localStorage.getItem('ayurtime_analysis_date');
    const storedDosha = localStorage.getItem('ayurtime_dosha');
    
    if (storedId) {
        analyses.push({
            id: storedId,
            createdAt: storedDate,
            dominantDosha: storedDosha
        });
    }
    
    return analyses;
}
```

---

## 4. Integration Testing (`prakriti.test.js`)

### Test Strategy
```javascript
// packages/web/tests/integration/prakriti.test.js
describe('Prakriti Analyzer Integration', () => {
    describe('API integration in onboarding.html', () => {
        it('should call API when all questions answered', async () => {});
        it('should display API response results', async () => {});
        it('should fallback to client-side on API failure', async () => {});
        it('should store analysis ID in localStorage', async () => {});
        it('should show loading state during API call', async () => {});
    });
    
    describe('Error handling', () => {
        it('should retry once on failure', async () => {});
        it('should show offline notice when API unavailable', async () => {});
        it('should display results even when API is down', async () => {});
    });
    
    describe('Results rendering', () => {
        it('should render characteristics from API response', async () => {});
        it('should render recommendations from API response', async () => {});
        it('should display dosha percentages correctly', async () => {});
    });
});
```

---

## 5. Environment Variables (`.env.example`)

```dotenv
# AyurTime Web Environment Variables
# Copy this file to .env and fill in your values

# Backend API base URL (default: http://localhost:5000)
API_BASE_URL=http://localhost:5000

# Node environment (development or production)
NODE_ENV=development
```

---

## 6. Dev Setup Instructions

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Venky2834kami/AyurTime.git
cd AyurTime

# 2. Start the backend API
cd packages/api
npm install
npm start
# API runs on http://localhost:5000

# 3. Open the frontend
# Open packages/web/index.html in a browser
# OR use VS Code Live Server

# 4. Test the Prakriti analyzer
# Navigate to: packages/web/src/pages/onboarding.html
```

### Backend API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/prakriti/analyze | Analyze Prakriti from quiz responses |
| GET | /api/prakriti/history | Retrieve past analyses |
| GET | /api/health | Server health check |

---

## 7. End-to-End Flow Diagram

```
User opens onboarding.html
        |
        v
Answers 8 quiz questions
        |
        v
Clicks "See My Results"
        |
        v
showResults() [async]
        |
        +---> Show loading spinner
        |
        +---> POST /api/prakriti/analyze
        |          {
        |              responses: [answer1, answer2, ...]
        |          }
        |
        +---> API Success?
        |         YES --> Map result to calcResult
        |               Store analysisId in localStorage
        |         NO  --> Retry once after 2s
        |               Still fails? Use DoshaScoring.calculate() fallback
        |               Show "offline analysis" notice
        |
        v
Display Results Screen
        |
        +---> Dosha percentage bars (Vata/Pitta/Kapha)
        +---> Backend characteristics list
        +---> Backend recommendations (diet/lifestyle/herbs)
        +---> Routine suggestions
        |
        v
User clicks "Apply My Personal Routine"
        |
        v
Redirects to alerts.html
```

---

## 8. Success Criteria Checklist

- [x] `api.config.js` created with environment detection
- [ ] `onboarding.html` updated with async API call
- [ ] Loading state shown during API call
- [ ] Retry logic implemented (1 retry with 2s delay)
- [ ] Graceful fallback to client-side scoring
- [ ] `characteristics` from API rendered in results
- [ ] `recommendations` (diet/lifestyle/herbs) from API rendered
- [ ] Analysis ID stored in localStorage
- [ ] `history.html` page created
- [ ] Integration tests written
- [ ] README updated with setup instructions
- [ ] End-to-end flow verified

---

## Related Issues & PRs

- Issue #22: [Phase 6 - Complete Integration & Harden Prakriti Experience](#)
- Issue #21: [Phase 5 - Frontend-Backend Integration (foundation)](#)
- PR #20: [Phase 4 - Backend API & Persistence Layer](#)
- PR #18: [Phase 3 - Frontend Prakriti Analyzer UI](#)
