import React from 'react';
import { Code2, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ModeTabs from './ModeTabs';

export default function Navbar() {
  const { setTab, apiOnline, setAboutOpen, setDrawerOpen } = useApp();

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: 'rgba(243, 237, 224, 0.92)', borderBottom: '1px solid rgba(47, 77, 70, 0.12)' }}>
      <div className="navbar-inner" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64 }}>
        {/* Brand */}
        <div className="brand" onClick={() => setTab('detector')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">
            <svg viewBox="0 0 30 30" fill="none" width="30" height="30">
              <rect x="2" y="2" width="26" height="26" rx="7" stroke="#1c2420" strokeWidth="1.8"/>
              <circle cx="15" cy="15" r="6" stroke="#1c2420" strokeWidth="1.8"/>
              <path d="M19.5 19.5L24 24" stroke="#4fae8a" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="brand-name" style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, letterSpacing: '0.05em', color: 'var(--ink)' }}>GENUINE.AI</div>
            <div className="brand-sub" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.08em' }}>PIXEL-LEVEL PROOF</div>
          </div>
        </div>

        {/* Center Packed Mode Switcher */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 16px' }}>
          <ModeTabs />
        </div>

        {/* Right Status & Developer Resources */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-pill" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(47,77,70,0.06)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
            <span className={`status-dot ${apiOnline ? 'online' : 'ready'}`} />
            <span>{apiOnline ? 'API ONLINE' : 'ENGINE READY'}</span>
          </div>

          <button
            className="btn-drawer-toggle"
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
              background: 'var(--forest)', color: 'var(--cream)', border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(47,77,70,0.25)', transition: 'all 0.15s ease'
            }}
          >
            <Code2 size={13} />
            <span>API & Specs</span>
          </button>

          <button
            className="btn-about"
            onClick={() => setAboutOpen(true)}
            title="About Genuine.ai"
            style={{
              width: 30, height: 30, borderRadius: '50%', border: 'none',
              background: 'var(--ink)', color: 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
