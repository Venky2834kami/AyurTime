import React, { useState } from 'react';

/**
 * PrakritiAI Page — AyurTime Phase 3A
 * Upload facial/body image → AI dosha analysis
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DOSHA_COLORS = {
  vata: '#9b59b6',
  pitta: '#e74c3c',
  kapha: '#27ae60',
};

const DOSHA_ICONS = {
  vata: '💨',
  pitta: '🔥',
  kapha: '🌊',
};

function DoshaBar({ dosha, score }) {
  const percentage = (score * 100).toFixed(1);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748', textTransform: 'capitalize' }}>
          {DOSHA_ICONS[dosha]} {dosha}
        </span>
        <span style={{ fontSize: 13, color: '#718096' }}>{percentage}%</span>
      </div>
      <div style={{ background: '#e2e8f0', borderRadius: 8, height: 12, overflow: 'hidden' }}>
        <div
          style={{
            background: DOSHA_COLORS[dosha],
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 8,
            transition: 'width 0.8s ease-out',
          }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ category, text, dosha }) {
  return (
    <div style={{
      background: '#fff', border: `2px solid ${DOSHA_COLORS[dosha]}`, borderRadius: 12,
      padding: '14px 18px', marginBottom: 12,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: DOSHA_COLORS[dosha], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        {category}
      </div>
      <div style={{ fontSize: 14, color: '#2d3748', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export default function PrakritiAI() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setError(null);

    // Read as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImage(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/prakriti-ai/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#2d3748' }}>🧬 Prakriti AI Analyzer</h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 14 }}>
            Upload your image for AI-powered dosha analysis
          </p>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#718096', textDecoration: 'none' }}>← Dashboard</a>
      </div>

      {/* Upload Area */}
      <div style={{
        background: '#f7fafc', border: '2px dashed #cbd5e0', borderRadius: 12,
        padding: 40, textAlign: 'center', marginTop: 24, marginBottom: 24,
      }}>
        {!preview ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
            <div style={{ fontSize: 16, color: '#2d3748', marginBottom: 8, fontWeight: 600 }}>
              Upload a facial or body image
            </div>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>
              JPEG, PNG, or WebP • Max 5MB
            </div>
            <label style={{
              background: '#8e44ad', color: '#fff', padding: '10px 24px', borderRadius: 8,
              cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'inline-block',
            }}>
              Choose Image
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </>
        ) : (
          <div>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={analyzeImage}
                disabled={analyzing}
                style={{
                  background: analyzing ? '#aaa' : '#27ae60', color: '#fff',
                  border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: analyzing ? 'not-allowed' : 'pointer',
                }}
              >
                {analyzing ? 'Analyzing...' : '🔍 Analyze Prakriti'}
              </button>
              <button
                onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
                style={{
                  background: '#fff', border: '1px solid #cbd5e0', padding: '10px 24px',
                  borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#2d3748',
                }}
              >
                🗑 Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8,
          padding: '12px 16px', marginBottom: 24, color: '#c53030', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Scores */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#2d3748' }}>Your Dosha Analysis</h2>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>
              Dominant: <strong style={{ color: DOSHA_COLORS[result.dominant], textTransform: 'capitalize' }}>
                {DOSHA_ICONS[result.dominant]} {result.dominant}
              </strong> • Confidence: {(result.confidence * 100).toFixed(0)}%
            </div>
            <DoshaBar dosha="vata" score={result.scores.vata} />
            <DoshaBar dosha="pitta" score={result.scores.pitta} />
            <DoshaBar dosha="kapha" score={result.scores.kapha} />
          </div>

          {/* Recommendations */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#2d3748' }}>Personalised Recommendations</h2>
            {result.recommendations.map((rec, i) => (
              <RecommendationCard key={i} category={rec.category} text={rec.text} dosha={result.dominant} />
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20, fontSize: 11, color: '#a0aec0', textAlign: 'center' }}>
            Model: {result.model_version} • This is a heuristic-based demo. Full ML model in Phase 3B.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 12, color: '#a0aec0', textAlign: 'center' }}>
        AyurTime AI • Phase 3A Prakriti Analyzer • Built with MobileNetV2 heuristics
      </div>
    </div>
  );
}
