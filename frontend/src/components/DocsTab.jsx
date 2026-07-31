import React from 'react';

export default function DocsTab() {
  return (
    <div className="container page-content">
      <div className="docs-hero">
        <h2 className="docs-title" style={{ fontFamily: 'var(--font-display)' }}>
          System{' '}
          <span style={{ background: 'linear-gradient(135deg,#22d3ee,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Architecture
          </span>
        </h2>
        <p className="docs-sub">
          CIFAKE CNN · DCT Frequency Analysis · Grad-CAM++ · FastAPI REST · Bird & Lotfi (IEEE Access, 2024)
        </p>
      </div>

      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-tile">
            <p className="stat-number" style={{ color: '#22d3ee' }}>120 K</p>
            <p className="stat-label">CIFAKE Training Pairs (60K Real + 60K Diffusion)</p>
          </div>
          <div className="stat-tile">
            <p className="stat-number" style={{ color: '#10b981' }}>~93%</p>
            <p className="stat-label">CNN Classification Accuracy on CIFAKE Benchmark</p>
          </div>
          <div className="stat-tile">
            <p className="stat-number" style={{ color: '#a855f7' }}>2+1</p>
            <p className="stat-label">Fused Signals: CNN + DCT Frequency Analysis</p>
          </div>
        </div>

        {/* Detection Signal Fusion */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Detection Signal Fusion
          </h3>
          <div className="fusion-diagram">
            <div className="fusion-signal">
              <span className="fusion-signal-label" style={{ color: '#22d3ee' }}>CNN Signal (55%)</span>
              <p>GenuineCoreCNN conv activation → Softmax → prob_ai</p>
            </div>
            <div className="fusion-plus">+</div>
            <div className="fusion-signal">
              <span className="fusion-signal-label" style={{ color: '#f59e0b' }}>DCT Signal (45%)</span>
              <p>High-freq ratio + spectral entropy + FFT periodicity → freq_ai_score</p>
            </div>
            <div className="fusion-plus">=</div>
            <div className="fusion-signal fusion-result">
              <span className="fusion-signal-label" style={{ color: '#a855f7' }}>Fused Verdict</span>
              <p>Weighted average → boundary-distance confidence → Grad-CAM++ explanation</p>
            </div>
          </div>
        </div>

        {/* Neural Network Pipeline */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Neural Network Pipeline
          </h3>
          <div className="arch-diagram">
            <span style={{ color: '#94a3b8' }}>Input Image</span>{' '}(3 × 64 × 64 RGB){'\n'}
            {'  '}│{'\n'}
            {'  '}├─▶ <span style={{ color: '#22d3ee' }}>Conv2D</span>{' '}(3→32, k=3) + BatchNorm2d + ReLU + MaxPool2d(2×2){'\n'}
            {'  '}│{'\n'}
            {'  '}├─▶ <span style={{ color: '#22d3ee' }}>Conv2D</span>{' '}(32→64, k=3) + BatchNorm2d + ReLU + MaxPool2d(2×2){'\n'}
            {'  '}│{'      '}└── <span style={{ color: '#f59e0b' }}>◀ Grad-CAM++ Target Layer</span>{'\n'}
            {'  '}│{'\n'}
            {'  '}├─▶ <span style={{ color: '#a855f7' }}>TemperatureScaling</span>{' (T=1.5 → calibrated confidence)\n'}
            {'  '}│{'\n'}
            {'  '}└─▶ <span style={{ color: '#10b981' }}>Softmax</span>{'  '}
            <span style={{ color: '#94a3b8' }}>[0: Genuine  |  1: AI-Generated]</span>
          </div>
        </div>

        {/* DCT Frequency Analysis */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            DCT Frequency Analysis Signal
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
            AI-generated images produced by latent diffusion models exhibit characteristic
            {' '}<strong style={{ color: 'var(--text-primary)' }}>high-frequency grid artifacts in DCT space</strong>,
            reduced spectral entropy, and periodic regularity from the latent grid. This signal
            operates independently of CNN weights — providing real detection without trained checkpoint.
          </p>
          <div className="dct-metrics-row">
            {[
              { name: 'High-Freq Ratio', ai: '>0.35', real: '<0.25', color: '#f43f5e' },
              { name: 'Spectral Entropy', ai: 'lower (smooth)', real: 'higher (organic)', color: '#10b981' },
              { name: 'FFT Periodicity', ai: 'high peak', real: 'uniform', color: '#f59e0b' },
            ].map(m => (
              <div key={m.name} className="dct-metric-card">
                <p className="dct-metric-name" style={{ color: m.color }}>{m.name}</p>
                <p className="dct-metric-row"><span className="dct-label ai">AI</span> {m.ai}</p>
                <p className="dct-metric-row"><span className="dct-label real">Real</span> {m.real}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Foundation */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Research Foundation — CIFAKE (IEEE Access, 2024)
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Bird & Lotfi demonstrated that latent-diffusion AI models leave distinct micro-artifacts in{' '}
            <strong style={{ color: 'var(--text-primary)' }}>background textures and smooth gradients</strong>{' '}
            rather than main subjects. Grad-CAM gradient-weighted Class Activation Mapping on the final
            convolutional layer produces high-resolution spatial attention maps that turn each detection
            decision from an opaque confidence score into{' '}
            <strong style={{ color: 'var(--text-primary)' }}>verifiable visual evidence</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
