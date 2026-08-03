import React, { useState } from 'react';
import { X, ExternalLink, Copy, Code2, Cpu, Check, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DeveloperDrawer() {
  const { drawerOpen, setDrawerOpen, copied, copySnippet, API_BASE_URL } = useApp();
  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'specs'

  if (!drawerOpen) return null;

  const curlSingle = `curl -X POST "${API_BASE_URL}/api/v1/analyze" \\
  -H "accept: application/json" \\
  -F "file=@photo.jpg"`;

  const curlBatch = `curl -X POST "${API_BASE_URL}/api/v1/analyze-batch" \\
  -F "files=@img1.jpg" \\
  -F "files=@img2.jpg"`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(28, 36, 32, 0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 540, height: '100%',
          background: 'var(--card-bg, #ffffff)', color: 'var(--text-primary)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid rgba(47,77,70,0.2)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px', borderBottom: '1px solid rgba(28,36,32,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--forest)', color: 'var(--cream)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={22} color="var(--teal)" />
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--cream)', margin: 0 }}>
                Developer Resources & Specs
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(243,237,224,0.7)', margin: 0 }}>
                v1.1.0 · FastAPI · CIFAKE CNN · DCT/FFT Fusion
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cream)', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex', padding: '8px 24px', gap: 8, background: '#f8f5f0',
            borderBottom: '1px solid rgba(28,36,32,0.08)'
          }}
        >
          <button
            onClick={() => setActiveTab('api')}
            style={{
              padding: '8px 16px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              background: activeTab === 'api' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'api' ? 'var(--cream)' : 'var(--text-dim)'
            }}
          >
            <Code2 size={13} /> REST API & cURL
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '8px 16px', borderRadius: 20, border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              background: activeTab === 'specs' ? 'var(--forest)' : 'transparent',
              color: activeTab === 'specs' ? 'var(--cream)' : 'var(--text-dim)'
            }}
          >
            <Layers size={13} /> Model & DCT Specs
          </button>
        </div>

        {/* Drawer Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {activeTab === 'api' ? (
            <>
              {/* Endpoint 1 */}
              <div className="card" style={{ padding: 18, background: '#faf8f5', border: '1px solid rgba(47,77,70,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--teal)', background: 'rgba(79,174,138,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                      POST
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, marginLeft: 8, color: 'var(--ink)' }}>
                      /api/v1/analyze
                    </span>
                  </div>
                  <a
                    href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                  >
                    Swagger <ExternalLink size={11} />
                  </a>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
                  General image authenticity analysis. Computes GenuineCoreCNN conv activations, off-axis FFT periodicity z-scores, and Grad-CAM++ thermal maps.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>cURL SNIPPET</span>
                  <button
                    onClick={() => copySnippet(curlSingle)}
                    style={{ background: 'none', border: 'none', color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="code-block" style={{ fontSize: 11, margin: 0, padding: 12 }}>
                  <span className="c-cyan">curl</span> -X POST <span className="c-amber">"{API_BASE_URL}/api/v1/analyze"</span> \{'\n'}
                  {'  '}-F <span className="c-amber">"file=@photo.jpg"</span>
                </pre>
              </div>

              {/* Endpoint 2 — Batch */}
              <div className="card" style={{ padding: 18, background: '#faf8f5', border: '1px solid rgba(47,77,70,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--teal)', background: 'rgba(79,174,138,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                      POST
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, marginLeft: 8, color: 'var(--ink)' }}>
                      /api/v1/analyze-batch
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
                  Batch verification endpoint. Scans up to 5 image files in parallel and returns aggregated authenticity metrics.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>BATCH cURL</span>
                  <button
                    onClick={() => copySnippet(curlBatch)}
                    style={{ background: 'none', border: 'none', color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <pre className="code-block" style={{ fontSize: 11, margin: 0, padding: 12 }}>
                  <span className="c-cyan">curl</span> -X POST <span className="c-amber">"{API_BASE_URL}/api/v1/analyze-batch"</span> \{'\n'}
                  {'  '}-F <span className="c-amber">"files=@img1.jpg"</span> -F <span className="c-amber">"files=@img2.jpg"</span>
                </pre>
              </div>
            </>
          ) : (
            <>
              {/* Architecture specs */}
              <div className="card" style={{ padding: 18, background: '#faf8f5', border: '1px solid rgba(47,77,70,0.15)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
                  Dual-Signal Fusion Architecture
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>
                  Every analysis fuses two independent mathematical signals to verify pixel authenticity:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: 10, background: '#fff', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>
                      1. GenuineCoreCNN (CIFAKE Architecture)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                      2-Layer CNN (Conv2d 3→32→64, AdaptiveAvgPool 8×8, Dense 4096→128→2) with Temperature Scaling (T=1.5).
                    </div>
                  </div>
                  <div style={{ padding: 10, background: '#fff', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>
                      2. Off-Axis FFT & DCT Spectral Analysis
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                      Calculates high-frequency spectral z-score while masking cardinal axes ($f_x=0, f_y=0$) to prevent horizon line false positives.
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 18, background: '#faf8f5', border: '1px solid rgba(47,77,70,0.15)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
                  Active Model Registry
                </h4>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ padding: 8, background: '#fff', borderRadius: 6 }}>
                    <strong>active_model:</strong> genuine-core-v1
                  </div>
                  <div style={{ padding: 8, background: '#fff', borderRadius: 6 }}>
                    <strong>accuracy:</strong> 93.4% (CIFAKE benchmark)
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
