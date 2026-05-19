/**
 * PanchakarmaTracker Component - Issue #17
 * Day-wise protocol tracker with progress dashboard
 * Symptom journal, diet compliance, and PDF export
 * DISCLAIMER: Educational/lifestyle guidance only
 */

import React, { useState, useEffect } from 'react';

const API_BASE = '/api/panchakarma';

const PanchakarmaTracker = () => {
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [showWizard, setShowWizard] = useState(false);

  const startProgram = async (formData) => {
    const res = await fetch(`${API_BASE}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      alert(`Program started: ${data.procedure} (${data.duration_days} days)`);
      setShowWizard(false);
      fetchProgram(data.program_id);
    }
  };

  const fetchProgram = async (id) => {
    const res = await fetch(`${API_BASE}/programs/${id}`);
    const data = await res.json();
    if (data.success) setActiveProgram(data.program);
  };

  const logProgress = async (programId, day, logData) => {
    const res = await fetch(`${API_BASE}/programs/${programId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, ...logData })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Day ${day} logged! Program ${data.program_completion_pct}% complete`);
      fetchProgram(programId);
    }
  };

  const exportPDF = async (programId) => {
    const res = await fetch(`${API_BASE}/programs/${programId}/export`);
    const data = await res.json();
    if (data.success) {
      console.log('Export data:', data.export);
      alert('PDF export ready! (Frontend PDF generation to be implemented)');
    }
  };

  if (showWizard) {
    return <ProgramWizard onStart={startProgram} onCancel={() => setShowWizard(false)} />;
  }

  if (!activeProgram) {
    return (
      <div className="panchakarma-home">
        <h1>पंचकर्म Prep & Tracking</h1>
        <p>Start your detox journey with classical Ayurvedic protocols</p>
        <button onClick={() => setShowWizard(true)} className="start-btn">Start New Program</button>
        <div className="disclaimer">
          <strong>DISCLAIMER:</strong> For educational/lifestyle guidance only. Not a substitute for professional Ayurvedic medical advice. Consult a qualified Vaidya before beginning any Panchakarma program.
        </div>
      </div>
    );
  }

  const dayLog = activeProgram.daily_logs.find(d => d.day === currentDay);

  return (
    <div className="panchakarma-tracker">
      <header className="tracker-header">
        <h1>{activeProgram.procedure} Program</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${activeProgram.completion_pct}%` }}>
            {activeProgram.completion_pct}%
          </div>
        </div>
        <p>Day {currentDay} of {activeProgram.duration_days} | Phase: {dayLog?.phase}</p>
      </header>

      <nav className="day-navigator">
        <button onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} disabled={currentDay === 1}>← Prev</button>
        <span>Day {currentDay}</span>
        <button onClick={() => setCurrentDay(Math.min(activeProgram.duration_days, currentDay + 1))} disabled={currentDay === activeProgram.duration_days}>Next →</button>
      </nav>

      <section className="checklist">
        <h2>Today's Protocol</h2>
        <div className="tasks">
          <h3>Morning</h3>
          <ul>{dayLog?.tasks.morning.map((t, i) => <li key={i}><input type="checkbox" /> {t}</li>)}</ul>
          <h3>Afternoon</h3>
          <ul>{dayLog?.tasks.afternoon.map((t, i) => <li key={i}><input type="checkbox" /> {t}</li>)}</ul>
          <h3>Evening</h3>
          <ul>{dayLog?.tasks.evening.map((t, i) => <li key={i}><input type="checkbox" /> {t}</li>)}</ul>
        </div>
      </section>

      <section className="diet-guide">
        <h2>Pathya-Apathya Chart</h2>
        <div className="diet-columns">
          <div className="pathya">
            <h3>✔ Pathya (Recommended)</h3>
            <ul>{activeProgram.pathya.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
          <div className="apathya">
            <h3>✖ Apathya (Avoid)</h3>
            <ul>{activeProgram.apathya.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="symptom-journal">
        <h2>Symptom Journal</h2>
        <textarea placeholder="Record any symptoms, observations, or how you feel today..."></textarea>
        <label><input type="checkbox" /> Diet compliance maintained</label>
        <button onClick={() => logProgress(activeProgram.program_id, currentDay, {
          tasks_completed: ['snehapana', 'abhyanga'],
          symptoms: 'Feeling light, good agni',
          diet_compliance: true
        })}>Save Log</button>
      </section>

      <footer className="tracker-footer">
        <button onClick={() => exportPDF(activeProgram.program_id)} className="export-btn">Export PDF</button>
        <button onClick={() => setActiveProgram(null)} className="back-btn">Back to Home</button>
      </footer>
    </div>
  );
};

const ProgramWizard = ({ onStart, onCancel }) => {
  const [prakriti, setPrakriti] = useState('Vata');
  const [procedure, setProcedure] = useState('Basti');
  const [duration, setDuration] = useState(14);

  return (
    <div className="program-wizard">
      <h1>Start Panchakarma Program</h1>
      <form onSubmit={(e) => { e.preventDefault(); onStart({ user_id: 'user123', procedure, duration_days: duration, prakriti }); }}>
        <label>Your Prakriti:
          <select value={prakriti} onChange={(e) => setPrakriti(e.target.value)}>
            <option value="Vata">Vata</option>
            <option value="Pitta">Pitta</option>
            <option value="Kapha">Kapha</option>
            <option value="Tridosha">Tridosha</option>
          </select>
        </label>
        <label>Procedure:
          <select value={procedure} onChange={(e) => setProcedure(e.target.value)}>
            <option value="Vamana">Vamana</option>
            <option value="Virechana">Virechana</option>
            <option value="Basti">Basti</option>
            <option value="Nasya">Nasya</option>
            <option value="Raktamokshana">Raktamokshana</option>
          </select>
        </label>
        <label>Duration:
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
          </select>
        </label>
        <button type="submit">Start Program</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default PanchakarmaTracker;
