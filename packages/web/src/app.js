/**
 * AyurTime - Phase 1 MVP
 * Main Application JavaScript
 * Handles homepage: Today's Vrat Status, Dosha display, Greeting
 */

(function() {
  'use strict';

  // ─── Dosha Profile ────────────────────────────────────────────────────────
  const dosha = localStorage.getItem('ayurtime_dosha') || 'Vata';
  const doshaEl = document.getElementById('doshaDisplay');
  if (doshaEl) doshaEl.textContent = dosha;

  // ─── Today's Greeting ─────────────────────────────────────────────────────
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Suprabhatam (Good Morning)';
    if (hour < 17) return 'Namaste (Good Afternoon)';
    return 'Shubh Sandhya (Good Evening)';
  }

  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    const greetings = ['Namaste \uD83D\uDE4F', 'Om Shanti \uD83C\uDF3F', 'Hari Om \uD83D\uDE4F'];
    heroH1.textContent = greetings[new Date().getDay() % greetings.length];
  }

  // ─── Today's Vrat Check ───────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const vratStatusEl = document.getElementById('vratStatus');

  if (vratStatusEl) {
    fetch('src/data/vrat-calendar.json')
      .then(r => r.json())
      .then(data => {
        const todayVrat = data.vrats.find(v => v.date === today);
        const upcoming = data.vrats
          .filter(v => v.date > today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        if (todayVrat) {
          vratStatusEl.innerHTML = `
            <strong style="color:#2e7d32; font-size:1.1rem;">\uD83D\uDD14 Today is ${todayVrat.name}!</strong><br/>
            <span>Deity: ${todayVrat.deity}</span><br/>
            <span>Fasting: ${todayVrat.fasting_rules}</span><br/>
            <span style="color:#2e7d32;">\uD83D\uDD49 ${todayVrat.mantra}</span><br/>
            <span>\uD83C\uDF7D\uFE0F Allowed foods: ${todayVrat.sattvic_food.join(', ')}</span>`;
        } else {
          const nextVratLines = upcoming.map(v => {
            const d = new Date(v.date);
            const ds = d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
            return `\u2022 ${ds}: <strong>${v.name}</strong> (${v.type})`;
          }).join('<br/>');
          vratStatusEl.innerHTML = `
            <strong>No vrat today</strong> \u2014 have a sattvic meal \uD83C\uDF3F<br/><br/>
            <span style="color:#757575;"><strong>Upcoming vrats:</strong></span><br/>${nextVratLines}`;
        }
      })
      .catch(() => {
        vratStatusEl.textContent = 'Vrat data not loaded. Please serve on localhost.';
      });
  }

  // ─── Today's Charaka Tip ──────────────────────────────────────────────────
  fetch('src/data/charaka-samhita.json')
    .then(r => r.json())
    .then(data => {
      const dayIndex = new Date().getDay();
      const tip = data.topics[dayIndex % data.topics.length];
      const tipEl = document.createElement('section');
      tipEl.style.cssText = 'background:white;border-radius:12px;padding:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-top:1.5rem;';
      tipEl.innerHTML = `
        <h2 style="color:#005005; margin-bottom:0.75rem;">\uD83D\uDCD6 Today's Charaka Tip</h2>
        <span style="display:inline-block; background:#e8f5e9; color:#005005; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600; margin-bottom:0.5rem;">${tip.category}</span>
        <h3 style="margin-bottom:0.4rem;">${tip.title}</h3>
        <p style="font-style:italic; color:#2e7d32; font-size:0.9rem; margin-bottom:0.5rem;">\u201c${tip.shloka}\u201d \u2014 ${tip.chapter}</p>
        <p style="color:#757575; font-size:0.88rem; line-height:1.6;">${tip.daily_tip}</p>`;
      const main = document.querySelector('.app-main');
      if (main) main.appendChild(tipEl);
    })
    .catch(() => {});

  // ─── Current Time Display ─────────────────────────────────────────────────
  function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.textContent = `${timeStr} | ${dateStr}`;
  }
  updateTime();
  setInterval(updateTime, 60000);

})();
