import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApiTab() {
  const { copied, copySnippet, API_BASE_URL } = useApp();

  const curlSnippet = `curl -X POST "${API_BASE_URL}/api/v1/analyze" \\
  -H "accept: application/json" \\
  -F "file=@photo.jpg"`;

  const curlBatch = `curl -X POST "${API_BASE_URL}/api/v1/analyze-batch" \\
  -F "files=@img1.jpg" \\
  -F "files=@img2.jpg" \\
  -F "files=@img3.jpg"`;

  return (
    <div className="container page-content">
      <div className="api-hero">
        <h2 className="api-title" style={{ fontFamily: 'var(--font-display)' }}>
          REST API{' '}
          <span style={{ background: 'linear-gradient(135deg,#22d3ee,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Reference
          </span>
        </h2>
        <p className="api-sub">
          Integrate Genuine.ai into any pipeline — newsrooms, trust & safety, mobile apps.
          All endpoints return <code className="mono">request_id</code> for tracing.
        </p>
      </div>

      <div className="api-card" style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Endpoint 1 */}
        <div className="endpoint-header">
          <div>
            <p className="endpoint-label">POST /api/v1/analyze</p>
            <p className="endpoint-title">Single Image — CNN + DCT Fusion Detection</p>
          </div>
          <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer" className="btn-docs">
            Swagger Docs <ExternalLink size={13} />
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div className="code-block-header">
              <span className="code-block-label">cURL</span>
              <button className="btn-copy" onClick={() => copySnippet(curlSnippet)}>
                <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="code-block">
              <span className="c-cyan">curl</span>{' '}
              -X POST{' '}
              <span className="c-amber">"{API_BASE_URL}/api/v1/analyze"</span>{' \\'}
              {'\n'}
              {'  '}-F{' '}
              <span className="c-amber">"file=@photo.jpg"</span>
            </pre>
          </div>

          <div>
            <div className="code-block-header">
              <span className="code-block-label">JSON Response (v1.1)</span>
            </div>
            <pre className="code-block">
{`{
  `}<span className="c-cyan">"request_id"</span>{`: `}<span className="c-green">"req_4a7f29b1c3d0"</span>{`,
  `}<span className="c-cyan">"verdict"</span>{`: `}<span className="c-green">"ai_generated"</span>{`,
  `}<span className="c-cyan">"confidence"</span>{`: `}<span className="c-amber">0.9142</span>{`,
  `}<span className="c-cyan">"frequency_analysis"</span>{`: {
    `}<span className="c-cyan">"grid_artifact_score"</span>{`: `}<span className="c-amber">0.62</span>{`,
    `}<span className="c-cyan">"freq_ai_score"</span>{`: `}<span className="c-amber">0.71</span>{`,
    `}<span className="c-cyan">"spectral_entropy"</span>{`: `}<span className="c-amber">0.34</span>
{`  },
  `}<span className="c-cyan">"cnn_weight"</span>{`: `}<span className="c-amber">0.55</span>{`,
  `}<span className="c-cyan">"freq_weight"</span>{`: `}<span className="c-amber">0.45</span>
{`}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 2 — Batch */}
        <div className="endpoint-header" style={{ marginTop: 28 }}>
          <div>
            <p className="endpoint-label">POST /api/v1/analyze-batch</p>
            <p className="endpoint-title">Batch — Up to 5 images, analyzed in parallel</p>
          </div>
        </div>
        <div>
          <div className="code-block-header">
            <span className="code-block-label">cURL (batch)</span>
            <button className="btn-copy" onClick={() => copySnippet(curlBatch)}>
              <Copy size={11} /> Copy
            </button>
          </div>
          <pre className="code-block">
            <span className="c-cyan">curl</span>{' -X POST '}<span className="c-amber">"{API_BASE_URL}/api/v1/analyze-batch"</span>{' \\\n'}
            {'  '}-F <span className="c-amber">"files=@img1.jpg"</span>{' -F '}<span className="c-amber">"files=@img2.jpg"</span>
          </pre>
        </div>
      </div>
    </div>
  );
}
