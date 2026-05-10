# AyurTime API - Panini-Style Sanskrit Engine + Charaka Samhita Integration

## 🚀 Quick Start

```bash
cd packages/api
npm install
npm start  # Runs on http://localhost:3001
```

## 📚 API Endpoints

### Sanskrit Morphological Analysis

**POST `/api/sanskrit/analyze`** - Analyze Sanskrit text
```bash
curl -X POST http://localhost:3001/api/sanskrit/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "vāta pitta kapha"}'
```

**Response:**
```json
{
  "tokens": [
    {
      "form": "vāta",
      "lemma": "vāta",
      "pos": "noun",
      "case": "nominative",
      "number": "singular",
      "gender": "masculine",
      "semanticTag": "DOSHA",
      "meaning": "air/wind principle",
      "english": "Vata"
    }
  ],
  "statistics": {
    "total_words": 3,
    "recognized_words": 3,
    "ayurvedic_terms": 3
  }
}
```

### Charaka Samhita Verse Access

**GET `/api/charaka/search?dosha=Vata&keyword=constipation`**
```bash
curl "http://localhost:3001/api/charaka/search?dosha=Vata&keyword=kabdha"
```

**GET `/api/charaka/verse/:id`**
```bash
curl http://localhost:3001/api/charaka/verse/cs_sutra_1
```

**GET `/api/charaka/chapters`** - List all chapters

## 🎯 Lexicon Coverage

**110+ Ayurvedic Terms:**
- **DOSHA**: vāta, pitta, kapha
- **DHĀTU** (7): rasa, rakta, māṁsa, meda, asthi, majjā, śukra
- **MALA** (3): mūtra, purīṣa, sveda  
- **DRAVYA** (20+): tulasī, aśvagandhā, guḍūcī, triphalā, etc.
- **ROGA** (15+): jvara, kāsa, śvāsa, prameha, etc.
- **KRIYA** (12+): dīpana, pācana, basti, vamana, etc.
- **GUNA** (10): guru, laghu, snigdha, rūkṣa, etc.
- **RASA** (6): madhura, amla, kaṭu, tikta, etc.
- **SYMPTOM** (7+): kabdha, udvārta, ānāha, etc.

## 🛠️ Deployment

### Railway
```bash
railway link
railway up
```

### Render
- Build Command: `cd packages/api && npm install`
- Start Command: `cd packages/api && npm start`
- Port: 3001

### Environment Variables
```
PORT=3001
NODE_ENV=production
```

## 📖 Classical Sources

Charaka Samhita data loaded from `../web/src/data/charaka-samhita.json`
- 15 chapters with Sanskrit verses
- Tags: dosha, treatment, diagnosis, etc.
- Searchable by lemma, keyword, dosha

## 🧪 Testing

```bash
npm test
```

## 🎓 Learn More

- [Panini Style Sanskrit Engine Spec](../../Panini%20Style%20Sanskrit%20Engine.txt)
- [Charaka Samhita Database](../web/src/data/charaka-samhita.json)

---

**Built with ❤️ for AyurTime - AI-Powered Ayurvedic Health Coach**
