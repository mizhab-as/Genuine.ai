import React from 'react';

export default function HeroSection() {
  return (
    <div className="hero">
      <div className="hero-layout">
        <div>
          <div className="hero-eyebrow">IEEE ACCESS 2024 · DUAL-SIGNAL FORENSICS</div>
          <h1 className="hero-h1">
            Verify<br />
            <span className="highlight">what's real.</span>
          </h1>
          <p className="hero-sub">
            CNN classification and DCT spectral analysis, cross-examined and weighted into a single, explainable verdict — in under 40ms.
          </p>
        </div>

        {/* Art & Scanner Widget from genuine_ai_landing.html */}
        <div className="hero-art-wrap">
          <div className="chip" style={{ '--rot': '-8deg', top: '-6px', left: '0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2f4d46" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <div className="chip dark" style={{ '--rot': '10deg', top: '30px', right: '-10px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f3ede0" strokeWidth="1.8">
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div className="chip" style={{ '--rot': '6deg', bottom: '15px', left: '-10px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2f4d46" strokeWidth="1.8">
              <path d="M3 12h4l2-6 4 12 2-6h6"/>
            </svg>
          </div>
          <div className="blob">
            <div className="blob-inner"></div>
            <div className="scan-frame"></div>
            <div className="scan-face"></div>
            <div className="scan-line"></div>
            <div className="scan-crosshair a">
              <svg viewBox="0 0 26 26" fill="none" stroke="#2f4d46" strokeWidth="1.4">
                <path d="M2 9V2h7M17 2h7v7M24 17v7h-7M9 24H2v-7"/>
              </svg>
            </div>
            <div className="scan-crosshair b">
              <svg viewBox="0 0 26 26" fill="none" stroke="#2f4d46" strokeWidth="1.4">
                <path d="M2 9V2h7M17 2h7v7M24 17v7h-7M9 24H2v-7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
