/**
 * CommunityHub Component - Issue #16
 * Discussion Boards + Practitioner Directory
 * Supports i18n (English/Hindi)
 */

import React, { useState, useEffect } from 'react';

const API_BASE = '/api/community';

const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('threads'); // threads | practitioners
  const [threads, setThreads] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [lang, setLang] = useState('en');

  const categories = ['doshas', 'herbs', 'dinacharya', 'panchakarma', 'diet', 'yoga'];
  const tags = ['Vata', 'Pitta', 'Kapha', 'Agni', 'Ama', 'Ojas'];

  useEffect(() => {
    fetchThreads();
    fetchPractitioners();
  }, [categoryFilter, tagFilter]);

  const fetchThreads = async () => {
    const params = new URLSearchParams();
    if (categoryFilter) params.append('category', categoryFilter);
    if (tagFilter) params.append('tag', tagFilter);
    const res = await fetch(`${API_BASE}/threads?${params}`);
    const data = await res.json();
    if (data.success) setThreads(data.threads);
  };

  const fetchPractitioners = async () => {
    const res = await fetch(`${API_BASE}/practitioners`);
    const data = await res.json();
    if (data.success) setPractitioners(data.practitioners);
  };

  const upvoteThread = async (id) => {
    await fetch(`${API_BASE}/threads/${id}/upvote`, { method: 'POST' });
    fetchThreads();
  };

  return (
    <div className="community-hub" data-lang={lang}>
      <header className="hub-header">
        <h1>{lang === 'en' ? 'Community Satsang Hub' : 'समुदाय संग केंद्र'}</h1>
        <div className="lang-toggle">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>English</button>
          <button onClick={() => setLang('hi')} className={lang === 'hi' ? 'active' : ''}>हिन्दी</button>
        </div>
      </header>

      <nav className="hub-tabs">
        <button onClick={() => setActiveTab('threads')} className={activeTab === 'threads' ? 'active' : ''}>
          {lang === 'en' ? 'Discussion Boards' : 'चर्चा मंच'}
        </button>
        <button onClick={() => setActiveTab('practitioners')} className={activeTab === 'practitioners' ? 'active' : ''}>
          {lang === 'en' ? 'Practitioner Directory' : 'चिकित्सक निर्देशिका'}
        </button>
      </nav>

      {activeTab === 'threads' && (
        <section className="threads-section">
          <div className="filters">
            <label>{lang === 'en' ? 'Category:' : 'श्रेणी:'}</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">{lang === 'en' ? 'All' : 'सभी'}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>{lang === 'en' ? 'Tag:' : 'टैग:'}</label>
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option value="">{lang === 'en' ? 'All' : 'सभी'}</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="threads-list">
            {threads.map(thread => (
              <article key={thread.thread_id} className="thread-card">
                <h3>{thread.title}</h3>
                <p>{thread.body.substring(0, 150)}...</p>
                <div className="thread-meta">
                  <span className="category">{thread.category}</span>
                  {thread.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  <button onClick={() => upvoteThread(thread.thread_id)} className="upvote-btn">
                    ↑ {thread.upvotes}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'practitioners' && (
        <section className="practitioners-section">
          <div className="practitioners-list">
            {practitioners.map(prac => (
              <article key={prac.practitioner_id} className="practitioner-card">
                <h3>{prac.name} {prac.verified && <span className="verified-badge">✓</span>}</h3>
                <p className="bio">{prac.bio}</p>
                <p><strong>{lang === 'en' ? 'Specialization:' : 'विशेषज्ञता:'}</strong> {prac.specialization.join(', ')}</p>
                <p><strong>{lang === 'en' ? 'Location:' : 'स्थान:'}</strong> {prac.location.city}, {prac.location.state}</p>
                <p><strong>{lang === 'en' ? 'Languages:' : 'भाषाएँ:'}</strong> {prac.languages.join(', ')}</p>
                <button className="ask-btn">{lang === 'en' ? 'Ask This Practitioner' : 'इस चिकित्सक से पूछें'}</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CommunityHub;
