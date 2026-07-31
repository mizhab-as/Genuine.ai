import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
        {/* Brand */}
        <div className="brand" onClick={() => setTab('detector')}>
          <div className="brand-icon">
            <ShieldCheck size={18} color="#fff" />
          </div>
          <span className="brand-name">Genuine<span>.ai</span></span>
          <span className="badge-pill">BETA</span>
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
            <span>{apiOnline ? 'API Online' : 'Engine Ready'}</span>
          </div>
          <button
            className="btn-about"
            onClick={() => setAboutOpen(true)}
            title="About Genuine.ai"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
