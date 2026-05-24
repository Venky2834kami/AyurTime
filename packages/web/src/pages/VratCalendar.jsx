import React, { useState, useEffect, useCallback } from 'react';

/**
 * VratCalendar Page — AyurTime Phase 2
 * Displays the monthly Vrat & Panchang calendar
 * with tithi, nakshatra, and fasting guidance.
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function DayCell({ dayData, isToday, onClick, selected }) {
  const hasVrat = dayData?.vratas?.length > 0;
  return (
    <div
      onClick={() => onClick(dayData)}
      style={{
        minHeight: 64, padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
        background: selected ? '#e8f4e8' : isToday ? '#fff8e7' : '#fafafa',
        border: selected ? '2px solid #27ae60' : isToday ? '2px solid #e67e22' : '1px solid #e2e8f0',
        position: 'relative',
        transition: 'box-shadow 0.15s',
        boxShadow: hasVrat ? '0 2px 6px rgba(142,68,173,0.15)' : 'none',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? '#e67e22' : '#2d3748' }}>
        {dayData?.date ? new Date(dayData.date + 'T12:00:00').getDate() : ''}
      </div>
      {dayData?.tithi_name && (
        <div style={{ fontSize: 9, color: '#8e44ad', marginTop: 2, lineHeight: 1.2 }}>
          {dayData.tithi_name}
        </div>
      )}
      {hasVrat && (
        <div style={{
          position: 'absolute', top: 4, right: 6, fontSize: 10,
          background: '#8e44ad', color: '#fff', borderRadius: 10,
          padding: '1px 5px', fontWeight: 600,
        }}>
          Vrat
        </div>
      )}
    </div>
  );
}

function VratDetail({ dayData, onClose }) {
  if (!dayData) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: 20, marginTop: 16, position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 12, right: 12, background: 'none',
        border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa',
      }}>x</button>
      <h3 style={{ margin: '0 0 8px', color: '#2d3748', fontSize: 16 }}>
        {new Date(dayData.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      </h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#718096' }}>
          Tithi: <strong style={{ color: '#8e44ad' }}>{dayData.tithi_name} ({dayData.tithi})</strong>
        </span>
        <span style={{ fontSize: 13, color: '#718096' }}>
          Paksha: <strong>{dayData.paksha}</strong>
        </span>
        <span style={{ fontSize: 13, color: '#718096' }}>
          Nakshatra: <strong>{dayData.nakshatra}</strong>
        </span>
      </div>
      {dayData.vratas?.length > 0 ? (
        <div>
          <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>Vratas / Fasts today:</div>
          {dayData.vratas.map(v => (
            <div key={v.id} style={{
              background: '#f7f3ff', border: '1px solid #d6b8f5', borderRadius: 8,
              padding: '10px 14px', marginBottom: 8,
            }}>
              <div style={{ fontWeight: 700, color: '#6c3483', marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                <span style={{ fontWeight: 600 }}>Dietary guidance: </span>{v.diet}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#aaa' }}>No major vrat today. A good day for regular sadhana.</div>
      )}
    </div>
  );
}

export default function VratCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadMonth = useCallback((y, m) => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/panchang/month?year=${y}&month=${m}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setCalendarData(data.data);
        else setError(data.error || 'Failed to load');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadMonth(year, month); }, [year, month, loadMonth]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  // Build calendar grid (starting from Sunday of first week)
  const firstDay = new Date(year, month - 1, 1).getDay();
  const grid = Array(firstDay).fill(null).concat(calendarData);
  const todayStr = now.toISOString().split('T')[0];

  const vratCount = calendarData.filter(d => d.vratas?.length > 0).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, color: '#2d3748' }}>🗓 Vrat & Panchang Calendar</h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 13 }}>
            Hindu lunar calendar — fasting days, tithis & nakshatras
          </p>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#718096', textDecoration: 'none' }}>← Dashboard</a>
      </div>

      {/* Month stats badge */}
      {!loading && (
        <div style={{ marginBottom: 16, fontSize: 13, color: '#8e44ad', fontWeight: 600 }}>
          {vratCount} fasting day{vratCount !== 1 ? 's' : ''} this month
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={prevMonth} style={{
          background: '#f7f3ff', border: 'none', borderRadius: 8, padding: '8px 16px',
          cursor: 'pointer', fontSize: 18, color: '#6c3483',
        }}>‹</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#2d3748' }}>
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button onClick={nextMonth} style={{
          background: '#f7f3ff', border: 'none', borderRadius: 8, padding: '8px 16px',
          cursor: 'pointer', fontSize: 18, color: '#6c3483',
        }}>›</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#c53030', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#a0aec0', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading panchang…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {grid.map((dayData, i) => (
            dayData ? (
              <DayCell
                key={dayData.date}
                dayData={dayData}
                isToday={dayData.date === todayStr}
                selected={selected?.date === dayData.date}
                onClick={setSelected}
              />
            ) : (
              <div key={`empty-${i}`} style={{ minHeight: 64 }} />
            )
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && <VratDetail dayData={selected} onClose={() => setSelected(null)} />}

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 16, fontSize: 11, color: '#718096', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, background: '#fff8e7', border: '2px solid #e67e22', borderRadius: 3, display: 'inline-block' }} /> Today
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 2px 6px rgba(142,68,173,0.15)', display: 'inline-block' }} /> Vrat day
        </span>
      </div>
    </div>
  );
}
