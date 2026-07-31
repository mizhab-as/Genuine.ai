import React from 'react';
import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'detector', label: 'Detection Engine', icon: '⚡' },
  { id: 'api',      label: 'Developer API',    icon: '{}' },
  { id: 'docs',     label: 'Architecture',     icon: '🔬' },
];

export default function Navbar() {
  const { tab, setTab, apiOnline, setAboutOpen } = useApp();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand from genuine_ai_landing.html */}
        <div className="brand" onClick={() => setTab('detector')}>
          <div className="brand-mark">
            <svg viewBox="0 0 30 30" fill="none" width="30" height="30">
              <rect x="2" y="2" width="26" height="26" rx="7" stroke="#1c2420" strokeWidth="1.8"/>
              <circle cx="15" cy="15" r="6" stroke="#1c2420" strokeWidth="1.8"/>
              <path d="M19.5 19.5L24 24" stroke="#4fae8a" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">GENUINE.AI</div>
            <div className="brand-sub">PIXEL-LEVEL PROOF</div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`nav-tab-${t.id}`}
              className={`nav-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="status-pill">
            <span className={`status-dot ${apiOnline ? 'online' : 'ready'}`} />
            <span>{apiOnline ? 'API ONLINE' : 'ENGINE READY'}</span>
          </div>
          <button
            className="btn-about"
            onClick={() => setAboutOpen(true)}
            title="About Genuine.ai"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--ink)', color: 'var(--cream)',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
