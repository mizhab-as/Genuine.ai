import React from 'react';
import { Image as ImageIcon, User, FileCheck, Video } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MODE_ICONS = { ImageIcon, User, FileCheck, Video };

export default function ModeTabs() {
  const { mode, setMode, setResult, MODES } = useApp();

  return (
    <div className="mode-tabs">
      {MODES.map(m => {
        const Icon = MODE_ICONS[m.icon] || ImageIcon;
        return (
          <button
            key={m.id}
            id={`mode-tab-${m.id}`}
            className={`mode-tab ${mode === m.id ? m.activeClass : ''}`}
            onClick={() => { setMode(m.id); setResult(null); }}
          >
            <Icon size={14} />
            {m.label}
            {m.live && <span className="mode-live-badge">LIVE</span>}
          </button>
        );
      })}
    </div>
  );
}
