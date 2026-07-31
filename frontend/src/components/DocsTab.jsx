import React from 'react';

export default function DocsTab() {
  return (
    <div className="container page-content">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="section-eyebrow">SYSTEM DESIGN & MATHEMATICAL FOUNDATION</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--forest)', margin: '10px 0' }}>
          Architecture, laid bare
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Every request moves through a typed FastAPI layer, a PyTorch classifier, and a SciPy spectral engine before returning a fully explainable JSON report.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Signal Grid from genuine_ai_landing.html */}
        <div className="signal-grid">
          <div className="signal-card">
            <div className="signal-badge">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="14" rx="2"/>
                <path d="M3 15l5-5 4 4 4-6 5 7"/>
              </svg>
            </div>
            <h3>CNN Classifier</h3>
            <p>2-layer Conv2D network with temperature-scaled confidence and Grad-CAM++ attention mapping.</p>
            <div className="weight-tag">WEIGHT · 0.55</div>
          </div>

          <div className="signal-card">
            <div className="signal-badge">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                <path d="M3 17l4-8 4 5 3-9 4 6 3-3"/>
              </svg>
            </div>
            <h3>DCT Spectral Engine</h3>
            <p>FFT-based frequency analysis surfacing periodic grid artifacts invisible to the human eye.</p>
            <div className="weight-tag">WEIGHT · 0.45</div>
          </div>

          <div className="signal-card">
            <div className="signal-badge">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8"/>
                <path d="M12 8v4l3 2"/>
              </svg>
            </div>
            <h3>Fusion Engine</h3>
            <p>Weighted blend of both independent signals into one confidence score in 38ms average.</p>
            <div className="weight-tag">LATENCY · 38.4MS</div>
          </div>
        </div>

        {/* Pipeline Quote Block from genuine_ai_landing.html */}
        <div className="card" style={{ background: 'var(--ink)', color: 'var(--cream)', marginBottom: 28, borderRadius: 24, padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.5, color: 'var(--cream)' }}>
                "If you're building anything that touches identity or trust — onboarding, journalism, evidence — you need a detection layer that shows its work, not just a black-box score."
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', marginTop: 14, letterSpacing: '0.04em' }}>
                RESEARCH TEAM · GENUINE.AI · IEEE ACCESS 2024
              </div>
            </div>
            <div className="pipeline-vis">
              <span className="pipe-node">POST /analyze</span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-node">CNN + DCT</span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-node">JSON Report</span>
            </div>
          </div>
        </div>

        {/* DCT Frequency Thresholds Table */}
        <div className="card" style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            DCT Spectral Analysis Signal Reference
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16 }}>
            Latent diffusion AI models leave distinct high-frequency grid micro-artifacts in DCT frequency space. This signal runs via SciPy without requiring trained model weights.
          </p>
          <div className="dct-metrics-row">
            {[
              { name: 'High-Freq Ratio', ai: '>0.35', real: '<0.25', color: 'var(--brick)' },
              { name: 'Spectral Entropy', ai: 'lower (smooth)', real: 'higher (organic)', color: 'var(--teal)' },
              { name: 'FFT Periodicity', ai: 'high peak', real: 'uniform', color: 'var(--amber)' },
            ].map(m => (
              <div key={m.name} className="dct-metric-card">
                <p className="dct-metric-name" style={{ color: m.color }}>{m.name}</p>
                <p className="dct-metric-row"><span className="dct-label ai">AI</span> {m.ai}</p>
                <p className="dct-metric-row"><span className="dct-label real">Real</span> {m.real}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
