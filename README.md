# AyurTime
Ayurveda Smart watch Coach

## Project Status: Phase 3 Initialized 🚀

### 🛠️ Core Features Implemented:
1.  **Phase 1: Foundations**
    -   [x] High-fidelity responsive CSS framework (`main.css`).
    -   [x] Dosha Assessment logic (`dosha-scoring.js`).
    -   [x] Onboarding & Health Coaching UI components.
2.  **Phase 2: Modernization & Utilities**
    -   [x] Hindu Vrat Calendar with multi-year data (2025-2026).
    -   [x] Persistent Observance Logging (`ayurtime_vrat_logs`).
    -   [x] Real-time adherence analytics & streak tracking.
    -   [x] Restructured Charaka Samhita knowledge base (15 Chapters).
3.  **Phase 3: AI Consultation (Initialized)**
    -   [x] Responsive AI Chat Interface (`consult.html`).
    -   [x] Initial Diagnostic Engine (`consult-engine.js`) with Tridosha keyword analysis.

### 📁 Repository Structure:
- `packages/web/src/pages/`: Main application screens (Home, Calendar, Consult, Alerts, Charaka).
- `packages/web/src/scripts/`: Core logic engines and utility scripts.
- `packages/web/src/data/`: Structured JSON knowledge bases.

### 🎯 Next Milestones:
- [ ] Advanced sub-dosha diagnostic mapping.
- [ ] Consultation PDF report generation.
- [ ] Integration with historical health data.


---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Custom responsive CSS (main.css) |
| Data | JSON knowledge bases (Charaka Samhita, Vrat Calendar) |
| Backend (Phase 4+) | Node.js + Express.js REST API |
| Config | Environment-aware config.js |
| CI/CD | GitHub Actions |
| Package Manager | npm |

---

## Setup & Installation

### Prerequisites
- Node.js v18+ and npm
- A modern browser (Chrome, Firefox, Safari)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Venky2834kami/AyurTime.git
cd AyurTime

# 2. Navigate to the web package
cd packages/web

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your API endpoints

# 5. Start local dev server
npm run dev
# App runs at http://localhost:3000
```

---

## Usage

1. **Dosha Assessment**: Open `src/pages/onboarding.html` → complete the 8-question Prakriti quiz → receive your Tridosha profile.
2. **Vrat Calendar**: Navigate to the Calendar page to view and log Hindu Vrat observances for 2025-2026.
3. **AI Consultation**: Use `src/pages/consult.html` for AI-powered Ayurvedic consultation (Phase 3+).
4. **Charaka Samhita**: Access the 15-chapter knowledge base for classical Ayurvedic references.

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `ci:`
- Open a Pull Request against `main` using the PR template
- Reference the related Issue number in your PR

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

---

## TKDL-style Knowledge Architecture

AyurTime uses a **TKDL-style structure** only as an internal metadata and classification framework. It does **not** query or reproduce any proprietary TKDL entries. All knowledge content is sourced from open-domain classical texts and internally defined rules.

### Key points

- JSON knowledge nodes under `packages/web/src/data/` include TKRC-like fields: `tkrc_body_system`, `tkrc_therapeutic_area`, `dosage_form_category`, `dosha_action_profile`, `safety_band`, and `watch_suitability`.
- These fields are used **only** for ontology alignment, safety filtering, and recommendation ranking.
- Classical references (Charaka Samhita, etc.) are treated as prior-art educational background, not as patentable novelty.
- The TKDL-style consult engine (`consult-engine-tkdl.js`) prioritizes low-risk lifestyle guidance — ahara, vihara, dinacharya, nidra, hydration, mild yoga, breathwork — and routes red-flag conditions to human care.
- AyurTime is an **educational and lifestyle-support coach only**. It is not a replacement for a physician, Vaidya, or emergency care.

### New TKDL-style files added

| File | Purpose |
|------|---------|
| `packages/web/src/data/schema-tkdl-metadata.json` | JSON Schema defining all TKDL-style metadata fields |
| `packages/web/src/data/symptoms-tkrc.json` | 8 canonical symptom nodes with dosha and safety metadata |
| `packages/web/src/data/recommendations-lifestyle.json` | 8 lifestyle recommendation nodes mapped to TKRC bands |
| `packages/web/src/data/classical-references.json` | 7 Charaka Samhita classical reference nodes |
| `packages/web/src/scripts/consult-engine-tkdl.js` | Full 11-step TKDL-style consultation pipeline |

### Safety boundaries

- No diagnosis claims are made.
- Practitioner-only content is suppressed from default user output.
- Red-flag symptoms (chest pain, breathing difficulty, etc.) bypass lifestyle recommendations and trigger escalation.
- Contraindication flags suppress context-inappropriate suggestions (pregnancy, child, elderly).
- All recommendations include safety disclaimers.

*Built with devotion to Ayurveda and modern AI — AyurTime bridges ancient wisdom with intelligent technology.*
