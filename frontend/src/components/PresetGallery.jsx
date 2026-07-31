import React from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PresetGallery() {
  const { loadPreset, PRESETS } = useApp();

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Activity size={15} className="card-title-icon" /> Test Presets
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Instant Demo</span>
      </div>

      <div className="presets-grid">
        {PRESETS.map(p => (
          <div
            key={p.id}
            id={`preset-${p.id}`}
            className="preset-card"
            onClick={() => loadPreset(p)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && loadPreset(p)}
          >
            <div className="preset-thumb">
              <img src={p.url} alt={p.name} loading="lazy" />
              <span className={`preset-label ${p.verdict === 'genuine' ? 'real' : 'ai'}`}>
                {p.verdict === 'genuine' ? 'REAL' : 'AI'}
              </span>
            </div>
            <p className="preset-name">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
