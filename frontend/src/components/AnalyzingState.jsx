import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AnalyzingState({ progress }) {
  return (
    <div className="card analyzing-state" style={{ minHeight: 440 }}>
      <div className="spinner-ring">
        <div className="spinner-ring-outer" />
        <div className="spinner-ring-icon"><ShieldCheck size={28} /></div>
      </div>
      <p className="analyzing-title">Running Forensic Analysis</p>
      <p className="analyzing-progress">{progress}</p>
      <p className="analyzing-sub">CNN + DCT Frequency Fusion → Grad-CAM++ Spatial Activation</p>
      <div className="analyzing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}
