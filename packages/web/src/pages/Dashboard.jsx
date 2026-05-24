import React, { useState, useEffect } from 'react';

/**
 * Dashboard Page - AyurTime Phase 2
 * Shows user's Prakriti summary, Dinacharya streak,
 * recent assessments, and quick-action cards.
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function StatCard({ title, value, subtitle, color = '#4CAF50' }) {
  return (
    <div style={{
      background: '#fff',
      borderLeft: `4px solid ${color}`,
      borderRadius: 8,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: 160,
      flex: '1 1 160px',
    }}>
      <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#2d3748', margin: '6px 0' }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#aaa' }}>{subtitle}</div>}
    </div>
  );
}

function QuickAction({ label, href, icon }) {
  return (
    <a href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#f7f3ee', borderRadius: 12, padding: '20px 16px',
      textDecoration: 'none', color: '#5a3e28', gap: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: '1 1 120px',
      transition: 'box-shadow 0.2s',
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{label}</span>
    </a>
  );
}

export default function Dashboard() {
  const [streak, setStreak] = useState(null);
  const [prakriti, setPrakriti] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ayurtime_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_BASE}/api/dinacharya/streak`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/prakriti/profile`, { headers }).then(r => r.json()),
    ])
      .then(([streakData, prakritiData]) => {
        setStreak(streakData);
        setPrakriti(prakritiData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const dominantDosha = prakriti?.dominant_dosha || prakriti?.dominantDosha || '—';
  const streakCount = streak?.streak ?? '—';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#2d3748' }}>AyurTime Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>Your personalised Ayurvedic wellness hub</p>
        </div>
        <div style={{ fontSize: 32 }}>🌿</div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '10px 16px', marginBottom: 24, color: '#c53030', fontSize: 14 }}>
          Could not load some data: {error}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard title="Dinacharya Streak" value={loading ? '…' : streakCount} subtitle="consecutive days" color="#e67e22" />
        <StatCard title="Dominant Dosha" value={loading ? '…' : dominantDosha} subtitle="from Prakriti analysis" color="#8e44ad" />
        <StatCard title="Consultations" value="—" subtitle="coming soon" color="#2980b9" />
        <StatCard title="Panchakarma" value="—" subtitle="coming soon" color="#27ae60" />
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 18, color: '#2d3748', marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <QuickAction label="Log Today" href="/dinacharya" icon="📋" />
        <QuickAction label="Consult" href="/consult" icon="🩺" />
        <QuickAction label="Prakriti" href="/prakriti" icon="🌀" />
        <QuickAction label="Community" href="/community" icon="👥" />
        <QuickAction label="Panchakarma" href="/panchakarma" icon="🌿" />
        <QuickAction label="Charaka" href="/charaka" icon="📜" />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 12, color: '#a0aec0', textAlign: 'center' }}>
        AyurTime v0.1.0-mvp · Built with ancient wisdom &amp; modern tech
      </div>
    </div>
  );
}
